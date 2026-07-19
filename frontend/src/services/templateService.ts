import api from './api';
import { Template } from '../types/template';

export const templateService = {
  list: () => api.get<Template[]>('/templates').then(r => r.data),
  get: (id: number) => api.get<Template>(`/templates/${id}`).then(r => r.data),
  create: (data: Partial<Template>) => api.post<Template>('/templates', data).then(r => r.data),
  update: (id: number, data: Partial<Template>) => api.put<Template>(`/templates/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/templates/${id}`),
  preview: (id: number) => api.post(`/templates/${id}/preview`).then(r => r.data),
};
