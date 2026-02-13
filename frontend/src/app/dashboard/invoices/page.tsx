'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Pagination, Badge, Dropdown } from 'react-bootstrap';
import { FiSearch, FiPlus, FiFilter, FiDownload, FiMail, FiEye, FiMoreVertical, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { invoicesApi, Invoice } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', variant: 'secondary' },
  { value: 'sent', label: 'Sent', variant: 'info' },
  { value: 'viewed', label: 'Viewed', variant: 'primary' },
  { value: 'paid', label: 'Paid', variant: 'success' },
  { value: 'partial', label: 'Partial', variant: 'warning' },
  { value: 'overdue', label: 'Overdue', variant: 'danger' },
  { value: 'cancelled', label: 'Cancelled', variant: 'dark' },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', currentPage, searchQuery, statusFilter],
    queryFn: () => invoicesApi.list({
      page: currentPage,
      per_page: perPage,
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['invoices', 'summary'],
    queryFn: () => invoicesApi.summary(),
  });

  const totalPages = Math.ceil((invoicesData?.total || 0) / perPage);

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge bg={statusOption?.variant || 'secondary'} className="text-capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage billing and invoices</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button variant="primary">
            <FiPlus className="me-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-start border-4 border-primary">
            <Card.Body>
              <div className="text-muted small mb-1">Total Billed</div>
              <div className="h4 mb-0">{formatCurrency(summaryData?.total_billed || 0)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 border-start border-4 border-success">
            <Card.Body>
              <div className="text-muted small mb-1">Collected</div>
              <div className="h4 mb-0 text-success">{formatCurrency(summaryData?.total_collected || 0)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 border-start border-4 border-warning">
            <Card.Body>
              <div className="text-muted small mb-1">Outstanding</div>
              <div className="h4 mb-0 text-warning">{formatCurrency(summaryData?.outstanding || 0)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 border-start border-4 border-danger">
            <Card.Body>
              <div className="text-muted small mb-1">Overdue</div>
              <div className="h4 mb-0 text-danger">{formatCurrency(summaryData?.overdue || 0)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                  placeholder="Search by invoice number, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
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
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                <FiFilter className="me-2" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Invoices Table */}
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
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Matter</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesData?.invoices?.length ? (
                    invoicesData.invoices.map((invoice) => {
                      const balance = invoice.total_amount - (invoice.paid_amount || 0);
                      const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && balance > 0;
                      
                      return (
                        <tr key={invoice.id}>
                          <td>
                            <Link href={`/dashboard/invoices/${invoice.id}`} className="fw-medium text-decoration-none">
                              {invoice.invoice_number}
                            </Link>
                          </td>
                          <td>{invoice.client?.name || 'N/A'}</td>
                          <td>{invoice.matter?.name || 'N/A'}</td>
                          <td className="fw-medium">{formatCurrency(invoice.total_amount)}</td>
                          <td className="text-success">{formatCurrency(invoice.paid_amount || 0)}</td>
                          <td className={balance > 0 ? 'text-warning fw-medium' : ''}>
                            {formatCurrency(balance)}
                          </td>
                          <td>
                            {getStatusBadge(isOverdue && invoice.status !== 'paid' ? 'overdue' : invoice.status)}
                          </td>
                          <td>
                            {invoice.due_date ? (
                              <span className={isOverdue ? 'text-danger' : ''}>
                                {new Date(invoice.due_date).toLocaleDateString()}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="text-end">
                            <Dropdown align="end">
                              <Dropdown.Toggle as="div" className="cursor-pointer btn btn-outline-secondary btn-sm">
                                <FiMoreVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item as={Link} href={`/dashboard/invoices/${invoice.id}`}>
                                  <FiEye className="me-2" />
                                  View
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FiDownload className="me-2" />
                                  Download PDF
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FiMail className="me-2" />
                                  Send to Client
                                </Dropdown.Item>
                                {invoice.status !== 'paid' && (
                                  <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} href={`/dashboard/invoices/${invoice.id}/payment`}>
                                      <FiDollarSign className="me-2" />
                                      Record Payment
                                    </Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-5">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, invoicesData?.total || 0)} of {invoicesData?.total || 0} invoices
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
    </div>
  );
}
