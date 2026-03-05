"""
Seed Data for StatutePro Legal CMS
===================================
Creates realistic test data reflecting common lawyer user journeys:

1. LOGIN/DASHBOARD: Users with different roles viewing active cases
2. CLIENT INTAKE: Clients at various stages (prospect → active → former)
3. CASE SETUP: Matters across practice areas with deadlines & tasks
4. DAILY WORK: Time entries, document management, task tracking
5. BILLING/CLOSE: Invoices, payments, and trust account transactions

This mirrors real-world workflows in systems like Clio, WakiliCMS, and Lawcus.
"""
import asyncio
import random
from datetime import date, datetime, timedelta
from uuid import uuid4
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.client import Client, ClientType, ClientStatus
from app.models.matter import Matter, MatterStatus, BillingType, PracticeArea
from app.models.contact import Contact
from app.models.document import Document, DocumentCategory
from app.models.time_entry import TimeEntry, TimeEntryStatus
from app.models.invoice import Invoice, InvoiceStatus, InvoiceLineItem, Payment, PaymentMethod
from app.models.trust_account import TrustAccount, TrustAccountType, TrustTransaction, TransactionType, ClientTrustLedger
from app.models.task import Task, TaskStatus, TaskPriority, TaskCategory
from app.models.audit import AuditLog, AuditAction


# ============================================================================
# USER DATA - Law Firm Staff (Reflects real firm hierarchy)
# ============================================================================
USERS_DATA = [
    # Partners (Senior attorneys who own the firm)
    {
        "email": "james.mwangi@statutepro.co.ke",
        "first_name": "James",
        "last_name": "Mwangi",
        "phone": "+254 722 123 456",
        "title": "Managing Partner",
        "bio": "20+ years experience in corporate law and M&A. Admitted to the Kenya Bar in 2004.",
        "role": UserRole.PARTNER,
        "hourly_rate": 5000000,  # 50,000 KES/hour in cents
        "is_verified": True,
    },
    {
        "email": "grace.wanjiku@statutepro.co.ke",
        "first_name": "Grace",
        "last_name": "Wanjiku",
        "phone": "+254 733 234 567",
        "title": "Senior Partner - Litigation",
        "bio": "Specializes in commercial litigation and dispute resolution. Former High Court judge's clerk.",
        "role": UserRole.PARTNER,
        "hourly_rate": 4500000,  # 45,000 KES/hour
        "is_verified": True,
    },
    # Associates (Junior attorneys)
    {
        "email": "david.ochieng@statutepro.co.ke",
        "first_name": "David",
        "last_name": "Ochieng",
        "phone": "+254 722 345 678",
        "title": "Senior Associate",
        "bio": "5 years experience in real estate and conveyancing. LLM from University of Nairobi.",
        "role": UserRole.ASSOCIATE,
        "hourly_rate": 2500000,  # 25,000 KES/hour
        "is_verified": True,
    },
    {
        "email": "faith.njeri@statutepro.co.ke",
        "first_name": "Faith",
        "last_name": "Njeri",
        "phone": "+254 733 456 789",
        "title": "Associate",
        "bio": "3 years experience in family law and employment matters. Active member of LSK Young Lawyers Committee.",
        "role": UserRole.ASSOCIATE,
        "hourly_rate": 1800000,  # 18,000 KES/hour
        "is_verified": True,
    },
    # Paralegals
    {
        "email": "peter.kamau@statutepro.co.ke",
        "first_name": "Peter",
        "last_name": "Kamau",
        "phone": "+254 722 567 890",
        "title": "Senior Paralegal",
        "bio": "10 years experience in legal research and document preparation. Diploma in Paralegal Studies.",
        "role": UserRole.PARALEGAL,
        "hourly_rate": 500000,  # 5,000 KES/hour
        "is_verified": True,
    },
    {
        "email": "mary.akinyi@statutepro.co.ke",
        "first_name": "Mary",
        "last_name": "Akinyi",
        "phone": "+254 733 678 901",
        "title": "Paralegal",
        "bio": "Court filing specialist. 5 years experience with High Court procedures.",
        "role": UserRole.PARALEGAL,
        "hourly_rate": 350000,  # 3,500 KES/hour
        "is_verified": True,
    },
    # Staff
    {
        "email": "susan.wambui@statutepro.co.ke",
        "first_name": "Susan",
        "last_name": "Wambui",
        "phone": "+254 722 789 012",
        "title": "Office Administrator",
        "bio": "Manages client intake, scheduling, and firm operations.",
        "role": UserRole.STAFF,
        "hourly_rate": None,
        "is_verified": True,
    },
    # Admin
    {
        "email": "admin@statutepro.co.ke",
        "first_name": "System",
        "last_name": "Administrator",
        "phone": "+254 700 000 000",
        "title": "System Administrator",
        "bio": "IT and system administration.",
        "role": UserRole.ADMIN,
        "hourly_rate": None,
        "is_verified": True,
    },
]


# ============================================================================
# CLIENT DATA - Various client types and statuses
# ============================================================================
CLIENTS_DATA = [
    # Active Corporate Clients
    {
        "name": "Safaricom PLC",
        "client_number": "CLI-2024-001",
        "client_type": ClientType.CORPORATION,
        "status": ClientStatus.ACTIVE,
        "email": "legal@safaricom.co.ke",
        "phone": "+254 722 000 100",
        "website": "https://www.safaricom.co.ke",
        "address_line1": "Safaricom House, Waiyaki Way",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00100",
        "country": "Kenya",
        "industry": "Telecommunications",
        "tax_id": "P051234567A",
        "default_billing_rate": 5000000,
        "payment_terms_days": 30,
        "conflict_check_completed": True,
        "notes": "Long-term client since 2018. Primary contacts: Legal Director and Company Secretary.",
    },
    {
        "name": "Kenya Commercial Bank Limited",
        "client_number": "CLI-2024-002",
        "client_type": ClientType.CORPORATION,
        "status": ClientStatus.ACTIVE,
        "email": "companysecretary@kcbgroup.com",
        "phone": "+254 711 087 000",
        "website": "https://www.kcbgroup.com",
        "address_line1": "Kencom House, Moi Avenue",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00100",
        "country": "Kenya",
        "industry": "Banking & Financial Services",
        "tax_id": "P051234568B",
        "default_billing_rate": 4500000,
        "payment_terms_days": 45,
        "conflict_check_completed": True,
        "notes": "Banking litigation and regulatory compliance matters.",
    },
    {
        "name": "Twiga Foods Limited",
        "client_number": "CLI-2024-003",
        "client_type": ClientType.LLC,
        "status": ClientStatus.ACTIVE,
        "email": "legal@twiga.com",
        "phone": "+254 709 000 000",
        "website": "https://www.twiga.com",
        "address_line1": "Likoni Road, Industrial Area",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00501",
        "country": "Kenya",
        "industry": "AgriTech / Logistics",
        "tax_id": "P051234569C",
        "default_billing_rate": 3500000,
        "payment_terms_days": 30,
        "conflict_check_completed": True,
        "notes": "Fast-growing startup. Employment and commercial contracts focus.",
    },
    # Individual Clients
    {
        "name": "John Kariuki Maina",
        "client_number": "CLI-2024-004",
        "client_type": ClientType.INDIVIDUAL,
        "status": ClientStatus.ACTIVE,
        "email": "jkariuki@gmail.com",
        "phone": "+254 722 111 222",
        "address_line1": "Kileleshwa, Oloitokitok Road",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00100",
        "country": "Kenya",
        "industry": None,
        "default_billing_rate": 2500000,
        "payment_terms_days": 14,
        "conflict_check_completed": True,
        "notes": "Property dispute matter. Referred by KCB Legal.",
    },
    {
        "name": "Amina Hassan Mohamed",
        "client_number": "CLI-2024-005",
        "client_type": ClientType.INDIVIDUAL,
        "status": ClientStatus.ACTIVE,
        "email": "amina.hassan@yahoo.com",
        "phone": "+254 733 222 333",
        "address_line1": "Parklands, 3rd Avenue",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00623",
        "country": "Kenya",
        "industry": None,
        "default_billing_rate": 1800000,
        "payment_terms_days": 14,
        "conflict_check_completed": True,
        "notes": "Divorce and child custody matter. Sensitive - requires partner handling.",
    },
    # Prospect (Client intake in progress)
    {
        "name": "Nairobi City Water & Sewerage Company",
        "client_number": "CLI-2024-006",
        "client_type": ClientType.GOVERNMENT,
        "status": ClientStatus.PROSPECT,
        "email": "legal@nairobiwater.co.ke",
        "phone": "+254 719 070 000",
        "address_line1": "Kampala Road",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00100",
        "country": "Kenya",
        "industry": "Public Utilities",
        "default_billing_rate": 4000000,
        "payment_terms_days": 60,
        "conflict_check_completed": False,
        "notes": "Potential procurement dispute matter. Awaiting conflict check and engagement letter.",
    },
    # Former Client
    {
        "name": "Mombasa Cement Limited",
        "client_number": "CLI-2023-015",
        "client_type": ClientType.CORPORATION,
        "status": ClientStatus.FORMER,
        "email": "legal@mombasacement.co.ke",
        "phone": "+254 722 999 888",
        "address_line1": "Port Reitz",
        "city": "Mombasa",
        "state": "Mombasa County",
        "postal_code": "80100",
        "country": "Kenya",
        "industry": "Manufacturing",
        "default_billing_rate": 3500000,
        "payment_terms_days": 30,
        "conflict_check_completed": True,
        "notes": "Employment tribunal matter concluded in 2023. All invoices paid.",
    },
    # Partnership
    {
        "name": "Ochieng & Kamau Advocates",
        "client_number": "CLI-2024-007",
        "client_type": ClientType.PARTNERSHIP,
        "status": ClientStatus.ACTIVE,
        "email": "partners@okadvocates.co.ke",
        "phone": "+254 722 444 555",
        "address_line1": "ICEA Building, Kenyatta Avenue",
        "city": "Nairobi",
        "state": "Nairobi County",
        "postal_code": "00100",
        "country": "Kenya",
        "industry": "Legal Services",
        "default_billing_rate": 3000000,
        "payment_terms_days": 30,
        "conflict_check_completed": True,
        "notes": "Sister firm. Tax planning and partnership restructuring.",
    },
]


# ============================================================================
# MATTER DATA - Cases across practice areas (The core of legal work)
# ============================================================================
def get_matters_data(clients_map, users_map):
    """Generate matters linked to clients and attorneys."""
    today = date.today()
    
    return [
        # Active Corporate Matter - M&A Deal
        {
            "matter_number": "MAT-2024-0001",
            "name": "Safaricom - TechStartup Acquisition",
            "description": "Acquisition of local tech startup. Due diligence, share purchase agreement, and regulatory approvals.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.CORPORATE,
            "open_date": today - timedelta(days=45),
            "client_id": clients_map["CLI-2024-001"],
            "responsible_attorney_id": users_map["james.mwangi@statutepro.co.ke"],
            "billing_type": BillingType.HOURLY,
            "budget_amount": 500000000,  # 5M KES budget
            "jurisdiction": "Kenya",
            "notes": "Phase 1 DD complete. Awaiting Competition Authority approval.",
        },
        # Active Litigation
        {
            "matter_number": "MAT-2024-0002",
            "name": "KCB vs. Kariuki - Loan Recovery",
            "description": "Commercial debt recovery. Defendant defaulted on KES 15M business loan.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.LITIGATION,
            "open_date": today - timedelta(days=90),
            "statute_of_limitations": today + timedelta(days=365),
            "client_id": clients_map["CLI-2024-002"],
            "responsible_attorney_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "billing_type": BillingType.HOURLY,
            "jurisdiction": "Kenya",
            "court": "High Court of Kenya - Commercial Division",
            "case_number": "HCCC/2024/0145",
            "judge": "Hon. Justice M. Ngugi",
            "opposing_party": "Kariuki Enterprises Limited",
            "opposing_counsel": "Muturi & Associates",
            "notes": "Plaint filed. Awaiting defence. Next mention: 15th March 2026.",
        },
        # Real Estate Conveyancing
        {
            "matter_number": "MAT-2024-0003",
            "name": "Kariuki - Kileleshwa Property Purchase",
            "description": "Conveyancing for residential property purchase. 4-bedroom house in Kileleshwa.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.REAL_ESTATE,
            "open_date": today - timedelta(days=30),
            "client_id": clients_map["CLI-2024-004"],
            "responsible_attorney_id": users_map["david.ochieng@statutepro.co.ke"],
            "billing_type": BillingType.FIXED,
            "budget_amount": 15000000,  # 150K KES fixed fee
            "jurisdiction": "Kenya",
            "notes": "Title search complete. Drafting sale agreement.",
        },
        # Family Law - Divorce
        {
            "matter_number": "MAT-2024-0004",
            "name": "Mohamed - Divorce Proceedings",
            "description": "Contested divorce with child custody and property division.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.FAMILY,
            "open_date": today - timedelta(days=60),
            "client_id": clients_map["CLI-2024-005"],
            "responsible_attorney_id": users_map["faith.njeri@statutepro.co.ke"],
            "billing_type": BillingType.HOURLY,
            "jurisdiction": "Kenya",
            "court": "Milimani Law Courts - Family Division",
            "case_number": "FD/2024/0089",
            "judge": "Hon. A. Sitati",
            "opposing_party": "Hassan Ahmed Mohamed",
            "opposing_counsel": "Wairimu & Co. Advocates",
            "notes": "Mediation scheduled for 1st March 2026. Custody report pending.",
        },
        # Employment Matter - Twiga
        {
            "matter_number": "MAT-2024-0005",
            "name": "Twiga - Employee Handbook Review",
            "description": "Comprehensive review and update of employee handbook and HR policies.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.EMPLOYMENT,
            "open_date": today - timedelta(days=14),
            "client_id": clients_map["CLI-2024-003"],
            "responsible_attorney_id": users_map["faith.njeri@statutepro.co.ke"],
            "billing_type": BillingType.FIXED,
            "budget_amount": 25000000,  # 250K KES
            "notes": "First draft delivered. Awaiting client feedback.",
        },
        # Pending/Intake Matter
        {
            "matter_number": "MAT-2024-0006",
            "name": "Nairobi Water - Procurement Dispute",
            "description": "Potential challenge to tender award for water pipe supply contract.",
            "status": MatterStatus.INTAKE,
            "practice_area": PracticeArea.LITIGATION,
            "open_date": today - timedelta(days=5),
            "client_id": clients_map["CLI-2024-006"],
            "responsible_attorney_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "billing_type": BillingType.CONTINGENCY,
            "notes": "Initial consultation done. Awaiting engagement letter signature.",
        },
        # On Hold
        {
            "matter_number": "MAT-2024-0007",
            "name": "O&K Advocates - Tax Restructuring",
            "description": "Partnership tax restructuring for optimal VAT and income tax treatment.",
            "status": MatterStatus.ON_HOLD,
            "practice_area": PracticeArea.TAX,
            "open_date": today - timedelta(days=120),
            "client_id": clients_map["CLI-2024-007"],
            "responsible_attorney_id": users_map["james.mwangi@statutepro.co.ke"],
            "billing_type": BillingType.HOURLY,
            "notes": "On hold pending KRA guidance on new regulations.",
        },
        # Closed Matter
        {
            "matter_number": "MAT-2023-0089",
            "name": "Mombasa Cement - Wrongful Dismissal Claim",
            "description": "Defence against former employee wrongful dismissal claim at Employment Court.",
            "status": MatterStatus.CLOSED,
            "practice_area": PracticeArea.EMPLOYMENT,
            "open_date": today - timedelta(days=400),
            "close_date": today - timedelta(days=60),
            "client_id": clients_map["CLI-2023-015"],
            "responsible_attorney_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "billing_type": BillingType.HOURLY,
            "jurisdiction": "Kenya",
            "court": "Employment and Labour Relations Court - Mombasa",
            "case_number": "ELRC/E/2023/0156",
            "notes": "Successfully defended. Claim dismissed with costs.",
        },
        # Pro Bono
        {
            "matter_number": "MAT-2024-0008",
            "name": "Legal Aid - Refugee Status Appeal",
            "description": "Pro bono representation for asylum seeker appealing refugee status denial.",
            "status": MatterStatus.ACTIVE,
            "practice_area": PracticeArea.IMMIGRATION,
            "open_date": today - timedelta(days=20),
            "client_id": clients_map["CLI-2024-004"],  # Using existing individual client
            "responsible_attorney_id": users_map["faith.njeri@statutepro.co.ke"],
            "billing_type": BillingType.PRO_BONO,
            "jurisdiction": "Kenya",
            "court": "Refugee Appeals Board",
            "notes": "LSK Pro Bono Program referral. Appeal hearing scheduled.",
        },
    ]


# ============================================================================
# CONTACT DATA - People at client organizations
# ============================================================================
def get_contacts_data(clients_map):
    """Generate contact persons for clients."""
    return [
        # Safaricom contacts
        {
            "first_name": "Peter",
            "last_name": "Ndegwa",
            "title": "Group CEO",
            "email": "peter.ndegwa@safaricom.co.ke",
            "phone": "+254 722 000 101",
            "mobile": "+254 722 000 102",
            "client_id": clients_map["CLI-2024-001"],
            "is_primary": True,
            "is_billing_contact": False,
            "notes": "Direct line for major matters only.",
        },
        {
            "first_name": "Catherine",
            "last_name": "Muraga",
            "title": "Legal Director",
            "email": "catherine.muraga@safaricom.co.ke",
            "phone": "+254 722 000 110",
            "mobile": "+254 733 000 110",
            "client_id": clients_map["CLI-2024-001"],
            "is_primary": False,
            "is_billing_contact": True,
            "notes": "Day-to-day contact for legal matters.",
        },
        # KCB contacts
        {
            "first_name": "Bonnie",
            "last_name": "Okumu",
            "title": "Company Secretary",
            "email": "bonnie.okumu@kcbgroup.com",
            "phone": "+254 711 087 001",
            "client_id": clients_map["CLI-2024-002"],
            "is_primary": True,
            "is_billing_contact": True,
        },
        # Twiga contacts
        {
            "first_name": "Peter",
            "last_name": "Njonjo",
            "title": "CEO",
            "email": "peter.njonjo@twiga.com",
            "phone": "+254 709 000 001",
            "client_id": clients_map["CLI-2024-003"],
            "is_primary": True,
            "is_billing_contact": False,
        },
        {
            "first_name": "Jane",
            "last_name": "Muthoni",
            "title": "Head of People Operations",
            "email": "jane.muthoni@twiga.com",
            "phone": "+254 709 000 020",
            "client_id": clients_map["CLI-2024-003"],
            "is_primary": False,
            "is_billing_contact": True,
            "notes": "Contact for employment matters.",
        },
    ]


# ============================================================================
# TASK DATA - Workflow and deadline management
# ============================================================================
def get_tasks_data(matters_map, users_map):
    """Generate tasks for matters reflecting real legal workflows."""
    today = date.today()
    
    return [
        # Safaricom M&A Tasks
        {
            "title": "Complete due diligence report",
            "description": "Finalize legal DD report covering corporate structure, contracts, IP, and litigation history.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.REVIEW,
            "due_date": today + timedelta(days=7),
            "start_date": today - timedelta(days=5),
            "estimated_minutes": 1200,
            "matter_id": matters_map["MAT-2024-0001"],
            "assigned_to_id": users_map["david.ochieng@statutepro.co.ke"],
            "created_by_id": users_map["james.mwangi@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Draft Share Purchase Agreement",
            "description": "First draft of SPA incorporating DD findings. Include standard warranties and indemnities.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.DRAFTING,
            "due_date": today + timedelta(days=14),
            "estimated_minutes": 960,
            "matter_id": matters_map["MAT-2024-0001"],
            "assigned_to_id": users_map["james.mwangi@statutepro.co.ke"],
            "created_by_id": users_map["james.mwangi@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Competition Authority filing",
            "description": "Prepare and file merger notification with Competition Authority of Kenya.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "category": TaskCategory.FILING,
            "due_date": today + timedelta(days=21),
            "estimated_minutes": 480,
            "matter_id": matters_map["MAT-2024-0001"],
            "assigned_to_id": users_map["peter.kamau@statutepro.co.ke"],
            "created_by_id": users_map["james.mwangi@statutepro.co.ke"],
            "is_billable": True,
        },
        # KCB Litigation Tasks
        {
            "title": "Review defence and prepare reply",
            "description": "Analyse defendant's statement of defence and draft reply to defence.",
            "status": TaskStatus.BLOCKED,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.DRAFTING,
            "due_date": today + timedelta(days=10),
            "matter_id": matters_map["MAT-2024-0002"],
            "assigned_to_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "created_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Prepare witness statements",
            "description": "Draft witness statements for bank officers who handled the loan account.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "category": TaskCategory.DRAFTING,
            "due_date": today + timedelta(days=30),
            "estimated_minutes": 360,
            "matter_id": matters_map["MAT-2024-0002"],
            "assigned_to_id": users_map["mary.akinyi@statutepro.co.ke"],
            "created_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Court mention - 15 March 2026",
            "description": "Attend court mention. Confirm readiness for pre-trial conference.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.URGENT,
            "category": TaskCategory.MEETING,
            "due_date": date(2026, 3, 15),
            "estimated_minutes": 120,
            "matter_id": matters_map["MAT-2024-0002"],
            "assigned_to_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "created_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "is_billable": True,
        },
        # Real Estate Tasks
        {
            "title": "Conduct title search at lands office",
            "description": "Search at Nairobi Lands Registry. Verify ownership and check for encumbrances.",
            "status": TaskStatus.COMPLETED,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.RESEARCH,
            "due_date": today - timedelta(days=7),
            "completed_at": datetime.now() - timedelta(days=5),
            "actual_minutes": 180,
            "matter_id": matters_map["MAT-2024-0003"],
            "assigned_to_id": users_map["peter.kamau@statutepro.co.ke"],
            "created_by_id": users_map["david.ochieng@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Draft sale agreement",
            "description": "Prepare first draft of sale agreement based on standard conveyancing template.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.DRAFTING,
            "due_date": today + timedelta(days=3),
            "start_date": today - timedelta(days=2),
            "estimated_minutes": 240,
            "matter_id": matters_map["MAT-2024-0003"],
            "assigned_to_id": users_map["david.ochieng@statutepro.co.ke"],
            "created_by_id": users_map["david.ochieng@statutepro.co.ke"],
            "is_billable": True,
        },
        # Family Law Tasks
        {
            "title": "Prepare mediation brief",
            "description": "Draft position paper for mediation. Focus on custody arrangement proposal.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.URGENT,
            "category": TaskCategory.DRAFTING,
            "due_date": today + timedelta(days=5),
            "start_date": today - timedelta(days=1),
            "estimated_minutes": 300,
            "matter_id": matters_map["MAT-2024-0004"],
            "assigned_to_id": users_map["faith.njeri@statutepro.co.ke"],
            "created_by_id": users_map["faith.njeri@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Mediation session - 1 March 2026",
            "description": "Attend court-annexed mediation. Goal: reach custody agreement.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.URGENT,
            "category": TaskCategory.MEETING,
            "due_date": date(2026, 3, 1),
            "estimated_minutes": 240,
            "matter_id": matters_map["MAT-2024-0004"],
            "assigned_to_id": users_map["faith.njeri@statutepro.co.ke"],
            "created_by_id": users_map["faith.njeri@statutepro.co.ke"],
            "is_billable": True,
        },
        # Employment Matter Tasks
        {
            "title": "Review current employee handbook",
            "description": "Detailed review of existing handbook. Flag non-compliant clauses.",
            "status": TaskStatus.COMPLETED,
            "priority": TaskPriority.MEDIUM,
            "category": TaskCategory.REVIEW,
            "due_date": today - timedelta(days=5),
            "completed_at": datetime.now() - timedelta(days=6),
            "actual_minutes": 240,
            "matter_id": matters_map["MAT-2024-0005"],
            "assigned_to_id": users_map["faith.njeri@statutepro.co.ke"],
            "created_by_id": users_map["faith.njeri@statutepro.co.ke"],
            "is_billable": True,
        },
        {
            "title": "Draft updated handbook",
            "description": "New handbook incorporating Employment Act 2007 changes and best practices.",
            "status": TaskStatus.COMPLETED,
            "priority": TaskPriority.HIGH,
            "category": TaskCategory.DRAFTING,
            "due_date": today - timedelta(days=2),
            "completed_at": datetime.now() - timedelta(days=3),
            "actual_minutes": 480,
            "matter_id": matters_map["MAT-2024-0005"],
            "assigned_to_id": users_map["faith.njeri@statutepro.co.ke"],
            "created_by_id": users_map["faith.njeri@statutepro.co.ke"],
            "is_billable": True,
        },
        # Administrative tasks
        {
            "title": "Follow up on engagement letter",
            "description": "Call Nairobi Water legal team to confirm engagement letter signature status.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "category": TaskCategory.FOLLOW_UP,
            "due_date": today + timedelta(days=2),
            "estimated_minutes": 30,
            "matter_id": matters_map["MAT-2024-0006"],
            "assigned_to_id": users_map["susan.wambui@statutepro.co.ke"],
            "created_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
            "is_billable": False,
        },
    ]


# ============================================================================
# TIME ENTRY DATA - Billable hours tracking
# ============================================================================
def get_time_entries_data(matters_map, users_map):
    """Generate time entries for billing."""
    today = date.today()
    
    return [
        # Safaricom M&A - Partner time
        {
            "entry_date": today - timedelta(days=10),
            "duration_minutes": 180,
            "description": "Client meeting to discuss acquisition strategy and timeline. Reviewed target company financials.",
            "activity_code": "A101",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 5000000,  # 50,000 KES/hour
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0001"],
            "user_id": users_map["james.mwangi@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=8),
            "duration_minutes": 240,
            "description": "Review of target company corporate documents. Analysis of shareholding structure.",
            "activity_code": "A102",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 5000000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0001"],
            "user_id": users_map["james.mwangi@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=5),
            "duration_minutes": 120,
            "description": "Conference call with Competition Authority regarding merger notification requirements.",
            "activity_code": "A106",
            "status": TimeEntryStatus.SUBMITTED,
            "hourly_rate": 5000000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0001"],
            "user_id": users_map["james.mwangi@statutepro.co.ke"],
        },
        # M&A - Associate time
        {
            "entry_date": today - timedelta(days=7),
            "duration_minutes": 360,
            "description": "Due diligence: Review of target company contracts. Identified 3 material contracts requiring consent.",
            "activity_code": "A102",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 2500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0001"],
            "user_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=3),
            "duration_minutes": 300,
            "description": "Due diligence: Review of IP portfolio and trademark registrations.",
            "activity_code": "A102",
            "status": TimeEntryStatus.DRAFT,
            "hourly_rate": 2500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0001"],
            "user_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        # KCB Litigation - Partner time
        {
            "entry_date": today - timedelta(days=14),
            "duration_minutes": 120,
            "description": "Drafted and filed plaint at High Court Commercial Division.",
            "activity_code": "L201",
            "status": TimeEntryStatus.BILLED,
            "hourly_rate": 4500000,
            "is_billable": True,
            "is_billed": True,
            "matter_id": matters_map["MAT-2024-0002"],
            "user_id": users_map["grace.wanjiku@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=7),
            "duration_minutes": 90,
            "description": "Review and analysis of defendant's defence. Preparation of strategy memo.",
            "activity_code": "L202",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 4500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0002"],
            "user_id": users_map["grace.wanjiku@statutepro.co.ke"],
        },
        # Litigation - Paralegal
        {
            "entry_date": today - timedelta(days=12),
            "duration_minutes": 60,
            "description": "Court filing - plaint and supporting documents. Paid filing fees.",
            "activity_code": "L210",
            "status": TimeEntryStatus.BILLED,
            "hourly_rate": 350000,
            "is_billable": True,
            "is_billed": True,
            "matter_id": matters_map["MAT-2024-0002"],
            "user_id": users_map["mary.akinyi@statutepro.co.ke"],
        },
        # Real Estate - Associate
        {
            "entry_date": today - timedelta(days=5),
            "duration_minutes": 90,
            "description": "Attended Nairobi Lands Registry. Conducted official search on Title No. NRB/Block 12/345.",
            "activity_code": "R301",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 2500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0003"],
            "user_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=2),
            "duration_minutes": 180,
            "description": "Drafting sale agreement. Incorporated special conditions per client instructions.",
            "activity_code": "R302",
            "status": TimeEntryStatus.DRAFT,
            "hourly_rate": 2500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0003"],
            "user_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        # Real Estate - Paralegal
        {
            "entry_date": today - timedelta(days=6),
            "duration_minutes": 180,
            "description": "Land search at Nairobi Registry. Obtained certified copy of title.",
            "activity_code": "R301",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 500000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0003"],
            "user_id": users_map["peter.kamau@statutepro.co.ke"],
        },
        # Family Law - Associate
        {
            "entry_date": today - timedelta(days=8),
            "duration_minutes": 150,
            "description": "Initial client consultation. Gathered facts re: marriage, assets, and custody wishes.",
            "activity_code": "F401",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 1800000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0004"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=4),
            "duration_minutes": 240,
            "description": "Drafted divorce petition and affidavit in support. Review of matrimonial property.",
            "activity_code": "F402",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 1800000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0004"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=1),
            "duration_minutes": 120,
            "description": "Preparation of mediation position paper. Research on custody best practices.",
            "activity_code": "F403",
            "status": TimeEntryStatus.DRAFT,
            "hourly_rate": 1800000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0004"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        # Employment - Associate
        {
            "entry_date": today - timedelta(days=10),
            "duration_minutes": 240,
            "description": "Comprehensive review of existing employee handbook. Prepared compliance gap analysis.",
            "activity_code": "E501",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 1800000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0005"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "entry_date": today - timedelta(days=6),
            "duration_minutes": 480,
            "description": "Drafted updated employee handbook. Incorporated new provisions on remote work, data protection, and disciplinary procedures.",
            "activity_code": "E502",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 1800000,
            "is_billable": True,
            "matter_id": matters_map["MAT-2024-0005"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        # Pro bono - tracked but non-billable
        {
            "entry_date": today - timedelta(days=3),
            "duration_minutes": 120,
            "description": "Initial consultation with asylum seeker. Reviewed refugee status denial letter.",
            "activity_code": "PB01",
            "status": TimeEntryStatus.APPROVED,
            "hourly_rate": 0,
            "is_billable": False,
            "matter_id": matters_map["MAT-2024-0008"],
            "user_id": users_map["faith.njeri@statutepro.co.ke"],
        },
    ]


# ============================================================================
# DOCUMENT DATA - File management
# ============================================================================
def get_documents_data(matters_map, users_map):
    """Generate document records for matters."""
    return [
        # Safaricom M&A Documents
        {
            "name": "Due Diligence Report - Draft v1",
            "original_filename": "DD_Report_Safaricom_Acquisition_v1.pdf",
            "file_path": "/documents/mat-2024-0001/dd_report_v1.pdf",
            "file_size": 2560000,  # 2.5 MB
            "mime_type": "application/pdf",
            "description": "Preliminary due diligence findings on target company.",
            "category": DocumentCategory.MEMO,
            "version": 1,
            "matter_id": matters_map["MAT-2024-0001"],
            "uploaded_by_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        {
            "name": "Target Company - Certificate of Incorporation",
            "original_filename": "Target_COI.pdf",
            "file_path": "/documents/mat-2024-0001/target_coi.pdf",
            "file_size": 512000,
            "mime_type": "application/pdf",
            "description": "Certified copy of target company certificate of incorporation.",
            "category": DocumentCategory.CLIENT_DOC,
            "matter_id": matters_map["MAT-2024-0001"],
            "uploaded_by_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        {
            "name": "Target Company - Memorandum & Articles",
            "original_filename": "Target_MemoArts.pdf",
            "file_path": "/documents/mat-2024-0001/target_memoarts.pdf",
            "file_size": 1024000,
            "mime_type": "application/pdf",
            "category": DocumentCategory.CLIENT_DOC,
            "matter_id": matters_map["MAT-2024-0001"],
            "uploaded_by_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        {
            "name": "Competition Authority - Notification Form",
            "original_filename": "CA_Merger_Notification_Form.docx",
            "file_path": "/documents/mat-2024-0001/ca_notification.docx",
            "file_size": 156000,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "description": "Draft merger notification for Competition Authority of Kenya.",
            "category": DocumentCategory.COURT_FILING,
            "matter_id": matters_map["MAT-2024-0001"],
            "uploaded_by_id": users_map["peter.kamau@statutepro.co.ke"],
        },
        # KCB Litigation Documents
        {
            "name": "Plaint - KCB vs Kariuki Enterprises",
            "original_filename": "Plaint_HCCC_2024_0145.pdf",
            "file_path": "/documents/mat-2024-0002/plaint.pdf",
            "file_size": 890000,
            "mime_type": "application/pdf",
            "description": "Filed plaint for loan recovery claim.",
            "category": DocumentCategory.PLEADING,
            "matter_id": matters_map["MAT-2024-0002"],
            "uploaded_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
        },
        {
            "name": "Loan Agreement - KCB/Kariuki",
            "original_filename": "Loan_Agreement_2022.pdf",
            "file_path": "/documents/mat-2024-0002/loan_agreement.pdf",
            "file_size": 1200000,
            "mime_type": "application/pdf",
            "description": "Original loan facility agreement.",
            "category": DocumentCategory.CONTRACT,
            "matter_id": matters_map["MAT-2024-0002"],
            "uploaded_by_id": users_map["mary.akinyi@statutepro.co.ke"],
        },
        {
            "name": "Statement of Defence",
            "original_filename": "Defence_HCCC_2024_0145.pdf",
            "file_path": "/documents/mat-2024-0002/defence.pdf",
            "file_size": 750000,
            "mime_type": "application/pdf",
            "description": "Defendant's filed defence.",
            "category": DocumentCategory.PLEADING,
            "matter_id": matters_map["MAT-2024-0002"],
            "uploaded_by_id": users_map["grace.wanjiku@statutepro.co.ke"],
        },
        # Real Estate Documents
        {
            "name": "Official Land Search - NRB/Block 12/345",
            "original_filename": "Land_Search_Result.pdf",
            "file_path": "/documents/mat-2024-0003/land_search.pdf",
            "file_size": 320000,
            "mime_type": "application/pdf",
            "description": "Official search result from Nairobi Lands Registry.",
            "category": DocumentCategory.EVIDENCE,
            "matter_id": matters_map["MAT-2024-0003"],
            "uploaded_by_id": users_map["peter.kamau@statutepro.co.ke"],
        },
        {
            "name": "Sale Agreement - Draft",
            "original_filename": "Sale_Agreement_Kileleshwa_Draft.docx",
            "file_path": "/documents/mat-2024-0003/sale_agreement_draft.docx",
            "file_size": 245000,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "description": "First draft of property sale agreement.",
            "category": DocumentCategory.CONTRACT,
            "matter_id": matters_map["MAT-2024-0003"],
            "uploaded_by_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        # Family Law Documents
        {
            "name": "Divorce Petition",
            "original_filename": "Petition_FD_2024_0089.pdf",
            "file_path": "/documents/mat-2024-0004/petition.pdf",
            "file_size": 680000,
            "mime_type": "application/pdf",
            "description": "Filed divorce petition.",
            "category": DocumentCategory.PLEADING,
            "matter_id": matters_map["MAT-2024-0004"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "name": "Marriage Certificate",
            "original_filename": "Marriage_Cert_Mohamed.pdf",
            "file_path": "/documents/mat-2024-0004/marriage_cert.pdf",
            "file_size": 156000,
            "mime_type": "application/pdf",
            "category": DocumentCategory.CLIENT_DOC,
            "matter_id": matters_map["MAT-2024-0004"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "name": "Mediation Position Paper - Draft",
            "original_filename": "Mediation_Brief_Draft.docx",
            "file_path": "/documents/mat-2024-0004/mediation_brief.docx",
            "file_size": 189000,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "description": "Draft position paper for upcoming mediation.",
            "category": DocumentCategory.MEMO,
            "matter_id": matters_map["MAT-2024-0004"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        # Employment Documents
        {
            "name": "Employee Handbook - Current Version",
            "original_filename": "Twiga_Employee_Handbook_2023.pdf",
            "file_path": "/documents/mat-2024-0005/handbook_current.pdf",
            "file_size": 2100000,
            "mime_type": "application/pdf",
            "description": "Client's existing employee handbook for review.",
            "category": DocumentCategory.CLIENT_DOC,
            "matter_id": matters_map["MAT-2024-0005"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "name": "Employee Handbook - Updated Draft",
            "original_filename": "Twiga_Employee_Handbook_2024_Draft.docx",
            "file_path": "/documents/mat-2024-0005/handbook_draft.docx",
            "file_size": 2450000,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "description": "Updated handbook with compliance fixes.",
            "category": DocumentCategory.CONTRACT,
            "matter_id": matters_map["MAT-2024-0005"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
        {
            "name": "Compliance Gap Analysis Memo",
            "original_filename": "Twiga_Gap_Analysis.pdf",
            "file_path": "/documents/mat-2024-0005/gap_analysis.pdf",
            "file_size": 560000,
            "mime_type": "application/pdf",
            "description": "Analysis of non-compliant provisions in current handbook.",
            "category": DocumentCategory.MEMO,
            "matter_id": matters_map["MAT-2024-0005"],
            "uploaded_by_id": users_map["faith.njeri@statutepro.co.ke"],
        },
    ]


# ============================================================================
# INVOICE DATA - Billing and payments
# ============================================================================
def get_invoices_data(clients_map, matters_map):
    """Generate invoices for billing workflow."""
    today = date.today()
    
    return [
        # Paid Invoice - KCB Litigation
        {
            "invoice_number": "INV-2024-0001",
            "client_id": clients_map["CLI-2024-002"],
            "matter_id": matters_map["MAT-2024-0002"],
            "status": InvoiceStatus.PAID,
            "issue_date": today - timedelta(days=30),
            "due_date": today - timedelta(days=15),
            "paid_date": today - timedelta(days=10),
            "subtotal": 11000000,  # 110,000 KES
            "tax_rate": 1600,  # 16% VAT
            "tax_amount": 1760000,
            "discount_amount": 0,
            "total_amount": 12760000,  # 127,600 KES
            "amount_paid": 12760000,
            "billing_period_start": today - timedelta(days=60),
            "billing_period_end": today - timedelta(days=31),
            "notes": "Professional fees for plaint drafting and filing.",
            "payment_terms": "Due within 15 days of invoice date.",
            "currency": "KES",
        },
        # Partially Paid - Safaricom M&A
        {
            "invoice_number": "INV-2024-0002",
            "client_id": clients_map["CLI-2024-001"],
            "matter_id": matters_map["MAT-2024-0001"],
            "status": InvoiceStatus.PARTIALLY_PAID,
            "issue_date": today - timedelta(days=20),
            "due_date": today + timedelta(days=10),
            "subtotal": 50000000,  # 500,000 KES
            "tax_rate": 1600,
            "tax_amount": 8000000,
            "discount_amount": 0,
            "total_amount": 58000000,  # 580,000 KES
            "amount_paid": 30000000,  # 300,000 KES paid
            "billing_period_start": today - timedelta(days=45),
            "billing_period_end": today - timedelta(days=21),
            "notes": "Due diligence fees - Phase 1.",
            "payment_terms": "50% due upon invoice, balance within 30 days.",
            "currency": "KES",
        },
        # Sent - Real Estate
        {
            "invoice_number": "INV-2024-0003",
            "client_id": clients_map["CLI-2024-004"],
            "matter_id": matters_map["MAT-2024-0003"],
            "status": InvoiceStatus.SENT,
            "issue_date": today - timedelta(days=5),
            "due_date": today + timedelta(days=9),
            "subtotal": 5000000,  # 50,000 KES (fixed fee - 1/3 upfront)
            "tax_rate": 1600,
            "tax_amount": 800000,
            "discount_amount": 0,
            "total_amount": 5800000,  # 58,000 KES
            "amount_paid": 0,
            "notes": "Conveyancing fees - 1st tranche (1/3 of total fee).",
            "payment_terms": "Due within 14 days.",
            "currency": "KES",
        },
        # Draft - Family Law
        {
            "invoice_number": "INV-2024-0004",
            "client_id": clients_map["CLI-2024-005"],
            "matter_id": matters_map["MAT-2024-0004"],
            "status": InvoiceStatus.DRAFT,
            "issue_date": today,
            "due_date": today + timedelta(days=14),
            "subtotal": 1530000,  # 15,300 KES (8.5 hrs @ 1800 KES)
            "tax_rate": 1600,
            "tax_amount": 244800,
            "discount_amount": 0,
            "total_amount": 1774800,  # 17,748 KES
            "amount_paid": 0,
            "billing_period_start": today - timedelta(days=14),
            "billing_period_end": today - timedelta(days=1),
            "notes": "Professional fees for January 2026.",
            "currency": "KES",
        },
        # Overdue
        {
            "invoice_number": "INV-2023-0089",
            "client_id": clients_map["CLI-2023-015"],
            "matter_id": matters_map["MAT-2023-0089"],
            "status": InvoiceStatus.PAID,
            "issue_date": today - timedelta(days=120),
            "due_date": today - timedelta(days=90),
            "paid_date": today - timedelta(days=85),
            "subtotal": 35000000,  # 350,000 KES
            "tax_rate": 1600,
            "tax_amount": 5600000,
            "discount_amount": 0,
            "total_amount": 40600000,
            "amount_paid": 40600000,
            "notes": "Final invoice - Employment tribunal matter.",
            "currency": "KES",
        },
    ]


# ============================================================================
# TRUST ACCOUNT DATA - Client funds management (IOLTA compliance)
# ============================================================================
def get_trust_accounts_data():
    """Generate trust accounts for client funds."""
    return [
        {
            "account_name": "StatutePro Client Trust Account",
            "account_number": "1234567890",
            "bank_name": "Kenya Commercial Bank",
            "bank_branch": "KICC Branch",
            "account_type": TrustAccountType.CLIENT_TRUST,
            "is_active": True,
            "currency": "KES",
            "current_balance": 250000000,  # 2.5M KES
            "notes": "Main trust account for client funds.",
        },
        {
            "account_name": "StatutePro Escrow Account",
            "account_number": "0987654321",
            "bank_name": "Equity Bank",
            "bank_branch": "Upper Hill Branch",
            "account_type": TrustAccountType.ESCROW,
            "is_active": True,
            "currency": "KES",
            "current_balance": 150000000,  # 1.5M KES
            "notes": "Escrow account for conveyancing transactions.",
        },
    ]


def get_trust_transactions_data(trust_accounts_map, clients_map, users_map):
    """Generate trust account transactions."""
    today = date.today()
    
    return [
        # Deposit from client
        {
            "trust_account_id": trust_accounts_map["1234567890"],
            "client_id": clients_map["CLI-2024-004"],
            "transaction_type": TransactionType.DEPOSIT,
            "amount": 5000000,  # 50,000 KES
            "running_balance": 5000000,  # Running balance after transaction
            "transaction_date": today - timedelta(days=25),
            "reference_number": "TXN-2024-001",
            "description": "Retainer deposit - Kariuki property matter",
            "recorded_by_id": users_map["susan.wambui@statutepro.co.ke"],
        },
        # Payment to firm from trust
        {
            "trust_account_id": trust_accounts_map["1234567890"],
            "client_id": clients_map["CLI-2024-004"],
            "transaction_type": TransactionType.PAYMENT_TO_FIRM,
            "amount": 5800000,  # 58,000 KES (invoice amount)
            "running_balance": -800000,  # 5M - 5.8M = -800K (client owes)
            "transaction_date": today - timedelta(days=3),
            "reference_number": "TXN-2024-002",
            "description": "Transfer to operating account - Invoice INV-2024-0003",
            "recorded_by_id": users_map["susan.wambui@statutepro.co.ke"],
        },
        # Escrow deposit for conveyancing
        {
            "trust_account_id": trust_accounts_map["0987654321"],
            "client_id": clients_map["CLI-2024-004"],
            "transaction_type": TransactionType.DEPOSIT,
            "amount": 150000000,  # 1.5M KES (purchase deposit)
            "running_balance": 150000000,
            "transaction_date": today - timedelta(days=20),
            "reference_number": "ESC-2024-001",
            "description": "Property purchase deposit - Kileleshwa property",
            "recorded_by_id": users_map["david.ochieng@statutepro.co.ke"],
        },
        # Safaricom retainer
        {
            "trust_account_id": trust_accounts_map["1234567890"],
            "client_id": clients_map["CLI-2024-001"],
            "transaction_type": TransactionType.DEPOSIT,
            "amount": 100000000,  # 1M KES
            "running_balance": 100000000,
            "transaction_date": today - timedelta(days=40),
            "reference_number": "TXN-2024-003",
            "description": "Retainer deposit - M&A transaction",
            "recorded_by_id": users_map["susan.wambui@statutepro.co.ke"],
        },
    ]


def get_client_trust_ledgers_data(trust_accounts_map, clients_map):
    """Generate client trust ledger entries."""
    return [
        {
            "trust_account_id": trust_accounts_map["1234567890"],
            "client_id": clients_map["CLI-2024-004"],
            "balance": -800000,  # Negative = client owes (used 5.8M, deposited 5M)
        },
        {
            "trust_account_id": trust_accounts_map["0987654321"],
            "client_id": clients_map["CLI-2024-004"],
            "balance": 150000000,  # Escrow balance
        },
        {
            "trust_account_id": trust_accounts_map["1234567890"],
            "client_id": clients_map["CLI-2024-001"],
            "balance": 100000000,  # Safaricom retainer
        },
    ]


# ============================================================================
# AUDIT LOG DATA - Compliance tracking
# ============================================================================
def get_audit_logs_data(users_map, clients_map, matters_map):
    """Generate audit log entries for compliance."""
    return [
        {
            "action": AuditAction.LOGIN,
            "resource_type": "user",
            "resource_id": str(users_map["james.mwangi@statutepro.co.ke"]),
            "resource_name": "James Mwangi",
            "user_id": users_map["james.mwangi@statutepro.co.ke"],
            "user_email": "james.mwangi@statutepro.co.ke",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
        {
            "action": AuditAction.CREATE,
            "resource_type": "matter",
            "resource_id": str(matters_map["MAT-2024-0001"]),
            "resource_name": "Safaricom - TechStartup Acquisition",
            "user_id": users_map["james.mwangi@statutepro.co.ke"],
            "user_email": "james.mwangi@statutepro.co.ke",
            "ip_address": "192.168.1.100",
        },
        {
            "action": AuditAction.UPLOAD,
            "resource_type": "document",
            "resource_name": "Due Diligence Report - Draft v1",
            "user_id": users_map["david.ochieng@statutepro.co.ke"],
            "user_email": "david.ochieng@statutepro.co.ke",
            "ip_address": "192.168.1.105",
        },
        {
            "action": AuditAction.INVOICE_SENT,
            "resource_type": "invoice",
            "resource_name": "INV-2024-0001",
            "user_id": users_map["susan.wambui@statutepro.co.ke"],
            "user_email": "susan.wambui@statutepro.co.ke",
            "ip_address": "192.168.1.110",
        },
        {
            "action": AuditAction.TRUST_DEPOSIT,
            "resource_type": "trust_transaction",
            "resource_name": "TXN-2024-001 - Kariuki retainer",
            "user_id": users_map["susan.wambui@statutepro.co.ke"],
            "user_email": "susan.wambui@statutepro.co.ke",
            "ip_address": "192.168.1.110",
        },
    ]


# ============================================================================
# MAIN SEED FUNCTION
# ============================================================================
async def seed_database():
    """Main function to seed the database with test data."""
    print("=" * 60)
    print("🌱 STATUTEPRO - Database Seeding")
    print("=" * 60)
    print("\nThis script creates realistic test data for the legal CMS,")
    print("reflecting common lawyer user journeys:\n")
    print("  1. Login/Dashboard - Users viewing active cases")
    print("  2. Client Intake - Various client types and statuses")
    print("  3. Case Setup - Matters with deadlines & tasks")
    print("  4. Daily Work - Time entries, documents, tasks")
    print("  5. Billing/Close - Invoices, payments, trust accounts")
    print("\n" + "=" * 60)
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Maps to store created records for relationships
            users_map = {}
            clients_map = {}
            matters_map = {}
            trust_accounts_map = {}
            
            # ================================================================
            # 1. CREATE USERS
            # ================================================================
            print("\n📌 Creating users...")
            for user_data in USERS_DATA:
                result = await session.execute(
                    select(User).where(User.email == user_data["email"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    user = User(
                        **user_data,
                        hashed_password=hash_password("password123"),
                        is_active=True,
                    )
                    session.add(user)
                    await session.flush()
                    users_map[user.email] = user.id
                    print(f"   ✅ Created: {user.first_name} {user.last_name} ({user.role.value})")
                else:
                    users_map[existing.email] = existing.id
                    print(f"   ℹ️  Exists: {existing.first_name} {existing.last_name}")
            
            # ================================================================
            # 2. CREATE CLIENTS
            # ================================================================
            print("\n📌 Creating clients...")
            for client_data in CLIENTS_DATA:
                result = await session.execute(
                    select(Client).where(Client.client_number == client_data["client_number"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    client = Client(**client_data)
                    session.add(client)
                    await session.flush()
                    clients_map[client.client_number] = client.id
                    print(f"   ✅ Created: {client.name} ({client.status.value})")
                else:
                    clients_map[existing.client_number] = existing.id
                    print(f"   ℹ️  Exists: {existing.name}")
            
            # ================================================================
            # 3. CREATE CONTACTS
            # ================================================================
            print("\n📌 Creating contacts...")
            contacts_data = get_contacts_data(clients_map)
            for contact_data in contacts_data:
                result = await session.execute(
                    select(Contact).where(
                        Contact.email == contact_data.get("email"),
                        Contact.client_id == contact_data["client_id"]
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    contact = Contact(**contact_data)
                    session.add(contact)
                    print(f"   ✅ Created: {contact.first_name} {contact.last_name}")
                else:
                    print(f"   ℹ️  Exists: {existing.first_name} {existing.last_name}")
            
            # ================================================================
            # 4. CREATE MATTERS
            # ================================================================
            print("\n📌 Creating matters...")
            matters_data = get_matters_data(clients_map, users_map)
            for matter_data in matters_data:
                result = await session.execute(
                    select(Matter).where(Matter.matter_number == matter_data["matter_number"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    matter = Matter(**matter_data)
                    session.add(matter)
                    await session.flush()
                    matters_map[matter.matter_number] = matter.id
                    print(f"   ✅ Created: {matter.matter_number} - {matter.name}")
                else:
                    matters_map[existing.matter_number] = existing.id
                    print(f"   ℹ️  Exists: {existing.matter_number}")
            
            # ================================================================
            # 5. CREATE TASKS
            # ================================================================
            print("\n📌 Creating tasks...")
            tasks_data = get_tasks_data(matters_map, users_map)
            for task_data in tasks_data:
                result = await session.execute(
                    select(Task).where(
                        Task.title == task_data["title"],
                        Task.matter_id == task_data.get("matter_id")
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    task = Task(**task_data)
                    session.add(task)
                    print(f"   ✅ Created: {task.title[:50]}...")
                else:
                    print(f"   ℹ️  Exists: {existing.title[:50]}...")
            
            # ================================================================
            # 6. CREATE TIME ENTRIES
            # ================================================================
            print("\n📌 Creating time entries...")
            time_entries_data = get_time_entries_data(matters_map, users_map)
            for entry_data in time_entries_data:
                result = await session.execute(
                    select(TimeEntry).where(
                        TimeEntry.description == entry_data["description"],
                        TimeEntry.entry_date == entry_data["entry_date"]
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    entry = TimeEntry(**entry_data)
                    session.add(entry)
                    print(f"   ✅ Created: {entry.entry_date} - {entry.duration_minutes}min")
                else:
                    print(f"   ℹ️  Exists: {existing.entry_date} - {existing.duration_minutes}min")
            
            # ================================================================
            # 7. CREATE DOCUMENTS
            # ================================================================
            print("\n📌 Creating documents...")
            documents_data = get_documents_data(matters_map, users_map)
            for doc_data in documents_data:
                result = await session.execute(
                    select(Document).where(Document.file_path == doc_data["file_path"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    doc = Document(**doc_data)
                    session.add(doc)
                    print(f"   ✅ Created: {doc.name}")
                else:
                    print(f"   ℹ️  Exists: {existing.name}")
            
            # ================================================================
            # 8. CREATE INVOICES
            # ================================================================
            print("\n📌 Creating invoices...")
            invoices_data = get_invoices_data(clients_map, matters_map)
            for inv_data in invoices_data:
                result = await session.execute(
                    select(Invoice).where(Invoice.invoice_number == inv_data["invoice_number"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    invoice = Invoice(**inv_data)
                    session.add(invoice)
                    print(f"   ✅ Created: {invoice.invoice_number} - {invoice.status.value}")
                else:
                    print(f"   ℹ️  Exists: {existing.invoice_number}")
            
            # ================================================================
            # 9. CREATE TRUST ACCOUNTS
            # ================================================================
            print("\n📌 Creating trust accounts...")
            trust_accounts_data = get_trust_accounts_data()
            for account_data in trust_accounts_data:
                result = await session.execute(
                    select(TrustAccount).where(
                        TrustAccount.account_number == account_data["account_number"]
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    account = TrustAccount(**account_data)
                    session.add(account)
                    await session.flush()
                    trust_accounts_map[account.account_number] = account.id
                    print(f"   ✅ Created: {account.account_name}")
                else:
                    trust_accounts_map[existing.account_number] = existing.id
                    print(f"   ℹ️  Exists: {existing.account_name}")
            
            # ================================================================
            # 10. CREATE TRUST TRANSACTIONS
            # ================================================================
            print("\n📌 Creating trust transactions...")
            transactions_data = get_trust_transactions_data(trust_accounts_map, clients_map, users_map)
            for txn_data in transactions_data:
                result = await session.execute(
                    select(TrustTransaction).where(
                        TrustTransaction.reference_number == txn_data["reference_number"]
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    txn = TrustTransaction(**txn_data)
                    session.add(txn)
                    print(f"   ✅ Created: {txn.reference_number}")
                else:
                    print(f"   ℹ️  Exists: {existing.reference_number}")
            
            # ================================================================
            # 11. CREATE CLIENT TRUST LEDGERS
            # ================================================================
            print("\n📌 Creating client trust ledgers...")
            ledgers_data = get_client_trust_ledgers_data(trust_accounts_map, clients_map)
            for ledger_data in ledgers_data:
                result = await session.execute(
                    select(ClientTrustLedger).where(
                        ClientTrustLedger.trust_account_id == ledger_data["trust_account_id"],
                        ClientTrustLedger.client_id == ledger_data["client_id"]
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    ledger = ClientTrustLedger(**ledger_data)
                    session.add(ledger)
                    print(f"   ✅ Created client ledger entry")
                else:
                    print(f"   ℹ️  Exists: client ledger entry")
            
            # ================================================================
            # 12. CREATE AUDIT LOGS
            # ================================================================
            print("\n📌 Creating audit logs...")
            audit_data = get_audit_logs_data(users_map, clients_map, matters_map)
            for log_data in audit_data:
                log = AuditLog(**log_data)
                session.add(log)
                print(f"   ✅ Created: {log.action.value} - {log.resource_type}")
            
            # Commit all changes
            await session.commit()
            
            # ================================================================
            # SUMMARY
            # ================================================================
            print("\n" + "=" * 60)
            print("✅ DATABASE SEEDING COMPLETE!")
            print("=" * 60)
            print("\n📊 Summary:")
            print(f"   • Users:            {len(users_map)}")
            print(f"   • Clients:          {len(clients_map)}")
            print(f"   • Matters:          {len(matters_map)}")
            print(f"   • Tasks:            {len(tasks_data)}")
            print(f"   • Time Entries:     {len(time_entries_data)}")
            print(f"   • Documents:        {len(documents_data)}")
            print(f"   • Invoices:         {len(invoices_data)}")
            print(f"   • Trust Accounts:   {len(trust_accounts_map)}")
            
            print("\n🔑 Login Credentials (all users):")
            print("   Password: password123")
            print("\n   User accounts:")
            for email in users_map.keys():
                print(f"   • {email}")
            
            print("\n📋 Test Scenarios Ready:")
            print("   1. Login as james.mwangi@statutepro.co.ke (Managing Partner)")
            print("      → View M&A deal, high-value corporate work")
            print("   2. Login as grace.wanjiku@statutepro.co.ke (Senior Partner)")
            print("      → Litigation matters, court deadlines")
            print("   3. Login as david.ochieng@statutepro.co.ke (Senior Associate)")
            print("      → Real estate conveyancing, document drafting")
            print("   4. Login as faith.njeri@statutepro.co.ke (Associate)")
            print("      → Family law, employment matters, pro bono")
            print("   5. Login as peter.kamau@statutepro.co.ke (Paralegal)")
            print("      → Filing tasks, research, land searches")
            
            print("\n" + "=" * 60)
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
