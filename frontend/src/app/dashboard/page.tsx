'use client';

import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { FiBriefcase, FiUsers, FiFileText, FiDollarSign, FiTrendingUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { analyticsApi, tasksApi, mattersApi } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

function StatCard({ title, value, subtitle, icon, variant }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="stat-card-label">{title}</div>
          <div className="stat-card-value">{value}</div>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className={`stat-card-icon ${variant}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.dashboard,
  });

  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: () => tasksApi.myTasks({ per_page: 5 }),
  });

  const { data: recentMatters, isLoading: mattersLoading } = useQuery({
    queryKey: ['matters', 'recent'],
    queryFn: () => mattersApi.list({ per_page: 5, status: 'active' }),
  });

  const isLoading = analyticsLoading || tasksLoading || mattersLoading;

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const overview = analytics?.overview;
  const revenue = analytics?.revenue;
  const billable = analytics?.billable_hours;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link href="/dashboard/tasks">
          <Button variant="primary">
            View All Tasks
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <StatCard
            title="Active Matters"
            value={overview?.active_matters || 0}
            subtitle={`${overview?.total_matters || 0} total`}
            icon={<FiBriefcase />}
            variant="primary"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Active Clients"
            value={overview?.active_clients || 0}
            subtitle={`${overview?.total_clients || 0} total`}
            icon={<FiUsers />}
            variant="success"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Outstanding"
            value={formatCurrency(revenue?.outstanding || 0)}
            subtitle={`${formatCurrency(revenue?.overdue || 0)} overdue`}
            icon={<FiFileText />}
            variant="warning"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="This Month"
            value={formatCurrency(revenue?.total_collected || 0)}
            subtitle={`${((revenue?.collection_rate || 0) * 100).toFixed(0)}% collection rate`}
            icon={<FiDollarSign />}
            variant="info"
          />
        </Col>
      </Row>

      {/* Utilization and Revenue Row */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FiClock className="text-primary" />
                Billable Hours
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <div className="text-muted small">Total Hours</div>
                  <div className="h4 mb-0">{(billable?.total_hours || 0).toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted small">Billable</div>
                  <div className="h4 mb-0 text-success">{(billable?.billable_hours || 0).toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted small">Utilization</div>
                  <div className="h4 mb-0 text-primary">{((billable?.utilization_rate || 0) * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${(billable?.utilization_rate || 0) * 100}%` }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FiTrendingUp className="text-success" />
                Revenue
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <div className="text-muted small">Billed</div>
                  <div className="h5 mb-0">{formatCurrency(revenue?.total_billed || 0)}</div>
                </div>
                <div>
                  <div className="text-muted small">Collected</div>
                  <div className="h5 mb-0 text-success">{formatCurrency(revenue?.total_collected || 0)}</div>
                </div>
              </div>
              <div className="text-muted small">
                Average invoice: {formatCurrency(revenue?.average_invoice_amount || 0)}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FiAlertCircle className="text-warning" />
                My Tasks
              </h5>
              <Link href="/dashboard/tasks" className="small">View all</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {myTasks?.tasks?.length ? (
                <div className="list-group list-group-flush">
                  {myTasks.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium small">{task.title}</div>
                        <small className="text-muted">
                          {task.matter?.name || 'No matter assigned'}
                        </small>
                      </div>
                      <Badge 
                        bg={task.is_overdue ? 'danger' : task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary'}
                        className="text-capitalize"
                      >
                        {task.is_overdue ? 'Overdue' : task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p className="mb-0">No tasks assigned</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Matters */}
      <Row className="g-4">
        <Col xs={12}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Active Matters</h5>
              <Link href="/dashboard/matters" className="btn btn-outline-primary btn-sm">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Matter</th>
                    <th>Client</th>
                    <th>Practice Area</th>
                    <th>Status</th>
                    <th>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatters?.matters?.length ? (
                    recentMatters.matters.map((matter) => (
                      <tr key={matter.id}>
                        <td>
                          <Link href={`/dashboard/matters/${matter.id}`} className="text-decoration-none fw-medium">
                            {matter.matter_number}
                          </Link>
                          <br />
                          <small className="text-muted">{matter.name}</small>
                        </td>
                        <td>{matter.client?.name || 'N/A'}</td>
                        <td className="text-capitalize">{matter.practice_area?.replace('_', ' ')}</td>
                        <td>
                          <span className={`status-badge ${matter.status}`}>
                            {matter.status}
                          </span>
                        </td>
                        <td>{new Date(matter.open_date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No active matters found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
