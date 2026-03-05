'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Row, Col, Card, Form, Button, Alert, Spinner, Tab, Nav, Badge } from 'react-bootstrap';
import { FiUser, FiLock, FiBell, FiShield, FiSave, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone: user?.phone ?? '',
    title: user?.title ?? '',
    bio: user?.bio ?? '',
  });

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const updateProfile = useMutation({
    mutationFn: () => api.patch('/users/me', profile),
    onSuccess: () => { setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000); },
    onError: (e: { response?: { data?: { detail?: string } } }) => setProfileError(e?.response?.data?.detail ?? 'Failed to update profile'),
  });

  const changePassword = useMutation({
    mutationFn: () => api.post('/users/me/change-password', {
      current_password: passwords.current_password,
      new_password: passwords.new_password,
    }),
    onSuccess: () => {
      setPwSuccess(true);
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => setPwError(e?.response?.data?.detail ?? 'Failed to change password'),
  });

  const handlePasswordSubmit = () => {
    setPwError('');
    if (passwords.new_password !== passwords.confirm_password) {
      setPwError('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    changePassword.mutate();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, security, and preferences</p>
      </div>

      <Tab.Container defaultActiveKey="profile">
        <Row className="g-4">
          {/* Sidebar nav */}
          <Col lg={3}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column p-2">
                  {[
                    { key: 'profile', icon: <FiUser />, label: 'Profile' },
                    { key: 'security', icon: <FiLock />, label: 'Password & Security' },
                    { key: 'notifications', icon: <FiBell />, label: 'Notifications' },
                    { key: 'account', icon: <FiShield />, label: 'Account Info' },
                  ].map(item => (
                    <Nav.Item key={item.key}>
                      <Nav.Link eventKey={item.key} className="d-flex align-items-center gap-2">
                        {item.icon} {item.label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Content */}
          <Col lg={9}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiUser className="text-primary" />
                      <strong>Profile Information</strong>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {profileSuccess && <Alert variant="success" className="d-flex align-items-center gap-2"><FiCheck /> Profile updated successfully!</Alert>}
                    {profileError && <Alert variant="danger" dismissible onClose={() => setProfileError('')}>{profileError}</Alert>}

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>First Name</Form.Label>
                          <Form.Control value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+254 700 000 000" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Title / Role</Form.Label>
                          <Form.Control value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior Associate" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Bio</Form.Label>
                          <Form.Control as="textarea" rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Brief professional bio..." />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control value={user?.email ?? ''} disabled className="bg-light" />
                          <Form.Text className="text-muted">Contact admin to change email.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Role</Form.Label>
                          <Form.Control value={user?.role ?? ''} disabled className="bg-light text-capitalize" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mt-4 d-flex gap-2">
                      <Button variant="primary" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? <Spinner size="sm" animation="border" /> : <><FiSave className="me-2" />Save Changes</>}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiLock className="text-warning" />
                      <strong>Change Password</strong>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {pwSuccess && <Alert variant="success" className="d-flex align-items-center gap-2"><FiCheck /> Password changed successfully!</Alert>}
                    {pwError && <Alert variant="danger" dismissible onClose={() => setPwError('')}>{pwError}</Alert>}

                    <Row className="g-3" style={{ maxWidth: 480 }}>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control type="password" value={passwords.current_password} onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))} autoComplete="current-password" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>New Password</Form.Label>
                          <Form.Control type="password" value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} autoComplete="new-password" />
                          <Form.Text className="text-muted">Minimum 8 characters.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control type="password" value={passwords.confirm_password} onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))} autoComplete="new-password" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mt-4">
                      <Button variant="warning" onClick={handlePasswordSubmit} disabled={changePassword.isPending}>
                        {changePassword.isPending ? <Spinner size="sm" animation="border" /> : <><FiLock className="me-2" />Change Password</>}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiBell className="text-info" />
                      <strong>Notification Preferences</strong>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted mb-4">Choose what notifications you receive.</p>
                    {[
                      { label: 'Task assignments', desc: 'When a task is assigned to you', defaultOn: true },
                      { label: 'Task due reminders', desc: '24 hours before a task is due', defaultOn: true },
                      { label: 'Matter updates', desc: 'Status changes on matters you follow', defaultOn: true },
                      { label: 'Invoice payments', desc: 'When a client pays an invoice', defaultOn: true },
                      { label: 'Deadline warnings', desc: '7 days before matter deadlines', defaultOn: true },
                      { label: 'New client assignments', desc: 'When a client is assigned to you', defaultOn: false },
                      { label: 'System announcements', desc: 'Platform updates and maintenance', defaultOn: false },
                    ].map(n => (
                      <div key={n.label} className="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div>
                          <div className="fw-semibold">{n.label}</div>
                          <small className="text-muted">{n.desc}</small>
                        </div>
                        <Form.Check type="switch" defaultChecked={n.defaultOn} id={`notif-${n.label}`} />
                      </div>
                    ))}
                    <div className="mt-4">
                      <Button variant="primary"><FiSave className="me-2" />Save Preferences</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Account Info Tab */}
              <Tab.Pane eventKey="account">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiShield className="text-success" />
                      <strong>Account Information</strong>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      {[
                        { label: 'User ID', value: user?.id },
                        { label: 'Email', value: user?.email },
                        { label: 'Role', value: <Badge bg="primary" className="text-capitalize">{user?.role}</Badge> },
                        { label: 'Account Status', value: user?.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge> },
                        { label: 'Email Verified', value: user?.is_verified ? <Badge bg="success">Verified</Badge> : <Badge bg="warning">Unverified</Badge> },
                        { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-KE', { dateStyle: 'long' }) : '—' },
                      ].map(row => (
                        <Col md={6} key={row.label}>
                          <div className="text-muted small mb-1">{row.label}</div>
                          <div className="fw-semibold" style={{ wordBreak: 'break-all' }}>{row.value ?? '—'}</div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}
