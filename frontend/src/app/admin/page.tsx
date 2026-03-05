'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Table } from 'react-bootstrap';
import { FiUsers, FiGrid, FiDollarSign, FiActivity, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { adminApi, AdminDashboard, SubscriptionRenewalInfo } from '@/lib/api';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [renewals, setRenewals] = useState<SubscriptionRenewalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardData, renewalData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUpcomingRenewals(7)
      ]);
      setDashboard(dashboardData);
      setRenewals(renewalData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Platform Dashboard</h1>
          <p className="text-muted mb-0">Overview of your SaaS platform</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchDashboard}>
          <FiRefreshCw className="me-2" /> Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Organizations</p>
                  <h2 className="mb-0">{dashboard?.organizations.total || 0}</h2>
                  <small className="text-success">
                    {dashboard?.organizations.active || 0} active
                  </small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiGrid className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Active Users</p>
                  <h2 className="mb-0">{dashboard?.users.active || 0}</h2>
                  <small className="text-muted">
                    of {dashboard?.users.total || 0} total
                  </small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiUsers className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Monthly Revenue</p>
                  <h2 className="mb-0">{formatCurrency(dashboard?.revenue.mrr_cents || 0)}</h2>
                  <small className="text-muted">MRR</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FiDollarSign className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">AI Tokens Used</p>
                  <h2 className="mb-0">
                    {((dashboard?.tokens.used_this_month || 0) / 1000).toFixed(1)}K
                  </h2>
                  <small className="text-muted">This month</small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiActivity className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Subscription Breakdown */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Subscriptions by Tier</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                {Object.entries(dashboard?.subscriptions.by_tier || {}).map(([tier, count]) => (
                  <div key={tier} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={
                        tier === 'enterprise' ? 'primary' :
                        tier === 'professional' ? 'success' :
                        tier === 'starter' ? 'info' : 'secondary'
                      }>
                        {tier.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="fw-semibold">{count}</span>
                  </div>
                ))}
                {Object.keys(dashboard?.subscriptions.by_tier || {}).length === 0 && (
                  <p className="text-muted mb-0">No active subscriptions</p>
                )}
              </div>

              {(dashboard?.subscriptions.at_risk || 0) > 0 && (
                <Alert variant="warning" className="mt-4 mb-0 d-flex align-items-center">
                  <FiAlertTriangle className="me-2" />
                  {dashboard?.subscriptions.at_risk} subscriptions at risk
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Renewals */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Renewals (7 days)</h5>
              <Badge bg="primary">{renewals.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {renewals.length > 0 ? (
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Plan</th>
                      <th>Days</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals.slice(0, 5).map((renewal) => (
                      <tr key={renewal.subscription_id}>
                        <td>{renewal.organization_name}</td>
                        <td>
                          <Badge bg={
                            renewal.plan_tier === 'enterprise' ? 'primary' :
                            renewal.plan_tier === 'professional' ? 'success' :
                            renewal.plan_tier === 'starter' ? 'info' : 'secondary'
                          } className="text-uppercase">
                            {renewal.plan_tier}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={renewal.days_until_renewal! <= 2 ? 'danger' : 'warning'}>
                            {renewal.days_until_renewal} days
                          </Badge>
                        </td>
                        <td>{formatCurrency(renewal.next_billing_amount_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted">
                  No renewals in the next 7 days
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="g-4 mt-2">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h3 className="text-primary mb-1">{dashboard?.subscriptions.active || 0}</h3>
              <p className="text-muted mb-0 small">Active Subscriptions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h3 className="text-warning mb-1">{dashboard?.subscriptions.upcoming_renewals || 0}</h3>
              <p className="text-muted mb-0 small">Upcoming Renewals</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h3 className="text-danger mb-1">{dashboard?.organizations.inactive || 0}</h3>
              <p className="text-muted mb-0 small">Inactive Organizations</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
