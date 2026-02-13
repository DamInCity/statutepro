import { api } from './client';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  title?: string;
  role: 'admin' | 'partner' | 'associate' | 'paralegal' | 'staff' | 'readonly';
  is_active: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  client_number: string;
  client_type: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  tax_pin?: string;
  notes?: string;
  matters_count?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Matter {
  id: string;
  matter_number: string;
  name: string;
  description?: string;
  status: 'intake' | 'active' | 'pending' | 'on_hold' | 'closed' | 'archived';
  practice_area: string;
  billing_type: string;
  hourly_rate?: number;
  flat_fee?: number;
  client_id: string;
  client?: Client;
  responsible_attorney_id?: string;
  responsible_attorney?: User;
  open_date: string;
  close_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  due_date?: string;
  estimated_hours?: number;
  matter_id?: string;
  matter?: { id: string; matter_number: string; name: string };
  assigned_to_id?: string;
  assigned_to?: { id: string; email: string; first_name: string; last_name: string };
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client?: Client;
  matter_id?: string;
  matter?: { id: string; matter_number: string; name: string };
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'void';
  issue_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  amount_paid: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  entry_date: string;
  date?: string;
  hours: number;
  duration_minutes: number;
  description: string;
  status: string;
  hourly_rate: number;
  total_amount?: number;
  is_billable: boolean;
  matter_id: string;
  matter?: { id: string; matter_number: string; name: string };
  user_id: string;
  user?: { id: string; full_name: string };
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_clients: number;
  active_clients: number;
  total_matters: number;
  active_matters: number;
  total_users: number;
  active_users: number;
}

export interface AnalyticsRevenue {
  total_billed: number;
  total_collected: number;
  outstanding: number;
  overdue: number;
  average_invoice_amount: number;
  collection_rate: number;
}

export interface AnalyticsDashboard {
  overview: AnalyticsOverview;
  revenue: AnalyticsRevenue;
  billable_hours: {
    total_hours: number;
    billable_hours: number;
    non_billable_hours: number;
    utilization_rate: number;
  };
  trends: {
    months: string[];
    revenue: number[];
    hours: number[];
    new_matters: number[];
  };
}

// Pagination response
export interface PaginatedResponse<T> {
  items?: T[];
  entries?: T[];
  clients?: T[];
  matters?: T[];
  tasks?: T[];
  invoices?: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// API functions

// Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },
  
  register: async (userData: { email: string; password: string; first_name: string; last_name: string }) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  
  refresh: async (refreshToken: string) => {
    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return data;
  },
  
  me: async (): Promise<User> => {
    const { data } = await api.get('/users/me');
    return data;
  },
};

// Users
export const usersApi = {
  list: async (params?: { page?: number; per_page?: number }) => {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },
  
  get: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  
  update: async (id: string, userData: Partial<User>) => {
    const { data } = await api.patch(`/users/${id}`, userData);
    return data;
  },
};

// Clients
export const clientsApi = {
  list: async (params?: { page?: number; per_page?: number; status?: string; search?: string; client_type?: string }) => {
    const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return data;
  },
  
  get: async (id: string): Promise<Client> => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },
  
  create: async (clientData: Partial<Client>) => {
    const { data } = await api.post('/clients', clientData);
    return data;
  },
  
  update: async (id: string, clientData: Partial<Client>) => {
    const { data } = await api.patch(`/clients/${id}`, clientData);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/clients/${id}`);
  },
};

// Matters
export const mattersApi = {
  list: async (params?: { page?: number; per_page?: number; status?: string; client_id?: string; search?: string; practice_area?: string }) => {
    const { data } = await api.get<PaginatedResponse<Matter>>('/matters', { params });
    return data;
  },
  
  get: async (id: string): Promise<Matter> => {
    const { data } = await api.get(`/matters/${id}`);
    return data;
  },
  
  create: async (matterData: Partial<Matter>) => {
    const { data } = await api.post('/matters', matterData);
    return data;
  },
  
  update: async (id: string, matterData: Partial<Matter>) => {
    const { data } = await api.patch(`/matters/${id}`, matterData);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/matters/${id}`);
  },
  
  close: async (id: string) => {
    const { data } = await api.post(`/matters/${id}/close`);
    return data;
  },
};

// Tasks
export const tasksApi = {
  list: async (params?: { 
    page?: number; 
    per_page?: number; 
    status?: string; 
    priority?: string;
    matter_id?: string;
    assigned_to_id?: string;
    overdue_only?: boolean;
  }) => {
    const { data } = await api.get<{ tasks: Task[]; total: number; page: number; per_page: number; pages: number }>('/tasks', { params });
    return data;
  },
  
  myTasks: async (params?: { page?: number; per_page?: number; status?: string }) => {
    const { data } = await api.get<{ tasks: Task[]; total: number; page: number; per_page: number; pages: number }>('/tasks/my', { params });
    return data;
  },
  
  summary: async () => {
    const { data } = await api.get('/tasks/summary');
    return data;
  },
  
  get: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },
  
  create: async (taskData: Partial<Task>) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },
  
  update: async (id: string, taskData: Partial<Task>) => {
    const { data } = await api.patch(`/tasks/${id}`, taskData);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
  
  complete: async (id: string) => {
    const { data } = await api.post(`/tasks/${id}/complete`);
    return data;
  },
  
  assign: async (id: string, assignedToId: string | null) => {
    const { data } = await api.post(`/tasks/${id}/assign`, { assigned_to_id: assignedToId });
    return data;
  },
};

// Invoices
export const invoicesApi = {
  list: async (params?: { page?: number; per_page?: number; status?: string; client_id?: string; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return data;
  },
  
  get: async (id: string): Promise<Invoice> => {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },
  
  summary: async () => {
    const { data } = await api.get('/invoices/summary');
    return data;
  },
};

// Time Entries
export interface TimeEntrySummary {
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_amount: number;
}

export const timeEntriesApi = {
  list: async (params?: { page?: number; per_page?: number; matter_id?: string; user_id?: string; date?: string }) => {
    const { data } = await api.get<PaginatedResponse<TimeEntry>>('/time-entries', { params });
    return data;
  },
  
  myEntries: async (params?: { page?: number; per_page?: number; start_date?: string; end_date?: string }) => {
    const { data } = await api.get<PaginatedResponse<TimeEntry>>('/time-entries/my', { params });
    return data;
  },
  
  todaySummary: async (): Promise<TimeEntrySummary> => {
    const { data } = await api.get('/time-entries/today/summary');
    return data;
  },
  
  create: async (entryData: { 
    matter_id: string;
    description: string;
    hours: number;
    date: string;
    is_billable?: boolean;
    hourly_rate?: number;
  }) => {
    const { data } = await api.post('/time-entries', entryData);
    return data;
  },
  
  update: async (id: string, entryData: Partial<TimeEntry>) => {
    const { data } = await api.patch(`/time-entries/${id}`, entryData);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/time-entries/${id}`);
  },
};

// Analytics
export const analyticsApi = {
  dashboard: async (): Promise<AnalyticsDashboard> => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },
  
  overview: async () => {
    const { data } = await api.get('/analytics/overview');
    return data;
  },
  
  revenue: async (params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get('/analytics/revenue', { params });
    return data;
  },
  
  billableHours: async (params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get('/analytics/billable-hours', { params });
    return data;
  },
  
  attorneyPerformance: async () => {
    const { data } = await api.get('/analytics/attorney-performance');
    return data;
  },
};
