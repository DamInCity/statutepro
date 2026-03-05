'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
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
  FiLogOut,
  FiShield,
  FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];  // If specified, only show to these roles
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];  // If specified, only show section to these roles
}

interface SidebarProps {
  isOpen?: boolean;
  onNavigate?: () => void;
}

// Navigation configuration with role-based access
const getNavigation = (userRole?: string, isPlatformAdmin?: boolean): NavSection[] => {
  const adminRoles = ['owner', 'admin'];
  const billingRoles = ['owner', 'admin', 'partner', 'associate'];
  
  const sections: NavSection[] = [
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
      roles: billingRoles,
      items: [
        { label: 'Time Entries', href: '/dashboard/time-entries', icon: <FiClock /> },
        { label: 'Invoices', href: '/dashboard/invoices', icon: <FiFileText />, roles: billingRoles },
        { label: 'Trust Accounts', href: '/dashboard/trust-accounts', icon: <FiDollarSign />, roles: adminRoles },
      ],
    },
    {
      title: 'Reports',
      roles: [...adminRoles, 'partner'],
      items: [
        { label: 'Analytics', href: '/dashboard/analytics', icon: <FiPieChart /> },
      ],
    },
    {
      title: 'Organization',
      roles: adminRoles,
      items: [
        { label: 'Team Members', href: '/dashboard/settings/team', icon: <FiUserPlus /> },
        { label: 'Settings', href: '/dashboard/settings', icon: <FiSettings /> },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'Help', href: '/dashboard/help', icon: <FiHelpCircle /> },
      ],
    },
  ];

  // Filter sections and items based on user role
  return sections
    .filter(section => {
      if (!section.roles) return true;
      return section.roles.includes(userRole || '');
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(userRole || '');
      })
    }))
    .filter(section => section.items.length > 0);
};

export default function Sidebar({ isOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const navigation = useMemo(() => 
    getNavigation(user?.role, user?.is_platform_admin), 
    [user?.role, user?.is_platform_admin]
  );

  // Get role display name
  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    partner: 'Partner',
    associate: 'Associate',
    paralegal: 'Paralegal',
    staff: 'Staff',
    readonly: 'View Only'
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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
                onClick={onNavigate}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
        
        {/* Platform Admin Link */}
        {user?.is_platform_admin && (
          <div className="nav-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div className="nav-section-title" style={{ color: '#fbbf24' }}>Platform</div>
            <Link
              href="/admin"
              className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
              style={{ color: '#fbbf24' }}
              onClick={onNavigate}
            >
              <span className="nav-link-icon"><FiShield /></span>
              Admin Panel
            </Link>
          </div>
        )}
        
        {/* User section at bottom */}
        <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.5rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            Signed in as {roleLabels[user?.role || ''] || user?.role}
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
