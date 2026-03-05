'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { FiActivity, FiCpu, FiZap, FiTrendingUp } from 'react-icons/fi';
import { adminApi, PlatformTokenOverview } from '@/lib/api';

export default function TokenUsagePage() {
  const [overview, setOverview] = useState<PlatformTokenOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPlatformTokenOverview(period);
      setOverview(data);
      setError(null);
    } catch (err) {
      setError('Failed to load token usage data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const featureLabels: Record<string, string> = {
    chat_assistant: 'Chat Assistant',
    document_summary: 'Document Summary',
    document_drafting: 'Document Drafting',
    email_drafting: 'Email Drafting',
    legal_research: 'Legal Research',
    contract_review: 'Contract Review',
    case_analysis: 'Case Analysis',
    translation: 'Translation',
    other: 'Other'
  };

  const featureColors: Record<string, string> = {
    chat_assistant: '#3b82f6',
    document_summary: '#8b5cf6',
    document_drafting: '#10b981',
    email_drafting: '#f59e0b',
    legal_research: '#ef4444',
    contract_review: '#06b6d4',
    case_analysis: '#ec4899',
    translation: '#6366f1',
    other: '#6b7280'
  };

  // Generate period options (last 12 months)
  const periodOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    periodOptions.push({ value, label });
  }

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Token Usage</h1>
          <p className="text-muted mb-0">Platform-wide AI token consumption</p>
        </div>
        <Form.Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: 'auto' }}
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      </div>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Total Requests</p>
                  <h2 className="mb-0">{formatNumber(overview?.total_requests || 0)}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiActivity className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Total Tokens</p>
                  <h2 className="mb-0">{formatNumber(overview?.total_tokens || 0)}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiCpu className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Total Cost</p>
                  <h2 className="mb-0">${overview?.total_cost_dollars.toFixed(2) || '0.00'}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiZap className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Active Organizations</p>
                  <h2 className="mb-0">
                    {overview?.active_organizations || 0}
                    <small className="text-muted fs-6 ms-1">
                      / {overview?.total_organizations || 0}
                    </small>
                  </h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FiTrendingUp className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Usage by Feature */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Usage by Feature</h5>
            </Card.Header>
            <Card.Body>
              {overview?.usage_by_feature && overview.usage_by_feature.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {overview.usage_by_feature.map((feature) => (
                    <div key={feature.feature_type}>
                      <div className="d-flex justify-content-between mb-1">
                        <span>{featureLabels[feature.feature_type] || feature.feature_type}</span>
                        <span className="text-muted small">
                          {formatNumber(feature.total_tokens)} tokens ({feature.percentage_of_total.toFixed(1)}%)
                        </span>
                      </div>
                      <ProgressBar
                        now={feature.percentage_of_total}
                        style={{ height: '8px' }}
                        variant="primary"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No usage data for this period</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Usage by Model */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Usage by Model</h5>
            </Card.Header>
            <Card.Body>
              {overview?.usage_by_model && Object.keys(overview.usage_by_model).length > 0 ? (
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th className="text-end">Tokens</th>
                      <th className="text-end">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(overview.usage_by_model).map(([model, tokens]) => {
                      const totalTokens = overview.total_tokens || 1;
                      const percentage = (tokens / totalTokens) * 100;
                      return (
                        <tr key={model}>
                          <td>
                            <Badge bg="dark" className="text-uppercase" style={{ fontFamily: 'monospace' }}>
                              {model}
                            </Badge>
                          </td>
                          <td className="text-end">{formatNumber(tokens)}</td>
                          <td className="text-end">
                            <Badge bg={percentage > 50 ? 'primary' : 'secondary'}>
                              {percentage.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center mb-0">No model usage data for this period</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Usage Stats Summary */}
      <Row className="g-4 mt-2">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h4 className="text-primary mb-1">
                {overview?.total_tokens ? (overview.total_tokens / (overview.total_requests || 1)).toFixed(0) : 0}
              </h4>
              <p className="text-muted mb-0 small">Avg Tokens/Request</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h4 className="text-success mb-1">
                ${overview?.total_cost_dollars && overview.total_requests 
                  ? (overview.total_cost_dollars / overview.total_requests).toFixed(4) 
                  : '0.0000'}
              </h4>
              <p className="text-muted mb-0 small">Avg Cost/Request</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <Card.Body>
              <h4 className="text-info mb-1">
                {overview?.total_tokens && overview.active_organizations 
                  ? formatNumber(overview.total_tokens / overview.active_organizations) 
                  : '0'}
              </h4>
              <p className="text-muted mb-0 small">Avg Tokens/Org</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
