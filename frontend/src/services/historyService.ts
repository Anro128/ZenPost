import api from './api';
import { GeneratedContent } from '../types/content';

export const historyService = {
  list: (params?: Record<string, string>) => api.get<GeneratedContent[]>('/history', { params }).then(r => r.data),
  get: (id: number) => api.get<GeneratedContent>(`/history/${id}`).then(r => r.data),
  delete: (id: number) => api.delete(`/history/${id}`),
  bulkDelete: (ids: number[]) => api.post('/history/bulk-delete', { ids }),
};
