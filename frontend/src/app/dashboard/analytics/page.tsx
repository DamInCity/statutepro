'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Table, Badge, Spinner, Button, Form } from 'react-bootstrap';
import {
  FiTrendingUp, FiDollarSign, FiClock, FiUsers, FiBriefcase,
  FiBarChart2, FiActivity, FiPercent,
} from 'react-icons/fi';
import { analyticsApi } from '@/lib/api';

function fmt(cents: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(cents / 100);
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

// Simple bar chart using CSS (no external lib needed)
function MiniBarChart({ data, labels, color = '#2563eb' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="d-flex align-items-end gap-1" style={{ height: 80 }}>
      {data.map((v, i) => (
        <div key={`bar-${i}`} className="d-flex flex-column align-items-center flex-fill">
          <div
            style={{
              background: color, width: '100%', borderRadius: '3px 3px 0 0',
              height: `${(v / max) * 72}px`, minHeight: 2, transition: 'height 0.3s',
            }}
            title={`${labels[i]}: ${v}`}
          />
          <small className="text-muted" style={{ fontSize: '0.6rem', marginTop: 2 }}>
            {labels[i]?.slice(0, 3)}
          </small>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [revenueRange, setRevenueRange] = useState({ start_date: '', end_date: '' });

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.dashboard,
  });

  const { data: performance } = useQuery({
    queryKey: ['analytics', 'attorney-performance'],
    queryFn: analyticsApi.attorneyPerformance,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['analytics', 'revenue', revenueRange],
    queryFn: () => analyticsApi.revenue(revenueRange.start_date ? revenueRange : undefined),
  });

  if (isLoading) {
    return <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>;
  }

  const o = dashboard?.overview;
  const r = dashboard?.revenue ?? revenueData;
  const b = dashboard?.billable_hours;
  const t = dashboard?.trends;

  const kpis = [
    { label: 'Active Matters', value: o?.active_matters ?? 0, sub: `${o?.total_matters ?? 0} total`, icon: <FiBriefcase />, variant: 'primary' },
    { label: 'Active Clients', value: o?.active_clients ?? 0, sub: `${o?.total_clients ?? 0} total`, icon: <FiUsers />, variant: 'info' },
    { label: 'Total Billed', value: fmt(r?.total_billed ?? 0), sub: `${pct(r?.collection_rate ?? 0)} collected`, icon: <FiDollarSign />, variant: 'success' },
    { label: 'Outstanding', value: fmt(r?.outstanding ?? 0), sub: `${fmt(r?.overdue ?? 0)} overdue`, icon: <FiActivity />, variant: 'warning' },
    { label: 'Billable Hours', value: `${b?.billable_hours?.toFixed(1) ?? 0}h`, sub: `${b?.total_hours?.toFixed(1) ?? 0}h total`, icon: <FiClock />, variant: 'primary' },
    { label: 'Utilization Rate', value: pct(b?.utilization_rate ?? 0), sub: 'billable / total', icon: <FiPercent />, variant: (b?.utilization_rate ?? 0) > 0.7 ? 'success' : 'warning' },
    { label: 'Avg Invoice', value: fmt(r?.average_invoice_amount ?? 0), sub: 'per invoice', icon: <FiTrendingUp />, variant: 'info' },
    { label: 'Team Size', value: o?.active_users ?? 0, sub: `${o?.total_users ?? 0} registered`, icon: <FiUsers />, variant: 'secondary' },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Firm performance, revenue, and billing insights</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control type="date" size="sm" value={revenueRange.start_date}
            onChange={e => setRevenueRange(r => ({ ...r, start_date: e.target.value }))} style={{ width: 140 }} />
          <span className="text-muted">to</span>
          <Form.Control type="date" size="sm" value={revenueRange.end_date}
            onChange={e => setRevenueRange(r => ({ ...r, end_date: e.target.value }))} style={{ width: 140 }} />
        </div>
      </div>

      {/* KPI Grid */}
      <Row className="g-3 mb-4">
        {kpis.map(k => (
          <Col key={k.label} md={6} lg={3}>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-card-label">{k.label}</div>
                  <div className="stat-card-value">{k.value}</div>
                  <small className="text-muted">{k.sub}</small>
                </div>
                <div className={`stat-card-icon ${k.variant}`}>{k.icon}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        {/* Revenue Trend */}
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiBarChart2 className="text-primary" />
                <strong>Revenue Trend</strong>
              </div>
            </Card.Header>
            <Card.Body>
              {t?.months?.length ? (
                <MiniBarChart
                  data={(t.revenue ?? []).map(v => Math.round(v / 100))}
                  labels={t.months}
                  color="#2563eb"
                />
              ) : (
                <div className="text-center text-muted py-4">No trend data available yet.</div>
              )}
              {t?.months?.length && (
                <div className="d-flex gap-4 mt-3 justify-content-center" style={{ fontSize: '0.8rem' }}>
                  {t.months.map((m, i) => (
                    <div key={`${m}-${i}`} className="text-center">
                      <div className="fw-semibold">{m}</div>
                      <div className="text-success">{fmt(t.revenue?.[i] ?? 0)}</div>
                      <div className="text-muted">{(t.hours?.[i] ?? 0).toFixed(0)}h</div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Billable Hours Breakdown */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiClock className="text-info" />
                <strong>Hours Breakdown</strong>
              </div>
            </Card.Header>
            <Card.Body>
              {b ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Billable</span>
                      <span className="fw-semibold text-success">{b.billable_hours?.toFixed(1)}h</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className="progress-bar bg-success" style={{ width: `${(b.utilization_rate ?? 0) * 100}%` }} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Non-billable</span>
                      <span className="fw-semibold text-warning">{b.non_billable_hours?.toFixed(1)}h</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className="progress-bar bg-warning" style={{ width: `${(1 - (b.utilization_rate ?? 0)) * 100}%` }} />
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Total Hours</span>
                    <span className="fw-bold">{b.total_hours?.toFixed(1)}h</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Utilization</span>
                    <Badge bg={(b.utilization_rate ?? 0) > 0.7 ? 'success' : 'warning'}>
                      {pct(b.utilization_rate ?? 0)}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">No data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Revenue Summary */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiDollarSign className="text-success" />
                <strong>Revenue Summary</strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0">
                <tbody>
                  {[
                    { label: 'Total Billed', value: fmt(r?.total_billed ?? 0), color: 'text-dark' },
                    { label: 'Total Collected', value: fmt(r?.total_collected ?? 0), color: 'text-success' },
                    { label: 'Outstanding', value: fmt(r?.outstanding ?? 0), color: 'text-warning' },
                    { label: 'Overdue', value: fmt(r?.overdue ?? 0), color: 'text-danger' },
                    { label: 'Avg Invoice', value: fmt(r?.average_invoice_amount ?? 0), color: 'text-info' },
                    { label: 'Collection Rate', value: pct(r?.collection_rate ?? 0), color: (r?.collection_rate ?? 0) > 0.7 ? 'text-success' : 'text-warning' },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="text-muted">{row.label}</td>
                      <td className={`text-end fw-semibold ${row.color}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Attorney Performance */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiUsers className="text-primary" />
                <strong>Attorney Performance</strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {Array.isArray(performance) && performance.length > 0 ? (
                <Table hover className="mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Attorney</th>
                      <th className="text-end">Billable hrs</th>
                      <th className="text-end">Revenue</th>
                      <th className="text-center">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(performance as Array<{
                      attorney_name: string;
                      billable_hours: number;
                      total_billed: number;
                      utilization_rate: number;
                    }>).map((a) => (
                      <tr key={a.attorney_name}>
                        <td className="fw-semibold">{a.attorney_name}</td>
                        <td className="text-end">{a.billable_hours?.toFixed(1)}h</td>
                        <td className="text-end">{fmt(a.total_billed ?? 0)}</td>
                        <td className="text-center">
                          <Badge bg={(a.utilization_rate ?? 0) > 0.7 ? 'success' : 'warning'}>
                            {pct(a.utilization_rate ?? 0)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-4">No attorney performance data yet.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
