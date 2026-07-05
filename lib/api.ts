async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ScentOS API ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  getAdvice: (input: Record<string, unknown>) => request<any>('/api/advisor', { method: 'POST', body: JSON.stringify(input) }),
  sendScentGptMessage: (body: { sessionId?: string; message: string }) =>
    request<{ sessionId: string; reply: string }>('/api/scentgpt', { method: 'POST', body: JSON.stringify(body) }),
  suggestLayering: (fragranceIds: string[]) =>
    request<any[]>('/api/layering', { method: 'POST', body: JSON.stringify({ fragranceIds }) }),

  // -- Admin (separate shared-secret auth, not Supabase Auth) --
  adminLogin: (secret: string) => request<{ ok: boolean }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ secret }) }),
  adminStats: (secret: string) => adminRequest<any>('/api/admin/stats', secret),
  adminListFragrances: (secret: string) => adminRequest<any[]>('/api/admin/fragrances', secret),
  adminCreateFragrance: (body: Record<string, unknown>, secret: string) =>
    adminRequest<any>('/api/admin/fragrances', secret, { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateFragrance: (id: string, body: Record<string, unknown>, secret: string) =>
    adminRequest<any>(`/api/admin/fragrances/${id}`, secret, { method: 'PATCH', body: JSON.stringify(body) }),
  adminDeleteFragrance: (id: string, secret: string) =>
    adminRequest<any>(`/api/admin/fragrances/${id}`, secret, { method: 'DELETE' }),
  adminListOrders: (secret: string) => adminRequest<any[]>('/api/admin/orders', secret),
  adminListUsers: (secret: string) => adminRequest<any[]>('/api/admin/users', secret),
  adminListPartialListings: (secret: string) => adminRequest<any[]>('/api/admin/partial-listings', secret),
  adminUpdatePartialListing: (id: string, body: Record<string, unknown>, secret: string) =>
    adminRequest<any>(`/api/admin/partial-listings/${id}`, secret, { method: 'PATCH', body: JSON.stringify(body) }),
  adminListReports: (secret: string) => adminRequest<any[]>('/api/admin/reports', secret),
  adminUpdateReport: (id: string, body: Record<string, unknown>, secret: string) =>
    adminRequest<any>(`/api/admin/reports/${id}`, secret, { method: 'PATCH', body: JSON.stringify(body) }),
  adminBackfillEmbeddings: (secret: string) => adminRequest<any>('/api/admin/backfill-embeddings', secret, { method: 'POST' }),
};

function adminRequest<T>(path: string, secret: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, { ...init, headers: { 'x-admin-secret': secret, ...init.headers } });
}
