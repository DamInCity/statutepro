'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiClock, 
  FiDollarSign,
  FiCheckSquare,
  FiPieChart,
  FiSettings,
  FiHelpCircle,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <FiHome /> },
      { label: 'Matters', href: '/dashboard/matters', icon: <FiBriefcase /> },
      { label: 'Clients', href: '/dashboard/clients', icon: <FiUsers /> },
      { label: 'Tasks', href: '/dashboard/tasks', icon: <FiCheckSquare /> },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Time Entries', href: '/dashboard/time-entries', icon: <FiClock /> },
      { label: 'Invoices', href: '/dashboard/invoices', icon: <FiFileText /> },
      { label: 'Trust Accounts', href: '/dashboard/trust-accounts', icon: <FiDollarSign /> },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Analytics', href: '/dashboard/analytics', icon: <FiPieChart /> },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <FiSettings /> },
      { label: 'Help', href: '/dashboard/help', icon: <FiHelpCircle /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>⚖️ Legal CMS</h1>
      </div>
      
      <nav className="sidebar-nav">
        {navigation.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
        
        {/* User section at bottom */}
        <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.5rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            Signed in as
          </div>
          <div style={{ padding: '0 1.25rem 0.5rem', color: '#f8fafc', fontSize: '0.875rem', fontWeight: 500 }}>
            {user?.first_name} {user?.last_name}
          </div>
          <button
            onClick={logout}
            className="nav-link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span className="nav-link-icon"><FiLogOut /></span>
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
}
