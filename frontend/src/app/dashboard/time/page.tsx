'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Table, Button, Form, InputGroup, Modal, Spinner, Badge } from 'react-bootstrap';
import { FiPlus, FiClock, FiPlay, FiSquare, FiTrash2, FiCalendar } from 'react-icons/fi';
import { timeEntriesApi, mattersApi, TimeEntry } from '@/lib/api';
import { format } from 'date-fns';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface TimeEntryFormData {
  matter_id: string;
  description: string;
  hours: string;
  date: string;
  is_billable: boolean;
  hourly_rate: string;
}

export default function TimeEntriesPage() {
  const queryClient = useQueryClient();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerMatter, setTimerMatter] = useState<string>('');
  const [timerDescription, setTimerDescription] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const [formData, setFormData] = useState<TimeEntryFormData>({
    matter_id: '',
    description: '',
    hours: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    is_billable: true,
    hourly_rate: '',
  });

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['time-entries', dateFilter],
    queryFn: () => timeEntriesApi.list({
      per_page: 100,
      date: dateFilter || undefined,
    }),
  });

  const { data: todaySummary } = useQuery({
    queryKey: ['time-entries', 'today'],
    queryFn: () => timeEntriesApi.todaySummary(),
  });

  const { data: mattersData } = useQuery({
    queryKey: ['matters', 'active'],
    queryFn: () => mattersApi.list({ per_page: 100, status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof timeEntriesApi.create>[0]) => timeEntriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timeEntriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setShowDeleteModal(false);
      setSelectedEntry(null);
    },
  });

  const resetForm = () => {
    setFormData({
      matter_id: '',
      description: '',
      hours: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      is_billable: true,
      hourly_rate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      matter_id: formData.matter_id,
      description: formData.description,
      hours: parseFloat(formData.hours),
      date: formData.date,
      is_billable: formData.is_billable,
      hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) * 100 : undefined,
    });
  };

  const handleDelete = () => {
    if (selectedEntry) {
      deleteMutation.mutate(selectedEntry.id);
    }
  };

  // Timer functions
  const startTimer = () => {
    if (!timerMatter) {
      alert('Please select a matter first');
      return;
    }
    setIsTimerRunning(true);
    setTimerStart(new Date());
    
    // Update elapsed time every second
    const interval = setInterval(() => {
      if (timerStart) {
        setElapsedTime(Math.floor((new Date().getTime() - timerStart.getTime()) / 1000));
      }
    }, 1000);
    
    // Store interval ID for cleanup
    timerIntervalRef.current = interval;
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (timerStart && timerMatter) {
      const hours = elapsedTime / 3600;
      // Create time entry
      createMutation.mutate({
        matter_id: timerMatter,
        description: timerDescription || 'Timed work',
        hours: Math.round(hours * 100) / 100,
        date: format(new Date(), 'yyyy-MM-dd'),
        is_billable: true,
      });
      
      // Reset timer
      setTimerStart(null);
      setTimerMatter('');
      setTimerDescription('');
      setElapsedTime(0);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get entries as array — backend returns a plain array
  const entries: TimeEntry[] = Array.isArray(entriesData) ? entriesData : [];
  
  // Group entries by matter
  interface MatterGroup {
    matter?: TimeEntry['matter'];
    entries: TimeEntry[];
    totalHours: number;
    totalAmount: number;
  }
  
  const entriesByMatter = entries.reduce<Record<string, MatterGroup>>((acc, entry) => {
    const matterId = entry.matter?.id || 'no-matter';
    if (!acc[matterId]) {
      acc[matterId] = {
        matter: entry.matter,
        entries: [],
        totalHours: 0,
        totalAmount: 0,
      };
    }
    acc[matterId].entries.push(entry);
    acc[matterId].totalHours += entry.hours || 0;
    acc[matterId].totalAmount += entry.total_amount || 0;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Time Tracking</h1>
          <p className="page-subtitle">Track billable and non-billable time</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" />
          Add Time Entry
        </Button>
      </div>

      {/* Timer Card */}
      <Card className="mb-4 border-primary">
        <Card.Body>
          <Row className="align-items-center g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Matter</Form.Label>
                <Form.Select
                  value={timerMatter}
                  onChange={(e) => setTimerMatter(e.target.value)}
                  disabled={isTimerRunning}
                >
                  <option value="">Select matter...</option>
                  {mattersData?.matters?.map((matter) => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matter_number} - {matter.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Description</Form.Label>
                <Form.Control
                  value={timerDescription}
                  onChange={(e) => setTimerDescription(e.target.value)}
                  placeholder="What are you working on?"
                  disabled={isTimerRunning}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="text-center">
              <div className="h2 mb-0 font-monospace text-primary">
                {formatElapsedTime(elapsedTime)}
              </div>
            </Col>
            <Col md={2} className="text-end">
              {isTimerRunning ? (
                <Button variant="danger" size="lg" onClick={stopTimer}>
                  <FiSquare className="me-2" />
                  Stop
                </Button>
              ) : (
                <Button variant="success" size="lg" onClick={startTimer}>
                  <FiPlay className="me-2" />
                  Start
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Today's Summary */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                <FiClock className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-muted small">Today&apos;s Hours</div>
                <div className="h4 mb-0">{formatDuration(todaySummary?.total_hours || 0)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3">
                <FiClock className="text-success" size={24} />
              </div>
              <div>
                <div className="text-muted small">Billable Hours</div>
                <div className="h4 mb-0 text-success">{formatDuration(todaySummary?.billable_hours || 0)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                <FiClock className="text-warning" size={24} />
              </div>
              <div>
                <div className="text-muted small">Billable Amount</div>
                <div className="h4 mb-0">{formatCurrency(todaySummary?.total_amount || 0)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Date Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiCalendar />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={8} className="text-end">
              <span className="text-muted">
                {entries.length} entries • 
                {' '}{formatDuration(entries.reduce((sum, e) => sum + (e.hours || 0), 0))} total
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Time Entries */}
      {isLoading ? (
        <div className="loading-spinner py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : Object.keys(entriesByMatter).length > 0 ? (
        Object.entries(entriesByMatter).map(([matterId, group]) => (
          <Card key={matterId} className="mb-3">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-medium">
                  {group.matter ? `${group.matter.matter_number} - ${group.matter.name}` : 'No Matter Assigned'}
                </span>
              </div>
              <div className="text-muted">
                {formatDuration(group.totalHours)} • {formatCurrency(group.totalAmount)}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Hours</th>
                    <th className="text-center">Billable</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div>{entry.description}</div>
                        <small className="text-muted">
                          {entry.user?.full_name || 'Unknown'}
                        </small>
                      </td>
                      <td className="text-center">
                        <Badge bg="light" text="dark" className="font-monospace">
                          {formatDuration(entry.hours)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {entry.is_billable ? (
                          <Badge bg="success">Billable</Badge>
                        ) : (
                          <Badge bg="secondary">Non-billable</Badge>
                        )}
                      </td>
                      <td className="text-end">
                        {entry.is_billable ? formatCurrency(entry.total_amount || 0) : '-'}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiTrash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card>
          <Card.Body className="text-center text-muted py-5">
            <FiClock size={48} className="mb-3 opacity-50" />
            <p className="mb-0">No time entries for this date</p>
          </Card.Body>
        </Card>
      )}

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Time Entry</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Matter *</Form.Label>
                  <Form.Select
                    required
                    value={formData.matter_id}
                    onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                  >
                    <option value="">Select matter</option>
                    {mattersData?.matters?.map((matter) => (
                      <option key={matter.id} value={matter.id}>
                        {matter.matter_number} - {matter.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What work did you do?"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Hours *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.25"
                    min="0.25"
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="e.g., 1.5"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Hourly Rate (KES)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    placeholder="Leave blank for matter rate"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>&nbsp;</Form.Label>
                  <Form.Check
                    type="switch"
                    id="is-billable"
                    label="Billable"
                    checked={formData.is_billable}
                    onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                    className="mt-2"
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
              {createMutation.isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Time Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this time entry? This action cannot be undone.
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
