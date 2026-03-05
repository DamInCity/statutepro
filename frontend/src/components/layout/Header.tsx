'use client';

import { Dropdown, Badge, Form, InputGroup } from 'react-bootstrap';
import { FiBell, FiSearch, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme/ThemeContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="main-header">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-link d-lg-none p-0 header-icon-btn"
          onClick={onMenuToggle}
        >
          <FiMenu size={24} />
        </button>

        <InputGroup className="header-search" style={{ width: '300px' }}>
          <InputGroup.Text>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search matters, clients..."
          />
        </InputGroup>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn header-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="position-relative rounded-circle p-2 header-icon-btn"
          >
            <FiBell size={20} />
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}
            >
              3
            </Badge>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ minWidth: '300px' }}>
            <Dropdown.Header>Notifications</Dropdown.Header>
            <Dropdown.Item>
              <small className="text-muted">2 hours ago</small>
              <p className="mb-0 small">New task assigned: Review Contract Draft</p>
            </Dropdown.Item>
            <Dropdown.Item>
              <small className="text-muted">Yesterday</small>
              <p className="mb-0 small">Invoice #INV-2024-001 is overdue</p>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-center">View all notifications</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="d-flex align-items-center gap-2 header-user-toggle"
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center header-avatar"
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="text-start d-none d-md-block">
              <div className="small fw-medium">{user?.first_name} {user?.last_name}</div>
              <div className="small header-role">{user?.role}</div>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="/dashboard/profile">My Profile</Dropdown.Item>
            <Dropdown.Item href="/dashboard/settings">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-danger">Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
