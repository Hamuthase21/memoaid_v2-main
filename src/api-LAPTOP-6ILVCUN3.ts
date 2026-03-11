const API_BASE = 'http://localhost:5000/api';

const getAuthToken = async () => {
  // No authentication needed for now
  return null;
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  notes: {
    getAll: () => apiRequest('/notes'),
    create: (data: any) => apiRequest('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/notes/${id}`, { method: 'DELETE' }),
  },
  reminders: {
    getAll: () => apiRequest('/reminders'),
    create: (data: any) => apiRequest('/reminders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/reminders/${id}`, { method: 'DELETE' }),
  },
  people: {
    getAll: () => apiRequest('/people'),
    create: (data: any) => apiRequest('/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/people/${id}`, { method: 'DELETE' }),
  },
  routines: {
    getAll: () => apiRequest('/routines'),
    create: (data: any) => apiRequest('/routines', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/routines/${id}`, { method: 'DELETE' }),
  },
};