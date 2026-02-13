'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Button, Form, Modal, Spinner, Badge, Dropdown } from 'react-bootstrap';
import { FiPlus, FiFilter, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { tasksApi, mattersApi, Task } from '@/lib/api';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'secondary',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

const STATUS_COLUMNS = [
  { key: 'pending', label: 'To Do', color: 'secondary' },
  { key: 'in_progress', label: 'In Progress', color: 'primary' },
  { key: 'review', label: 'Review', color: 'warning' },
  { key: 'completed', label: 'Completed', color: 'success' },
];

interface TaskFormData {
  title: string;
  description: string;
  matter_id: string;
  priority: string;
  due_date: string;
  estimated_hours: string;
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    matter_id: '',
    priority: 'normal',
    due_date: '',
    estimated_hours: '',
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: () => tasksApi.list({
      per_page: 100,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    }),
  });

  const { data: mattersData } = useQuery({
    queryKey: ['matters', 'active'],
    queryFn: () => mattersApi.list({ per_page: 100, status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.create>[0]) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof tasksApi.update>[1] }) => 
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowDeleteModal(false);
      setSelectedTask(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      matter_id: '',
      priority: 'normal',
      due_date: '',
      estimated_hours: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      matter_id: formData.matter_id || undefined,
      priority: formData.priority as Task['priority'],
      due_date: formData.due_date || undefined,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
    });
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateMutation.mutate({
      id: task.id,
      data: { status: newStatus as Task['status'] },
    });
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasksData?.tasks?.filter(task => task.status === status) || [];
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, variant: 'danger' };
    if (diffDays === 0) return { text: 'Due today', variant: 'warning' };
    if (diffDays === 1) return { text: 'Due tomorrow', variant: 'warning' };
    if (diffDays <= 7) return { text: `${diffDays}d left`, variant: 'info' };
    return { text: date.toLocaleDateString(), variant: 'secondary' };
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and track your legal tasks</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FiPlus className="me-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={3}>
              <Form.Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                }}
              >
                <FiFilter className="me-2" />
                Clear Filters
              </Button>
            </Col>
            <Col md={6} className="text-end">
              <span className="text-muted">
                {tasksData?.total || 0} total tasks
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Kanban Board */}
      <Row className="g-3">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.key);
          return (
            <Col key={column.key} md={6} lg={3}>
              <Card className="h-100">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={column.color}>{columnTasks.length}</Badge>
                    <span className="fw-medium">{column.label}</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {columnTasks.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p className="small mb-0">No tasks</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {columnTasks.map((task) => {
                        const dueInfo = task.due_date ? formatDueDate(task.due_date) : null;
                        return (
                          <Card key={task.id} className="shadow-sm">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg={PRIORITY_COLORS[task.priority] || 'secondary'} className="text-capitalize">
                                  {task.priority}
                                </Badge>
                                <Dropdown align="end">
                                  <Dropdown.Toggle as="div" className="cursor-pointer">
                                    <FiMoreVertical className="text-muted" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Header>Move to</Dropdown.Header>
                                    {STATUS_COLUMNS.filter(s => s.key !== task.status).map((status) => (
                                      <Dropdown.Item 
                                        key={status.key}
                                        onClick={() => handleStatusChange(task, status.key)}
                                      >
                                        {status.label}
                                      </Dropdown.Item>
                                    ))}
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      className="text-danger"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <FiTrash2 className="me-2" />
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              
                              <h6 className="mb-2">{task.title}</h6>
                              
                              {task.description && (
                                <p className="text-muted small mb-2" style={{ 
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}>
                                  {task.description}
                                </p>
                              )}
                              
                              {task.matter && (
                                <div className="small text-muted mb-2">
                                  📁 {task.matter.name}
                                </div>
                              )}
                              
                              <div className="d-flex justify-content-between align-items-center">
                                {dueInfo ? (
                                  <Badge bg={dueInfo.variant} className="d-flex align-items-center gap-1">
                                    <FiCalendar size={12} />
                                    {dueInfo.text}
                                  </Badge>
                                ) : (
                                  <span></span>
                                )}
                                
                                {task.estimated_hours && (
                                  <span className="small text-muted d-flex align-items-center gap-1">
                                    <FiClock size={12} />
                                    {task.estimated_hours}h
                                  </span>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                  />
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
                    placeholder="Task details and instructions"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Related Matter</Form.Label>
                  <Form.Select
                    value={formData.matter_id}
                    onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                  >
                    <option value="">No matter linked</option>
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
                  <Form.Label>Priority *</Form.Label>
                  <Form.Select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estimated Hours</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    placeholder="e.g., 2.5"
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
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete task <strong>{selectedTask?.title}</strong>? 
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Task'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
