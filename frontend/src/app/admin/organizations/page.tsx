'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FiSearch, FiPlus, FiEdit2, FiUsers, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import { adminApi, Organization } from '@/lib/api';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: organizations = [], isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['admin-organizations', search, filterActive],
    queryFn: () => adminApi.listOrganizations({
      search: search || undefined,
      is_active: filterActive,
    }),
  });

  const error = fetchError ? 'Failed to load organizations' : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const orgTypeLabels: Record<string, string> = {
    law_firm: 'Law Firm',
    legal_department: 'Legal Dept',
    solo_practitioner: 'Solo',
    government: 'Government',
    non_profit: 'Non-Profit'
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Organizations</h1>
          <p className="text-muted mb-0">Manage all organizations on the platform</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" /> Add Organization
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text>
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, slug, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterActive === undefined ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )}
              >
                <option value="">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <span className="text-muted">{organizations.length} organizations</span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Organizations Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">{error}</Alert>
          ) : organizations.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No organizations found</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Seats</th>
                  <th>Tokens</th>
                  <th>Features</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div>
                        <Link href={`/admin/organizations/${org.id}`} className="fw-semibold text-decoration-none">
                          {org.name}
                        </Link>
                        <div className="small text-muted">{org.slug}</div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                        {orgTypeLabels[org.org_type] || org.org_type}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiUsers size={14} />
                        <span>{org.used_seats || 0}/{org.max_seats}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiActivity size={14} />
                        <span>{(org.monthly_token_limit / 1000).toFixed(0)}K</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {org.feature_ai_assistant && (
                          <Badge bg="success" title="AI Assistant">AI</Badge>
                        )}
                        {org.feature_document_assembly && (
                          <Badge bg="info" title="Document Assembly">Doc</Badge>
                        )}
                        {org.feature_analytics && (
                          <Badge bg="primary" title="Analytics">📊</Badge>
                        )}
                        {org.feature_api_access && (
                          <Badge bg="dark" title="API Access">API</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {org.is_active ? (
                        <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <FiCheckCircle size={12} /> Active
                        </Badge>
                      ) : (
                        <Badge bg="danger" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <FiXCircle size={12} /> Inactive
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/organizations/${org.id}`}>
                        <Button variant="outline-primary" size="sm">
                          <FiEdit2 size={14} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
        }}
      />
    </Container>
  );
}

interface CreateOrganizationModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: () => void;
}

function CreateOrganizationModal({ show, onHide, onCreated }: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    email: string;
    org_type: Organization['org_type'];
    country: string;
    max_seats: number;
    monthly_token_limit: number;
  }>({
    name: '',
    slug: '',
    email: '',
    org_type: 'law_firm',
    country: 'US',
    max_seats: 5,
    monthly_token_limit: 100000
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi.createOrganization(formData);
      onCreated();
      setFormData({
        name: '',
        slug: '',
        email: '',
        org_type: 'law_firm',
        country: 'US',
        max_seats: 5,
        monthly_token_limit: 100000
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Organization</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Organization Name *</Form.Label>
                <Form.Control
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Acme Law Firm"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Slug *</Form.Label>
                <Form.Control
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="acme-law"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@acmelaw.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Organization Type</Form.Label>
                <Form.Select
                  value={formData.org_type}
                  onChange={(e) => setFormData({ ...formData, org_type: e.target.value as Organization['org_type'] })}
                >
                  <option value="law_firm">Law Firm</option>
                  <option value="legal_department">Legal Department</option>
                  <option value="solo_practitioner">Solo Practitioner</option>
                  <option value="government">Government</option>
                  <option value="non_profit">Non-Profit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Country</Form.Label>
                <Form.Select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="US">United States</option>
                  <option value="KE">Kenya</option>
                  <option value="UG">Uganda</option>
                  <option value="TZ">Tanzania</option>
                  <option value="ZA">South Africa</option>
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Max Seats</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={formData.max_seats}
                  onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Monthly Token Limit</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step={10000}
                  value={formData.monthly_token_limit}
                  onChange={(e) => setFormData({ ...formData, monthly_token_limit: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : 'Create Organization'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
