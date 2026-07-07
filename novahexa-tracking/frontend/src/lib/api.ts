/**
 * API client — wraps fetch with auth token injection.
 */
import type { PackageItem, DashboardStats, Notification, ContactMessage, AuthResponse, FaqItem } from '../types';

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? '';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('youms_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    // Auto-logout on 401 — token is stale/invalid
    if (res.status === 401 && localStorage.getItem('youms_token')) {
      localStorage.removeItem('youms_token');
      localStorage.removeItem('youms_user');
      window.location.href = '/login';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const text = await res.text().catch(() => '');
    let message = `Erreur ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post('/api/auth/register', data),
  verifyEmail: (token: string) =>
    api.post<{ status: string; message: string }>('/api/auth/verify-email', { token }),
  resendVerification: (email: string) =>
    api.post<{ status: string; message: string }>('/api/auth/resend-verification', { email }),
  forgotPassword: (email: string) =>
    api.post<{ status: string; message: string }>('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ status: string; message: string }>('/api/auth/reset-password', { token, password }),
};

// ── Packages ─────────────────────────────────────────────────
export const packagesApi = {
  list: () => api.get<PackageItem[]>('/api/admin/packages?status=ALL'),
  listByOwner: () => api.get<PackageItem[]>('/api/client/packages'),
  listPending: () => api.get<PackageItem[]>('/api/admin/packages'),
  get: (id: string) => api.get<PackageItem>(`/api/client/packages/${id}`),
  getByTracking: (trackingNumber: string) =>
    api.get<PackageItem>(`/api/track/${trackingNumber}`),
  submit: (data: Record<string, unknown>) =>
    api.post<{ trackingNumber: string; status: string; estimatedCost: number }>(
      '/api/packages',
      data,
    ),
  getAdmin: (id: string) => api.get<PackageItem>(`/api/admin/packages/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/admin/packages/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/packages/${id}`),
  validate: (trackingNumber: string, data?: Record<string, unknown>) =>
    api.patch(`/api/admin/packages/${trackingNumber}/validate`, data ?? {}),
  refuse: (trackingNumber: string, reason: string) =>
    api.patch(`/api/admin/packages/${trackingNumber}/refuse`, { reason }),
  setInTransit: (trackingNumber: string) =>
    api.patch<PackageItem>(`/api/admin/packages/${trackingNumber}/in-transit`, {}),
  setDelivered: (trackingNumber: string) =>
    api.patch<PackageItem>(`/api/admin/packages/${trackingNumber}/delivered`, {}),
  pause: (trackingNumber: string) =>
    api.patch<PackageItem>(`/api/admin/packages/${trackingNumber}/pause`, {}),
  resume: (trackingNumber: string) =>
    api.patch<PackageItem>(`/api/admin/packages/${trackingNumber}/resume`, {}),
  addWaypoint: (id: string, data: { label: string; lat: number; lng: number; stopDurationMinutes?: number }) =>
    api.post<PackageItem>(`/api/admin/packages/${id}/waypoints`, data),
  deleteWaypoint: (packageId: string, waypointId: string) =>
    api.delete<PackageItem>(`/api/admin/packages/${packageId}/waypoints/${waypointId}`),
  sendMessage: (id: string, data: { subject: string; body: string }) =>
    api.post(`/api/admin/packages/${id}/messages`, data),
  getMessages: (id: string) =>
    api.get(`/api/admin/packages/${id}/messages`),
  createForClient: (data: Record<string, unknown>) =>
    api.post<PackageItem>('/api/admin/packages/create', data),
};

// ── Admin Users ──────────────────────────────────────────
export interface ClientSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  verified: boolean;
}

export const adminUsersApi = {
  list: () => api.get<ClientSummary[]>('/api/admin/users'),
};

// ── Dashboard stats ──────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/api/admin/stats'),
};

// ── Notifications ────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get<Notification[]>('/api/notifications'),
  unreadCount: () => api.get<{ count: number }>('/api/notifications/unread-count'),
  markRead: (id: string) => api.put(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/api/notifications/read-all', {}),
};

// ── Contact messages ─────────────────────────────────────────
export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post('/api/contact', data),
  list: () => api.get<ContactMessage[]>('/api/contact'),
  markTreated: (id: number) => api.put(`/api/contact/${id}/treat`, {}),
};

// ── Uploads ──────────────────────────────────────────────────
export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('youms_token');
  const res = await fetch(`${BASE_URL}/api/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error(`Upload ${res.status}`);
  const data = await res.json();
  return data.url as string;
}

// ── Pricing ──────────────────────────────────────────────
export const pricingApi = {
  estimate: (data: {
    mode: string;
    delay: string;
    material: string;
    weightKg?: number;
    heightCm?: number;
    widthCm?: number;
    lengthCm?: number;
  }) =>
    api.post<{ estimatedCost: number; billableWeight: number; mode: string; delay: string; material: string }>(
      '/api/pricing/estimate',
      data,
    ),
};

// ── PDF ────────────────────────────────────────────────
const BASE_URL_PDF =
  (import.meta as any).env?.VITE_API_BASE_URL ?? '';

export const pdfApi = {
  downloadQuote: (trackingNumber: string) =>
    window.open(`${BASE_URL_PDF}/api/pdf/quote/${trackingNumber}`, '_blank'),
  downloadInvoice: (trackingNumber: string) =>
    window.open(`${BASE_URL_PDF}/api/pdf/invoice/${trackingNumber}`, '_blank'),
  downloadLabel: (trackingNumber: string) =>
    window.open(`${BASE_URL_PDF}/api/pdf/label/${trackingNumber}`, '_blank'),
};

// ── Analytics ──────────────────────────────────────────────
export interface AnalyticsData {
  overview: {
    totalParcels: number;
    delivered: number;
    inTransit: number;
    pending: number;
    refused: number;
    totalRevenue: number;
    currentMonthRevenue: number;
    deliveryRate: number;
    activeShipments: number;
  };
  statusDistribution: { status: string; label: string; count: number }[];
  monthlyShipments: { month: string; count: number }[];
  revenue: { total: number; average: number; count: number };
  transportDistribution: { mode: string; count: number }[];
  deliveryPerformance: { totalDelivered: number; deliveryRate: number };
  topRoutes: { route: string; count: number }[];
  materialDistribution: { material: string; count: number }[];
}

export const analyticsApi = {
  get: () => api.get<AnalyticsData>('/api/admin/analytics'),
};

// ── Messages ──────────────────────────────────────────────
export interface MessageItem {
  id: string;
  subject: string;
  body: string;
  senderName: string;
  sentAt: string;
}

export const messagesApi = {
  send: (parcelId: string, data: { subject: string; body: string }) =>
    api.post<MessageItem>(`/api/admin/packages/${parcelId}/messages`, data),
  list: (parcelId: string) =>
    api.get<MessageItem[]>(`/api/admin/packages/${parcelId}/messages`),
};

// ── Client Messages ──────────────────────────────────────
export const clientMessagesApi = {
  send: (parcelId: string, data: { subject: string; body: string }) =>
    api.post<MessageItem>(`/api/client/packages/${parcelId}/messages`, data),
  list: (parcelId: string) =>
    api.get<MessageItem[]>(`/api/client/packages/${parcelId}/messages`),
};

// ── Profile ──────────────────────────────────────────────
export const profileApi = {
  get: () => api.get<{ id: string; fullName: string; email: string; phone: string; role: string; verified: boolean; createdAt: string }>('/api/client/profile'),
  update: (data: { fullName?: string; email?: string; phone?: string }) =>
    api.put<{ id: string; fullName: string; email: string; phone: string; role: string; verified: boolean }>('/api/client/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ status: string; message: string }>('/api/client/profile/password', { currentPassword, newPassword }),
};

// ── FAQ ──────────────────────────────────────────────────────
export const faqApi = {
  list: () => api.get<FaqItem[]>('/api/faq'),
  listAll: () => api.get<FaqItem[]>('/api/admin/faq'),
  create: (data: { question: string; answer: string; sortOrder: number; enabled: boolean }) =>
    api.post<FaqItem>('/api/admin/faq', data),
  update: (id: string, data: { question: string; answer: string; sortOrder: number; enabled: boolean }) =>
    api.put<FaqItem>(`/api/admin/faq/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/faq/${id}`),
};

// ── Site Settings ──────────────────────────────────────
export interface SiteSettings {
  id: string;
  address: string;
  whatsappNumber: string;
  email: string;
  hours: string;
  companyName: string;
  companyDescription: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  packagesDelivered: number;
  countriesCovered: number;
  copyrightText: string;
  createdAt: string;
  updatedAt: string;
}

export const siteSettingsApi = {
  get: () => api.get<SiteSettings>('/api/admin/settings'),
  update: (data: Partial<SiteSettings>) => api.put<SiteSettings>('/api/admin/settings', data),
  reset: () => api.post<SiteSettings>('/api/admin/settings/reset', {}),
};

// ── Legacy submitPackage (used by PackageHeroForm) ──────
export async function submitPackage(
  payload: Record<string, unknown>,
): Promise<{ trackingNumber: string; status: string; estimatedCost: number }> {
  return packagesApi.submit(payload);
}
