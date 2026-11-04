const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const PDF_SERVICE_URL = import.meta.env.VITE_PDF_SERVICE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = localStorage.getItem('norbe_token');
  const headers = body ? { 'Content-Type': 'application/json' } : {};
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload?.error?.details);
  }

  return payload?.data ?? payload;
}

const crud = (resource) => ({
  list: (query = '') => request(`/${resource}${query ? `?${query}` : ''}`),
  get: (id) => request(`/${resource}/${id}`),
  create: (data) => request(`/${resource}`, { method: 'POST', body: data }),
  update: (id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: data }),
  patch: (id, data) => request(`/${resource}/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
});

export const api = {
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: data }),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    me: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),
  },
  company: {
    get: () => request('/company'),
    update: (data) => request('/company', { method: 'PUT', body: data }),
  },
  clients: crud('clients'),
  projects: crud('projects'),
  proposals: crud('proposals'),
  contracts: crud('contracts'),
  events: {
    ...crud('events'),
    upcoming: (days = 30) => request(`/events/upcoming?days=${days}`),
  },
  dashboard: {
    summary: () => request('/dashboard/summary'),
    activity: () => request('/dashboard/activity'),
  },
  health: () => fetch(`${API_BASE.replace(/\/api$/, '')}/health`).then((r) => r.json()),
};

/**
 * Calls the Python auxiliary service to render a contract as PDF.
 * Returns a Blob ready to download.
 */
export async function generateContractPdf(contract) {
  const res = await fetch(`${PDF_SERVICE_URL}/api/contracts/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contract),
  });

  if (!res.ok) {
    throw new Error('PDF service unavailable. Start the Python service on port 8000.');
  }

  return res.blob();
}

export async function generateProposalPdf(proposal) {
  const res = await fetch(`${PDF_SERVICE_URL}/api/proposals/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });

  if (!res.ok) {
    throw new Error('PDF service unavailable. Start the Python service on port 8000.');
  }

  return res.blob();
}
