import { api } from './api';

export const authService = {
  login: (body) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (body) => api.patch('/auth/password', body),
};

export const auditService = {
  list: (params, signal) => api.get('/audit-logs', params, signal),
};

export const doctorService = {
  list: (params, signal) => api.get('/doctors', params, signal),
  meta: () => api.get('/doctors/meta'),
  options: () => api.get('/doctors/options'),
  get: (id) => api.get(`/doctors/${id}`),
  create: (body) => api.post('/doctors', body),
  update: (id, body) => api.patch(`/doctors/${id}`, body),
  remove: (id) => api.delete(`/doctors/${id}`),
  patients: (id, params, signal) => api.get(`/doctors/${id}/patients`, params, signal),
  addPatient: (id, body) => api.post(`/doctors/${id}/patients`, body),
  removePatient: (id, patientId) => api.delete(`/doctors/${id}/patients/${patientId}`),
};

export const patientService = {
  list: (params, signal) => api.get('/patients', params, signal),
  get: (id) => api.get(`/patients/${id}`),
  create: (body) => api.post('/patients', body),
  update: (id, body) => api.patch(`/patients/${id}`, body),
  remove: (id) => api.delete(`/patients/${id}`),
};

export const statsService = {
  overview: (range) => api.get('/stats/overview', { range }),
};
