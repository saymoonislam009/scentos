async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers as Record<string,string> ?? {}) } });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? `API error ${res.status}`); }
  return res.json();
}
export const api = {
  getAdvice: (body: object) => apiFetch('/api/advisor', { method: 'POST', body: JSON.stringify(body) }),
  sendScentGptMessage: (body: object) => apiFetch('/api/scentgpt', { method: 'POST', body: JSON.stringify(body) }),
  suggestLayering: (fragranceIds: string[]) => apiFetch('/api/layering', { method: 'POST', body: JSON.stringify({ fragranceIds }) }),
  getAlerts: () => apiFetch('/api/alerts'),
  createAlert: (fragranceId: string, targetPrice: number) => apiFetch('/api/alerts', { method: 'POST', body: JSON.stringify({ fragranceId, targetPrice }) }),
  deleteAlert: (id: string) => apiFetch(`/api/alerts?id=${id}`, { method: 'DELETE' }),
};
