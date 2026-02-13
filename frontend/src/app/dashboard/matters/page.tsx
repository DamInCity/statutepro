'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Spinner, Pagination } from 'react-bootstrap';
import { FiSearch, FiPlus, FiFilter, FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { mattersApi, clientsApi, Matter } from '@/lib/api';

const PRACTICE_AREAS = [
  { value: 'litigation', label: 'Litigation' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'family', label: 'Family Law' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'employment', label: 'Employment' },
  { value: 'intellectual_property', label: 'IP' },
  { value: 'tax', label: 'Tax' },
  { value: 'estate_planning', label: 'Estate Planning' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', variant: 'success' },
  { value: 'pending', label: 'Pending', variant: 'warning' },
  { value: 'closed', label: 'Closed', variant: 'secondary' },
  { value: 'on_hold', label: 'On Hold', variant: 'info' },
];

interface MatterFormData {
  name: string;
  client_id: string;
  practice_area: string;
  description: string;
  billing_type: string;
  hourly_rate: string;
  flat_fee: string;
}

export default function MattersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const perPage = 10;

  const [formData, setFormData] = useState<MatterFormData>({
    name: '',
    client_id: '',
    practice_area: 'litigation',
    description: '',
    billing_type: 'hourly',
    hourly_rate: '',
    flat_fee: '',
  });

  const { data: mattersData, isLoading } = useQuery({
    queryKey: ['matters', currentPage, searchQuery, statusFilter, practiceAreaFilter],
    queryFn: () => mattersApi.list({
      page: currentPage,
      per_page: perPage,
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      practice_area: practiceAreaFilter || undefined,
    }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientsApi.list({ per_page: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof mattersApi.create>[0]) => mattersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mattersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      setShowDeleteModal(false);
      setSelectedMatter(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      practice_area: 'litigation',
      description: '',
      billing_type: 'hourly',
      hourly_rate: '',
      flat_fee: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      client_id: formData.client_id,
      practice_area: formData.practice_area,
      description: formData.description || undefined,
      billing_type: formData.billing_type,
      hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) * 100 : undefined,
      flat_fee: formData.flat_fee ? parseInt(formData.flat_fee) * 100 : undefined,
    });
  };

  const handleDelete = () => {
    if (selectedMatter) {
      deleteMutation.mutate(selectedMatter.id);
    }
  };

  const totalPages = Math.ceil((mattersData?.total || 0) / perPage);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Matters</h1>
          <p className="page-subtitle">Manage your legal matters and cases</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" />
          New Matter
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search matters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={practiceAreaFilter}
                onChange={(e) => setPracticeAreaFilter(e.target.value)}
              >
                <option value="">All Practice Areas</option>
                {PRACTICE_AREAS.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPracticeAreaFilter('');
                }}
              >
                <FiFilter className="me-2" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Matters Table */}
      <Card>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="loading-spinner py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Matter #</th>
                    <th>Name</th>
                    <th>Client</th>
                    <th>Practice Area</th>
                    <th>Status</th>
                    <th>Billing</th>
                    <th>Opened</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mattersData?.matters?.length ? (
                    mattersData.matters.map((matter) => (
                      <tr key={matter.id}>
                        <td>
                          <Link href={`/dashboard/matters/${matter.id}`} className="fw-medium text-decoration-none">
                            {matter.matter_number}
                          </Link>
                        </td>
                        <td>{matter.name}</td>
                        <td>{matter.client?.name || 'N/A'}</td>
                        <td className="text-capitalize">{matter.practice_area?.replace('_', ' ')}</td>
                        <td>
                          <span className={`status-badge ${matter.status}`}>
                            {matter.status}
                          </span>
                        </td>
                        <td className="text-capitalize">{matter.billing_type}</td>
                        <td>{new Date(matter.open_date).toLocaleDateString()}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <Link href={`/dashboard/matters/${matter.id}`}>
                              <Button variant="outline-primary" size="sm">
                                <FiEye />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/matters/${matter.id}/edit`}>
                              <Button variant="outline-secondary" size="sm">
                                <FiEdit2 />
                              </Button>
                            </Link>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedMatter(matter);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-5">
                        No matters found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, mattersData?.total || 0)} of {mattersData?.total || 0} matters
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.Prev 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                      Math.max(0, currentPage - 3),
                      Math.min(totalPages, currentPage + 2)
                    ).map((page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Matter</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Matter Name *</Form.Label>
                  <Form.Control
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter matter name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client *</Form.Label>
                  <Form.Select
                    required
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  >
                    <option value="">Select client</option>
                    {clientsData?.clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Practice Area *</Form.Label>
                  <Form.Select
                    required
                    value={formData.practice_area}
                    onChange={(e) => setFormData({ ...formData, practice_area: e.target.value })}
                  >
                    {PRACTICE_AREAS.map((area) => (
                      <option key={area.value} value={area.value}>
                        {area.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the matter"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Billing Type *</Form.Label>
                  <Form.Select
                    required
                    value={formData.billing_type}
                    onChange={(e) => setFormData({ ...formData, billing_type: e.target.value })}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="flat_fee">Flat Fee</option>
                    <option value="contingency">Contingency</option>
                    <option value="retainer">Retainer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {formData.billing_type === 'hourly' && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Hourly Rate (KES)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </Form.Group>
                </Col>
              )}
              {formData.billing_type === 'flat_fee' && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Flat Fee (KES)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.flat_fee}
                      onChange={(e) => setFormData({ ...formData, flat_fee: e.target.value })}
                      placeholder="e.g., 100000"
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Matter'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Matter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete matter <strong>{selectedMatter?.name}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Matter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
