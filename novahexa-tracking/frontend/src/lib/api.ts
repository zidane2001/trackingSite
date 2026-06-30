/**
 * API client — wraps fetch with auth token injection.
 */
import type { PackageItem, DashboardStats, Notification, ContactMessage, AuthResponse } from '../types';

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('novahexa_token');
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
    const text = await res.text().catch(() => '');
    throw new Error(text || `API ${res.status}`);
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
};

// ── Packages ─────────────────────────────────────────────────
export const packagesApi = {
  list: () => api.get<PackageItem[]>('/api/packages'),
  listByOwner: (ownerId: string) =>
    api.get<PackageItem[]>(`/api/packages?ownerId=${ownerId}`),
  get: (id: string) => api.get<PackageItem>(`/api/packages/${id}`),
  getByTracking: (trackingNumber: string) =>
    api.get<PackageItem>(`/api/packages/tracking/${trackingNumber}`),
  submit: (data: Record<string, unknown>) =>
    api.post<{ trackingNumber: string; status: string; estimatedCost: number }>(
      '/api/packages',
      data,
    ),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/packages/${id}`, data),
  delete: (id: string) => api.delete(`/api/packages/${id}`),
  validate: (trackingNumber: string, data?: Record<string, unknown>) =>
    api.patch(`/api/admin/packages/${trackingNumber}/validate`, data ?? {}),
  refuse: (trackingNumber: string, reason: string) =>
    api.patch(`/api/admin/packages/${trackingNumber}/refuse`, { reason }),
  addWaypoint: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/packages/${id}/waypoints`, data),
  deleteWaypoint: (packageId: string, waypointId: string) =>
    api.delete(`/api/packages/${packageId}/waypoints/${waypointId}`),
  sendMessage: (id: string, data: { subject: string; body: string }) =>
    api.post(`/api/packages/${id}/messages`, data),
  getMessages: (id: string) =>
    api.get(`/api/packages/${id}/messages`),
};

// ── Dashboard stats ──────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/api/admin/stats'),
};

// ── Notifications ────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get<Notification[]>('/api/notifications'),
  markRead: (id: number) => api.put(`/api/notifications/${id}/read`, {}),
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
  const token = localStorage.getItem('novahexa_token');
  const res = await fetch(`${BASE_URL}/api/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error(`Upload ${res.status}`);
  const data = await res.json();
  return data.url as string;
}

// ── Legacy submitPackage (used by PackageHeroForm) ──────
export async function submitPackage(
  payload: Record<string, unknown>,
): Promise<{ trackingNumber: string; status: string; estimatedCost: number }> {
  return packagesApi.submit(payload);
}
