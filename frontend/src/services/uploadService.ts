import api from './api';

export const uploadService = {
  list: () => api.get('/uploads').then(r => r.data),
  upload: (contentId: number) => api.post(`/uploads/${contentId}`).then(r => r.data),
  retry: (id: number) => api.post(`/uploads/${id}/retry`).then(r => r.data),
  listAccounts: () => api.get('/upload-accounts').then(r => r.data),
  createAccount: (data: Record<string, unknown>) => api.post('/upload-accounts', data).then(r => r.data),
  updateAccount: (id: number, data: Record<string, unknown>) => api.put(`/upload-accounts/${id}`, data).then(r => r.data),
  deleteAccount: (id: number) => api.delete(`/upload-accounts/${id}`),
};
