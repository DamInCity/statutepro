'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Row, Col, Card, Button, Form, Spinner, Table, InputGroup,
} from 'react-bootstrap';
import { FiPlus, FiTrash2, FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { api, clientsApi, mattersApi } from '@/lib/api';

interface LineItem {
  description: string;
  quantity: number;   // hundredths (100 = 1.00 unit)
  unit_price: number; // cents
}

interface InvoiceFormData {
  client_id: string;
  matter_id: string;
  issue_date: string;
  due_date: string;
  tax_rate: string;       // percentage, e.g. "16" → 1600 basis points
  discount_amount: string; // KES, converted to cents on submit
  currency: string;
  notes: string;
  payment_terms: string;
  line_items: LineItem[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysLater(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatKES(cents: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(cents / 100);
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [form, setForm] = useState<InvoiceFormData>({
    client_id: '',
    matter_id: '',
    issue_date: today(),
    due_date: daysLater(30),
    tax_rate: '16',
    discount_amount: '',
    currency: 'KES',
    notes: '',
    payment_terms: 'Net 30',
    line_items: [{ description: '', quantity: 100, unit_price: 0 }],
  });

  // Clients list
  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientsApi.list({ per_page: 100 }),
  });
  const clients = (clientsData as any)?.clients ?? (Array.isArray(clientsData) ? clientsData : []);

  // Matters for selected client
  const { data: mattersData } = useQuery({
    queryKey: ['matters', 'for-client', form.client_id],
    queryFn: () => mattersApi.list({ per_page: 100, client_id: form.client_id }),
    enabled: !!form.client_id,
  });
  const matters = (mattersData as any)?.matters ?? (Array.isArray(mattersData) ? mattersData : []);

  // Create invoice mutation
  const createMutation = useMutation({
    mutationFn: (payload: object) => api.post('/invoices', payload),
    onSuccess: () => router.push('/dashboard/invoices'),
  });

  // ── Line item helpers ───────────────────────────────────────────────

  const updateLine = (idx: number, field: keyof LineItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.line_items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, line_items: items };
    });
  };

  const addLine = () =>
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', quantity: 100, unit_price: 0 }],
    }));

  const removeLine = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== idx),
    }));

  // ── Totals ──────────────────────────────────────────────────────────

  const subtotalCents = form.line_items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return sum + Math.round((qty / 100) * price);
  }, 0);

  const taxRate = Math.round((parseFloat(form.tax_rate) || 0) * 100); // to basis points
  const taxCents = Math.round((subtotalCents * taxRate) / 10000);
  const discountCents = Math.round((parseFloat(form.discount_amount) || 0) * 100);
  const totalCents = subtotalCents + taxCents - discountCents;

  // ── Submit ──────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) return;

    createMutation.mutate({
      client_id: form.client_id,
      matter_id: form.matter_id || undefined,
      issue_date: form.issue_date,
      due_date: form.due_date,
      tax_rate: taxRate,
      discount_amount: discountCents,
      currency: form.currency,
      notes: form.notes || undefined,
      payment_terms: form.payment_terms || undefined,
      line_items: form.line_items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <Link href="/dashboard/invoices">
            <Button variant="outline-secondary" size="sm">
              <FiArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="page-title mb-0">New Invoice</h1>
            <p className="page-subtitle mb-0">Create a new client invoice</p>
          </div>
        </div>
        <Button
          variant="primary"
          form="invoice-form"
          type="submit"
          disabled={createMutation.isPending || !form.client_id}
        >
          {createMutation.isPending ? (
            <><Spinner size="sm" className="me-2" />Saving…</>
          ) : (
            <><FiSave className="me-2" />Save Invoice</>
          )}
        </Button>
      </div>

      {createMutation.isError && (
        <div className="alert alert-danger mb-4">
          Failed to create invoice. Please check the form and try again.
        </div>
      )}

      <Form id="invoice-form" onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left column — client / matter / dates */}
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white border-bottom py-3">
                <strong>Invoice Details</strong>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Client *</Form.Label>
                  <Form.Select
                    required
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value, matter_id: '' })}
                  >
                    <option value="">Select client…</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Matter (optional)</Form.Label>
                  <Form.Select
                    value={form.matter_id}
                    onChange={(e) => setForm({ ...form, matter_id: e.target.value })}
                    disabled={!form.client_id}
                  >
                    <option value="">No specific matter</option>
                    {matters.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.matter_number} – {m.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row className="g-2">
                  <Col>
                    <Form.Group>
                      <Form.Label>Issue Date *</Form.Label>
                      <Form.Control
                        type="date"
                        required
                        value={form.issue_date}
                        onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Due Date *</Form.Label>
                      <Form.Control
                        type="date"
                        required
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'ZAR', 'NGN'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Payment Terms</Form.Label>
                  <Form.Select
                    value={form.payment_terms}
                    onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Net 14">Net 14</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes for the client…"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Totals summary */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <strong>Summary</strong>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatKES(subtotalCents)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">VAT / Tax</span>
                  <div className="d-flex align-items-center gap-2" style={{ width: 140 }}>
                    <InputGroup size="sm">
                      <Form.Control
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={form.tax_rate}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                        style={{ maxWidth: 70 }}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                    <span className="text-end" style={{ minWidth: 70 }}>{formatKES(taxCents)}</span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Discount</span>
                  <div className="d-flex align-items-center gap-2" style={{ width: 140 }}>
                    <Form.Control
                      size="sm"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.discount_amount}
                      onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                      style={{ maxWidth: 80 }}
                    />
                    <span className="text-end text-danger" style={{ minWidth: 70 }}>
                      {discountCents > 0 ? `- ${formatKES(discountCents)}` : '—'}
                    </span>
                  </div>
                </div>

                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-primary">{formatKES(totalCents)}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right column — line items */}
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                <strong>Line Items</strong>
                <Button variant="outline-primary" size="sm" onClick={addLine}>
                  <FiPlus className="me-1" /> Add Line
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 280 }}>Description</th>
                      <th style={{ width: 110 }}>Qty (hrs)</th>
                      <th style={{ width: 140 }}>Unit Price (KES)</th>
                      <th className="text-end" style={{ width: 130 }}>Amount</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.line_items.map((item, idx) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unit_price) || 0;
                      const lineCents = Math.round((qty / 100) * price);

                      return (
                        <tr key={idx}>
                          <td>
                            <Form.Control
                              required
                              size="sm"
                              placeholder="e.g. Legal consultation – 2 hrs"
                              value={item.description}
                              onChange={(e) => updateLine(idx, 'description', e.target.value)}
                            />
                          </td>
                          <td>
                            <InputGroup size="sm">
                              <Form.Control
                                type="number"
                                min={1}
                                step={25}
                                value={qty}
                                onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))}
                                title="Quantity in hundredths — 100 = 1 unit/hour"
                              />
                            </InputGroup>
                            <small className="text-muted">{(qty / 100).toFixed(2)} hrs</small>
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min={0}
                              step={100}
                              value={price}
                              onChange={(e) => updateLine(idx, 'unit_price', Number(e.target.value))}
                              placeholder="cents, e.g. 500000"
                            />
                            <small className="text-muted">{formatKES(price)}/hr</small>
                          </td>
                          <td className="text-end fw-semibold">{formatKES(lineCents)}</td>
                          <td>
                            {form.line_items.length > 1 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger"
                                onClick={() => removeLine(idx)}
                              >
                                <FiTrash2 />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3} className="text-end fw-semibold">Subtotal</td>
                      <td className="text-end fw-semibold">{formatKES(subtotalCents)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
