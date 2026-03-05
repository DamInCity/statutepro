'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { adminApi, Subscription, SubscriptionRenewalInfo } from '@/lib/api';

export default function SubscriptionsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('');

  const { data: subscriptions = [], isLoading: subsLoading, error: subsError } = useQuery({
    queryKey: ['admin-subscriptions', filterStatus, filterTier],
    queryFn: () => adminApi.listSubscriptions({
      status: filterStatus || undefined,
      plan_tier: filterTier || undefined,
    }),
  });

  const { data: renewals = [], isLoading: renewalsLoading } = useQuery({
    queryKey: ['admin-renewals'],
    queryFn: () => adminApi.getUpcomingRenewals(30),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['admin-organizations-brief'],
    queryFn: () => adminApi.listOrganizations(),
  });

  const orgMap = Object.fromEntries(orgs.map((o) => [o.id, o.name]));
  const loading = subsLoading || renewalsLoading;
  const error = subsError ? 'Failed to load subscriptions' : null;

  const formatCurrency = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(cents / 100);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const statusColors: Record<string, string> = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    canceled: 'secondary',
    unpaid: 'danger',
    paused: 'secondary',
    expired: 'dark'
  };

  const tierColors: Record<string, string> = {
    free: 'secondary',
    starter: 'info',
    professional: 'success',
    enterprise: 'primary',
    custom: 'dark'
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Subscriptions</h1>
          <p className="text-muted mb-0">Manage subscription plans and billing</p>
        </div>
      </div>

      <Tabs defaultActiveKey="all" className="mb-4">
        <Tab eventKey="all" title="All Subscriptions">
          {/* Filters */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col md={3}>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="trialing">Trialing</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                  >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="text-end">
                  <span className="text-muted">{subscriptions.length} subscriptions</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Subscriptions Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">{error}</Alert>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No subscriptions found</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Organization</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Billing</th>
                      <th>Price</th>
                      <th>Period End</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <span className="fw-semibold">{orgMap[sub.organization_id] ?? sub.organization_id}</span>
                        </td>
                        <td>
                          <Badge bg={tierColors[sub.plan_tier]} className="text-uppercase">
                            {sub.plan_tier}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={statusColors[sub.status]} className="text-uppercase">
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="text-capitalize">{sub.billing_interval}</td>
                        <td>{formatCurrency(sub.effective_price_cents, sub.currency)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <FiCalendar size={14} className="text-muted" />
                            {formatDate(sub.current_period_end)}
                          </div>
                          {sub.days_until_renewal != null && sub.days_until_renewal <= 7 && (
                            <small className="text-warning d-block">
                              {sub.days_until_renewal} days left
                            </small>
                          )}
                        </td>
                        <td>
                          <Button variant="outline-secondary" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="renewals" title={
          <span>
            Upcoming Renewals
            {renewals.length > 0 && (
              <Badge bg="warning" className="ms-2">{renewals.length}</Badge>
            )}
          </span>
        }>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {renewals.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No upcoming renewals in the next 30 days</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Organization</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Renewal Date</th>
                      <th>Days Left</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals.map((renewal) => (
                      <tr key={renewal.subscription_id}>
                        <td className="fw-semibold">{renewal.organization_name}</td>
                        <td>
                          <Badge bg={tierColors[renewal.plan_tier]} className="text-uppercase">
                            {renewal.plan_tier}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={statusColors[renewal.status]} className="text-uppercase">
                            {renewal.status}
                          </Badge>
                        </td>
                        <td>{formatDate(renewal.current_period_end)}</td>
                        <td>
                          <Badge bg={
                            renewal.days_until_renewal! <= 2 ? 'danger' :
                            renewal.days_until_renewal! <= 7 ? 'warning' : 'info'
                          }>
                            {renewal.days_until_renewal} days
                          </Badge>
                        </td>
                        <td className="fw-semibold">
                          {formatCurrency(renewal.next_billing_amount_cents, renewal.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="at-risk" title={
          <span className="text-danger">
            <FiAlertTriangle className="me-1" />
            At Risk
          </span>
        }>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Alert variant="info">
                Subscriptions that are past due, unpaid, or about to expire are shown here.
              </Alert>
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Organization</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Issue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions
                    .filter(s => ['past_due', 'unpaid', 'expired'].includes(s.status))
                    .map((sub) => (
                      <tr key={sub.id}>
                        <td className="fw-semibold">{orgMap[sub.organization_id] ?? sub.organization_id}</td>
                        <td>
                          <Badge bg={tierColors[sub.plan_tier]} className="text-uppercase">
                            {sub.plan_tier}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={statusColors[sub.status]} className="text-uppercase">
                            {sub.status}
                          </Badge>
                        </td>
                        <td>
                          {sub.status === 'past_due' && 'Payment overdue'}
                          {sub.status === 'unpaid' && 'Payment failed'}
                          {sub.status === 'expired' && 'Subscription expired'}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            Contact
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  {subscriptions.filter(s => ['past_due', 'unpaid', 'expired'].includes(s.status)).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No at-risk subscriptions 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}
