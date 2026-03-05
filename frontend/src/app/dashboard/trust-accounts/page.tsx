'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Row, Col, Card, Table, Badge, Button, Form, Modal, Spinner, InputGroup,
} from 'react-bootstrap';
import {
  FiDollarSign, FiPlus, FiRefreshCw, FiArrowUpCircle, FiArrowDownCircle,
  FiAlertCircle, FiCheckCircle, FiEye,
} from 'react-icons/fi';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface TrustAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_type: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

interface TrustTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  reference_number: string;
  transaction_date: string;
  balance_after: number;
  client?: { id: string; display_name: string };
  matter?: { id: string; matter_number: string; name: string };
}

interface TrustSummary {
  total_accounts: number;
  active_accounts: number;
  total_balance: number;
  total_iolta_balance: number;
  total_retainer_balance: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(cents: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency', currency, minimumFractionDigits: 0,
  }).format(cents / 100);
}

function txBadge(type: string) {
  const map: Record<string, string> = {
    deposit: 'success', withdrawal: 'danger', transfer_in: 'info',
    transfer_out: 'warning', fee: 'secondary', refund: 'primary',
  };
  return map[type] ?? 'secondary';
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TrustAccountsPage() {
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<TrustAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showTxDetail, setShowTxDetail] = useState(false);

  const [accountForm, setAccountForm] = useState({
    account_name: '', account_number: '', bank_name: '',
    account_type: 'iolta', currency: 'KES',
  });

  const [txForm, setTxForm] = useState({
    transaction_type: 'deposit', amount: '', description: '',
    reference_number: '', transaction_date: new Date().toISOString().slice(0, 10),
  });

  // Queries
  const { data: summary } = useQuery<TrustSummary>({
    queryKey: ['trust-accounts', 'summary'],
    queryFn: async () => { const { data } = await api.get('/trust-accounts/summary'); return data; },
  });

  const { data: accounts = [], isLoading } = useQuery<TrustAccount[]>({
    queryKey: ['trust-accounts'],
    queryFn: async () => { const { data } = await api.get('/trust-accounts'); return data; },
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery<TrustTransaction[]>({
    queryKey: ['trust-transactions', selectedAccount?.id],
    queryFn: async () => {
      const { data } = await api.get(`/trust-accounts/${selectedAccount!.id}/transactions`);
      return data.transactions ?? data;
    },
    enabled: !!selectedAccount,
  });

  // Mutations
  const createAccount = useMutation({
    mutationFn: (d: typeof accountForm) => api.post('/trust-accounts', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trust-accounts'] });
      setShowCreateModal(false);
      setAccountForm({ account_name: '', account_number: '', bank_name: '', account_type: 'iolta', currency: 'KES' });
    },
  });

  const createTx = useMutation({
    mutationFn: (d: typeof txForm) =>
      api.post(`/trust-accounts/${selectedAccount!.id}/transactions`, {
        ...d, amount: Math.round(parseFloat(d.amount) * 100),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trust-transactions', selectedAccount?.id] });
      queryClient.invalidateQueries({ queryKey: ['trust-accounts'] });
      setShowTxModal(false);
      setTxForm({ transaction_type: 'deposit', amount: '', description: '', reference_number: '', transaction_date: new Date().toISOString().slice(0, 10) });
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Trust Accounts</h1>
          <p className="page-subtitle">IOLTA & client trust fund management</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" /> New Account
        </Button>
      </div>

      {/* Summary cards */}
      <Row className="g-4 mb-4">
        {[
          { label: 'Total Balance', value: fmt(summary?.total_balance ?? 0), icon: <FiDollarSign />, variant: 'primary' },
          { label: 'IOLTA Funds', value: fmt(summary?.total_iolta_balance ?? 0), icon: <FiCheckCircle />, variant: 'success' },
          { label: 'Retainer Funds', value: fmt(summary?.total_retainer_balance ?? 0), icon: <FiArrowDownCircle />, variant: 'info' },
          { label: 'Active Accounts', value: summary?.active_accounts ?? 0, icon: <FiAlertCircle />, variant: 'warning' },
        ].map((s) => (
          <Col key={s.label} md={6} lg={3}>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value">{s.value}</div>
                </div>
                <div className={`stat-card-icon ${s.variant}`}>{s.icon}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Accounts table + Transaction panel */}
      <Row className="g-4">
        <Col lg={selectedAccount ? 5 : 12}>
          <Card className="shadow-sm">
            <Card.Header className="border-bottom d-flex justify-content-between align-items-center py-3">
              <strong>Accounts</strong>
              <Button variant="outline-secondary" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['trust-accounts'] })}>
                <FiRefreshCw />
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {isLoading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FiDollarSign size={32} className="mb-2" />
                  <p>No trust accounts yet. Create one to get started.</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Account</th>
                      <th>Bank</th>
                      <th>Type</th>
                      <th className="text-end">Balance</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className={selectedAccount?.id === acc.id ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedAccount(acc)}
                      >
                        <td>
                          <div className="fw-semibold">{acc.account_name}</div>
                          <small className="text-muted">{acc.account_number}</small>
                        </td>
                        <td>{acc.bank_name}</td>
                        <td>
                          <Badge bg={acc.account_type === 'iolta' ? 'success' : 'info'} className="text-capitalize">
                            {acc.account_type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="text-end fw-semibold">{fmt(acc.current_balance, acc.currency)}</td>
                        <td>
                          <Button variant="link" size="sm" className="p-0" onClick={(e) => { e.stopPropagation(); setSelectedAccount(acc); setShowTxDetail(true); }}>
                            <FiEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Transactions panel */}
        {selectedAccount && (
          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Header className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{selectedAccount.account_name}</strong>
                    <div className="text-muted small">{selectedAccount.bank_name} · {selectedAccount.account_number}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="success" size="sm" onClick={() => { setTxForm(f => ({ ...f, transaction_type: 'deposit' })); setShowTxModal(true); }}>
                      <FiArrowDownCircle className="me-1" /> Deposit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { setTxForm(f => ({ ...f, transaction_type: 'withdrawal' })); setShowTxModal(true); }}>
                      <FiArrowUpCircle className="me-1" /> Withdraw
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="fs-5 fw-bold text-primary">{fmt(selectedAccount.current_balance, selectedAccount.currency)}</span>
                  <span className="text-muted ms-2 small">current balance</span>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {txLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="primary" size="sm" /></div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-5 text-muted">No transactions recorded.</div>
                ) : (
                  <Table hover responsive className="mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={txBadge(tx.transaction_type)} className="text-capitalize">
                              {tx.transaction_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>
                            <div>{tx.description}</div>
                            {tx.reference_number && <small className="text-muted">Ref: {tx.reference_number}</small>}
                          </td>
                          <td className={`text-end fw-semibold ${tx.transaction_type === 'withdrawal' || tx.transaction_type === 'transfer_out' ? 'text-danger' : 'text-success'}`}>
                            {tx.transaction_type === 'withdrawal' || tx.transaction_type === 'transfer_out' ? '- ' : '+ '}
                            {fmt(tx.amount, selectedAccount.currency)}
                          </td>
                          <td className="text-end text-muted">{fmt(tx.balance_after, selectedAccount.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Create Account Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Trust Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Account Name</Form.Label>
              <Form.Control value={accountForm.account_name} onChange={e => setAccountForm(f => ({ ...f, account_name: e.target.value }))} placeholder="e.g. IOLTA Client Trust" />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control value={accountForm.account_number} onChange={e => setAccountForm(f => ({ ...f, account_number: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control value={accountForm.bank_name} onChange={e => setAccountForm(f => ({ ...f, bank_name: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select value={accountForm.account_type} onChange={e => setAccountForm(f => ({ ...f, account_type: e.target.value }))}>
                    <option value="iolta">IOLTA</option>
                    <option value="retainer">Retainer</option>
                    <option value="escrow">Escrow</option>
                    <option value="settlement">Settlement</option>
                    <option value="operating">Operating</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select value={accountForm.currency} onChange={e => setAccountForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => createAccount.mutate(accountForm)} disabled={createAccount.isPending || !accountForm.account_name || !accountForm.account_number}>
            {createAccount.isPending ? <Spinner size="sm" animation="border" /> : 'Create Account'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Transaction Modal */}
      <Modal show={showTxModal} onHide={() => setShowTxModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {txForm.transaction_type === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'} — {selectedAccount?.account_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select value={txForm.transaction_type} onChange={e => setTxForm(f => ({ ...f, transaction_type: e.target.value }))}>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="fee">Fee</option>
                <option value="refund">Refund</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount ({selectedAccount?.currency})</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{selectedAccount?.currency}</InputGroup.Text>
                    <Form.Control
                      type="number" min="0" step="0.01"
                      value={txForm.amount}
                      onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={txForm.transaction_date} onChange={e => setTxForm(f => ({ ...f, transaction_date: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} placeholder="Transaction description" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control value={txForm.reference_number} onChange={e => setTxForm(f => ({ ...f, reference_number: e.target.value }))} placeholder="Cheque number, wire reference, etc." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTxModal(false)}>Cancel</Button>
          <Button
            variant={txForm.transaction_type === 'deposit' || txForm.transaction_type === 'transfer_in' ? 'success' : 'danger'}
            onClick={() => createTx.mutate(txForm)}
            disabled={createTx.isPending || !txForm.amount || !txForm.description}
          >
            {createTx.isPending ? <Spinner size="sm" animation="border" /> : 'Record Transaction'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
