'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Table, Button, Form, InputGroup, Modal, Spinner, Pagination, Badge } from 'react-bootstrap';
import { FiSearch, FiPlus, FiFilter, FiEdit2, FiTrash2, FiEye, FiMail, FiPhone, FiUser, FiBriefcase } from 'react-icons/fi';
import Link from 'next/link';
import { clientsApi, Client } from '@/lib/api';

interface ClientFormData {
  name: string;
  client_type: string;
  email: string;
  phone: string;
  address: string;
  id_number: string;
  tax_pin: string;
  notes: string;
}

const CLIENT_TYPES = [
  { value: 'individual', label: 'Individual', icon: FiUser },
  { value: 'corporation', label: 'Corporation', icon: FiBriefcase },
  { value: 'government', label: 'Government', icon: FiBriefcase },
  { value: 'nonprofit', label: 'Non-Profit', icon: FiBriefcase },
  { value: 'partnership', label: 'Partnership', icon: FiBriefcase },
  { value: 'llc', label: 'LLC', icon: FiBriefcase },
];

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const perPage = 10;

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    client_type: 'individual',
    email: '',
    phone: '',
    address: '',
    id_number: '',
    tax_pin: '',
    notes: '',
  });

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', currentPage, searchQuery, typeFilter],
    queryFn: () => clientsApi.list({
      page: currentPage,
      per_page: perPage,
      search: searchQuery || undefined,
      client_type: typeFilter || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof clientsApi.create>[0]) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowDeleteModal(false);
      setSelectedClient(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      client_type: 'individual',
      email: '',
      phone: '',
      address: '',
      id_number: '',
      tax_pin: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      client_type: formData.client_type,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address_line1: formData.address || undefined,
      tax_id: formData.tax_pin || formData.id_number || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = () => {
    if (selectedClient) {
      deleteMutation.mutate(selectedClient.id);
    }
  };

  const totalPages = Math.ceil((clientsData?.total || 0) / perPage);

  const getClientTypeIcon = (type: string) => {
    const clientType = CLIENT_TYPES.find(t => t.value === type);
    const Icon = clientType?.icon || FiUser;
    return <Icon />;
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" />
          New Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search clients by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Client Types</option>
                {CLIENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                }}
              >
                <FiFilter className="me-2" />
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Clients Table */}
      <Card>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="loading-spinner py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>ID/PIN</th>
                    <th>Matters</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsData?.clients?.length ? (
                    clientsData.clients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar bg-light text-primary d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40 }}>
                              {getClientTypeIcon(client.client_type)}
                            </div>
                            <div>
                              <Link href={`/dashboard/clients/${client.id}`} className="fw-medium text-decoration-none">
                                {client.name}
                              </Link>
                              <br />
                              <small className="text-muted">{client.client_number}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary" className="text-capitalize">
                            {client.client_type}
                          </Badge>
                        </td>
                        <td>
                          {client.email && (
                            <div className="d-flex align-items-center gap-1 small">
                              <FiMail className="text-muted" />
                              <a href={`mailto:${client.email}`}>{client.email}</a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="d-flex align-items-center gap-1 small">
                              <FiPhone className="text-muted" />
                              <a href={`tel:${client.phone}`}>{client.phone}</a>
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-muted">No contact info</span>
                          )}
                        </td>
                        <td>
                          {client.id_number && <div className="small">ID: {client.id_number}</div>}
                          {client.tax_pin && <div className="small text-muted">PIN: {client.tax_pin}</div>}
                          {!client.id_number && !client.tax_pin && (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className="fw-medium">{client.matters_count || 0}</span>
                          <span className="text-muted"> matters</span>
                        </td>
                        <td>
                          <span className={`status-badge ${client.is_active ? 'active' : 'inactive'}`}>
                            {client.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <Link href={`/dashboard/clients/${client.id}`}>
                              <Button variant="outline-primary" size="sm">
                                <FiEye />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/clients/${client.id}/edit`}>
                              <Button variant="outline-secondary" size="sm">
                                <FiEdit2 />
                              </Button>
                            </Link>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client);
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
                      <td colSpan={7} className="text-center text-muted py-5">
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, clientsData?.total || 0)} of {clientsData?.total || 0} clients
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
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Client Name *</Form.Label>
                  <Form.Control
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client Type *</Form.Label>
                  <Form.Select
                    required
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  >
                    {CLIENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 7XX XXX XXX"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Physical or postal address"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{formData.client_type === 'individual' ? 'ID Number' : 'Registration Number'}</Form.Label>
                  <Form.Control
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    placeholder={formData.client_type === 'individual' ? 'National ID Number' : 'Company Reg. Number'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tax PIN</Form.Label>
                  <Form.Control
                    value={formData.tax_pin}
                    onChange={(e) => setFormData({ ...formData, tax_pin: e.target.value })}
                    placeholder="KRA PIN"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the client"
                  />
                </Form.Group>
              </Col>
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
              {createMutation.isPending ? 'Creating...' : 'Add Client'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete client <strong>{selectedClient?.name}</strong>? 
          This will also remove all associated matters and documents. This action cannot be undone.
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
