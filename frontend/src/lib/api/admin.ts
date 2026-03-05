import { api } from './client';

// Admin Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: 'law_firm' | 'legal_department' | 'solo_practitioner' | 'government' | 'non_profit';
  email: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  timezone: string;
  default_currency: string;
  logo_url?: string;
  billing_email?: string;
  tax_id?: string;
  is_active: boolean;
  is_verified: boolean;
  max_seats: number;
  monthly_token_limit: number;
  storage_limit_mb: number;
  feature_ai_assistant: boolean;
  feature_document_assembly: boolean;
  feature_analytics: boolean;
  feature_api_access: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Computed
  used_seats?: number;
  available_seats?: number;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_tier: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'expired';
  billing_interval: 'monthly' | 'quarterly' | 'yearly';
  price_cents: number;
  currency: string;
  seats_included: number;
  additional_seat_price_cents: number;
  monthly_tokens_included: number;
  additional_token_price_cents: number;
  trial_start?: string;
  trial_end?: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  ended_at?: string;
  discount_percent?: number;
  discount_code?: string;
  discount_ends_at?: string;
  auto_renew: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed
  is_active: boolean;
  is_trialing: boolean;
  days_until_renewal?: number;
  effective_price_cents: number;
}

export interface TokenUsageSummary {
  organization_id: string;
  period: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_cents: number;
  total_cost_dollars: number;
  avg_response_time_ms?: number;
  token_limit: number;
  tokens_remaining: number;
  usage_percentage: number;
}

export interface TokenUsageByFeature {
  feature_type: string;
  total_requests: number;
  total_tokens: number;
  total_cost_cents: number;
  percentage_of_total: number;
}

export interface AdminDashboard {
  organizations: {
    total: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    active: number;
    by_tier: Record<string, number>;
    upcoming_renewals: number;
    at_risk: number;
  };
  users: {
    total: number;
    active: number;
  };
  revenue: {
    mrr_cents: number;
    mrr_dollars: number;
  };
  tokens: {
    used_this_month: number;
  };
}

export interface SubscriptionRenewalInfo {
  organization_id: string;
  organization_name: string;
  subscription_id: string;
  plan_tier: string;
  status: string;
  current_period_end?: string;
  days_until_renewal?: number;
  next_billing_amount_cents: number;
  currency: string;
}

export interface OrganizationStats {
  organization_id: string;
  total_users: number;
  active_users: number;
  total_matters: number;
  active_matters: number;
  total_clients: number;
  tokens_used_this_month: number;
  tokens_remaining: number;
  storage_used_mb: number;
  storage_remaining_mb: number;
}

export interface PlatformTokenOverview {
  period: string;
  total_organizations: number;
  active_organizations: number;
  total_requests: number;
  total_tokens: number;
  total_cost_dollars: number;
  top_consuming_orgs: TokenUsageSummary[];
  usage_by_model: Record<string, number>;
  usage_by_feature: TokenUsageByFeature[];
}

// Currency Types
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  symbol_position: 'before' | 'after';
  thousands_separator: string;
  decimal_separator: string;
  is_active: boolean;
  is_base_currency: boolean;
  country_codes?: string;
}

export interface ExchangeRate {
  id: string;
  from_currency_code: string;
  to_currency_code: string;
  rate: number;
  rate_date: string;
  source?: string;
  fetched_at: string;
  inverse_rate: number;
}

export interface CurrencyConversionResult {
  from_currency: string;
  to_currency: string;
  original_amount: number;
  converted_amount: number;
  exchange_rate: number;
  rate_date: string;
  formatted_original: string;
  formatted_converted: string;
}

// Admin API functions
export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<AdminDashboard> => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  // Organizations
  listOrganizations: async (params?: { 
    skip?: number; 
    limit?: number; 
    is_active?: boolean;
    search?: string;
  }): Promise<Organization[]> => {
    const { data } = await api.get('/admin/organizations', { params });
    return data;
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const { data } = await api.get(`/admin/organizations/${id}`);
    return data;
  },

  createOrganization: async (orgData: Partial<Organization>): Promise<Organization> => {
    const { data } = await api.post('/admin/organizations', orgData);
    return data;
  },

  updateOrganization: async (id: string, orgData: Partial<Organization>): Promise<Organization> => {
    const { data } = await api.patch(`/admin/organizations/${id}`, orgData);
    return data;
  },

  getOrganizationStats: async (id: string): Promise<OrganizationStats> => {
    const { data } = await api.get(`/admin/organizations/${id}/stats`);
    return data;
  },

  getOrganizationUsers: async (id: string) => {
    const { data } = await api.get(`/admin/organizations/${id}/users`);
    return data;
  },

  // Subscriptions
  listSubscriptions: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    plan_tier?: string;
  }): Promise<Subscription[]> => {
    const { data } = await api.get('/admin/subscriptions', { params });
    return data;
  },

  getUpcomingRenewals: async (days: number = 7): Promise<SubscriptionRenewalInfo[]> => {
    const { data } = await api.get('/admin/subscriptions/renewals', { params: { days } });
    return data;
  },

  createSubscription: async (subData: Partial<Subscription>): Promise<Subscription> => {
    const { data } = await api.post('/admin/subscriptions', subData);
    return data;
  },

  updateSubscription: async (id: string, subData: Partial<Subscription>): Promise<Subscription> => {
    const { data } = await api.patch(`/admin/subscriptions/${id}`, subData);
    return data;
  },

  cancelSubscription: async (id: string, immediate: boolean = false) => {
    const { data } = await api.post(`/admin/subscriptions/${id}/cancel`, null, { 
      params: { immediate } 
    });
    return data;
  },

  // Token Usage
  getPlatformTokenOverview: async (period?: string): Promise<PlatformTokenOverview> => {
    const { data } = await api.get('/admin/tokens/overview', { params: { period } });
    return data;
  },

  getOrganizationTokenUsage: async (orgId: string, period?: string): Promise<TokenUsageSummary> => {
    const { data } = await api.get(`/admin/tokens/organization/${orgId}`, { params: { period } });
    return data;
  },
};

// Currency API functions
export const currencyApi = {
  list: async (activeOnly: boolean = true): Promise<Currency[]> => {
    const { data } = await api.get('/currencies', { params: { active_only: activeOnly } });
    return data;
  },

  listBrief: async (): Promise<{ code: string; name: string; symbol: string }[]> => {
    const { data } = await api.get('/currencies/brief');
    return data;
  },

  get: async (code: string): Promise<Currency> => {
    const { data } = await api.get(`/currencies/${code}`);
    return data;
  },

  getLatestRates: async (base: string = 'USD'): Promise<{ base: string; date: string; rates: Record<string, number> }> => {
    const { data } = await api.get('/currencies/rates/latest', { params: { base } });
    return data;
  },

  getExchangeRate: async (fromCode: string, toCode: string, rateDate?: string): Promise<ExchangeRate> => {
    const { data } = await api.get(`/currencies/rates/${fromCode}/${toCode}`, { 
      params: rateDate ? { rate_date: rateDate } : undefined 
    });
    return data;
  },

  convert: async (
    fromCurrency: string, 
    toCurrency: string, 
    amount: number,
    rateDate?: string
  ): Promise<CurrencyConversionResult> => {
    const { data } = await api.post('/currencies/convert', {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount,
      rate_date: rateDate
    });
    return data;
  },

  bulkConvert: async (amounts: Array<{
    from_currency: string;
    to_currency: string;
    amount: number;
  }>) => {
    const { data } = await api.post('/currencies/convert/bulk', { amounts });
    return data;
  },

  getRateHistory: async (
    fromCode: string, 
    toCode: string, 
    startDate: string, 
    endDate: string
  ) => {
    const { data } = await api.get(`/currencies/rates/history/${fromCode}/${toCode}`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return data;
  },
};
