import api from './api';
import { PlannerItem } from '../types/planner';

export const plannerService = {
  list: () => api.get<PlannerItem[]>('/planner').then(r => r.data),
  get: (id: number) => api.get<PlannerItem>(`/planner/${id}`).then(r => r.data),
  create: (data: Partial<PlannerItem>) => api.post<PlannerItem>('/planner', data).then(r => r.data),
  update: (id: number, data: Partial<PlannerItem>) => api.put<PlannerItem>(`/planner/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/planner/${id}`),
  importExternal: (url: string) => api.post('/planner/import', { url }).then(r => r.data),
  export: () => api.get('/planner/export').then(r => r.data),
};
