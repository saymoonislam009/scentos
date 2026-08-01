async function r<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}
function a<T>(path: string, secret: string, init: RequestInit = {}): Promise<T> {
  return r<T>(path, { ...init, headers: { 'x-admin-secret': secret, ...init.headers } });
}
export const api = {
  getAdvice: (body: Record<string, unknown>) => r<any>('/api/advisor', { method: 'POST', body: JSON.stringify(body) }),
  sendScentGptMessage: (body: { sessionId?: string; message: string }) => r<{ sessionId: string; reply: string }>('/api/scentgpt', { method: 'POST', body: JSON.stringify(body) }),
  suggestLayering: (fragranceIds: string[]) => r<any[]>('/api/layering', { method: 'POST', body: JSON.stringify({ fragranceIds }) }),
  adminLogin:              (s: string) => r<{ ok: boolean }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ secret: s }) }),
  adminStats:              (s: string) => a<any>('/api/admin/stats', s),
  adminListFragrances:     (s: string) => a<any[]>('/api/admin/fragrances', s),
  adminCreateFragrance:    (body: Record<string, unknown>, s: string) => a<any>('/api/admin/fragrances', s, { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateFragrance:    (id: string, body: Record<string, unknown>, s: string) => a<any>(`/api/admin/fragrances/${id}`, s, { method: 'PATCH', body: JSON.stringify(body) }),
  adminDeleteFragrance:    (id: string, s: string) => a<any>(`/api/admin/fragrances/${id}`, s, { method: 'DELETE' }),
  adminListOrders:         (s: string) => a<any[]>('/api/admin/orders', s),
  adminListUsers:          (s: string) => a<any[]>('/api/admin/users', s),
  adminListPartialListings:(s: string) => a<any[]>('/api/admin/partial-listings', s),
  adminUpdatePartialListing:(id: string, body: Record<string, unknown>, s: string) => a<any>(`/api/admin/partial-listings/${id}`, s, { method: 'PATCH', body: JSON.stringify(body) }),
  adminListReports:        (s: string) => a<any[]>('/api/admin/reports', s),
  adminUpdateReport:       (id: string, body: Record<string, unknown>, s: string) => a<any>(`/api/admin/reports/${id}`, s, { method: 'PATCH', body: JSON.stringify(body) }),
  adminBackfillEmbeddings: (s: string) => a<any>('/api/admin/backfill-embeddings', s, { method: 'POST' }),
};
