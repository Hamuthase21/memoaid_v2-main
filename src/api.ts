const API_BASE = 'http://192.168.1.4:5000/api';  // Local development server

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Auto-logout on auth error
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
      return;
    }
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
  journey: {
    saveLocation: (latitude: number, longitude: number, accuracy?: number) =>
      apiRequest('/journey', { method: 'POST', body: JSON.stringify({ latitude, longitude, accuracy }) }),
    getTodayJourney: () => apiRequest('/journey/today'),
    getJourneyByDate: (date: string) => apiRequest(`/journey/date/${date}`),
    getAllJourney: (page: number = 1, limit: number = 50) =>
      apiRequest(`/journey?page=${page}&limit=${limit}`),
  },
  timeline: {
    createEvent: (eventType: string, eventData: any, startTime?: number, endTime?: number, tags?: string[], isImportant?: boolean) =>
      apiRequest('/timeline/event', {
        method: 'POST',
        body: JSON.stringify({ eventType, eventData, startTime, endTime, tags, isImportant }),
      }),
    getDay: (date: string) => apiRequest(`/timeline/day?date=${date}`),
    getRange: (startDate: string, endDate: string) => apiRequest(`/timeline/range?startDate=${startDate}&endDate=${endDate}`),
    getSummary: (date: string) => apiRequest(`/timeline/summary?date=${date}`),
  },
  emergency: {
    contacts: {
      getAll: () => apiRequest('/emergency/contacts'),
      create: (data: any) => apiRequest('/emergency/contacts', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => apiRequest(`/emergency/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => apiRequest(`/emergency/contacts/${id}`, { method: 'DELETE' }),
    },
    medicalInfo: {
      get: () => apiRequest('/emergency/medical-info'),
      update: (data: any) => apiRequest('/emergency/medical-info', { method: 'PUT', body: JSON.stringify(data) }),
    },
  },
  medications: {
    getAll: () => apiRequest('/medications'),
    create: (data: any) => apiRequest('/medications', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/medications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/medications/${id}`, { method: 'DELETE' }),
    markTaken: (id: string, notes?: string) => apiRequest(`/medications/${id}/taken`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    }),
  },
  routineStats: {
    get: () => apiRequest('/routines/stats'),
    completeTask: (routineId: string, taskIndex: number, completed: boolean) =>
      apiRequest(`/routines/${routineId}/tasks/${taskIndex}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ completed })
      }),
  },
};
