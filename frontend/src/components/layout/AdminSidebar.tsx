'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiGrid,
  FiCreditCard,
  FiActivity,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiShield
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
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <FiHome /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Organizations', href: '/admin/organizations', icon: <FiGrid /> },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: <FiCreditCard /> },
      { label: 'Users', href: '/admin/users', icon: <FiUsers /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Token Usage', href: '/admin/tokens', icon: <FiActivity /> },
      { label: 'Revenue', href: '/admin/revenue', icon: <FiDollarSign /> },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Currencies', href: '/admin/currencies', icon: <FiDollarSign /> },
      { label: 'Settings', href: '/admin/settings', icon: <FiSettings /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #1e1e2d 0%, #1a1a2e 100%)' }}>
      <div className="sidebar-brand">
        <h1 style={{ fontSize: '1.25rem' }}>
          <FiShield className="me-2" />
          Admin Panel
        </h1>
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
        
        {/* Switch to User Dashboard */}
        <div className="nav-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <Link
            href="/dashboard"
            className="nav-link"
          >
            <span className="nav-link-icon"><FiGrid /></span>
            User Dashboard
          </Link>
        </div>
        
        {/* User section at bottom */}
        <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.5rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            Platform Admin
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
