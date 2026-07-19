import api from './api';
import { Scheduler } from '../types/scheduler';

export const schedulerService = {
  list: () => api.get<Scheduler[]>('/schedulers').then(r => r.data),
  get: (id: number) => api.get<Scheduler>(`/schedulers/${id}`).then(r => r.data),
  create: (data: Partial<Scheduler>) => api.post<Scheduler>('/schedulers', data).then(r => r.data),
  update: (id: number, data: Partial<Scheduler>) => api.put<Scheduler>(`/schedulers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/schedulers/${id}`),
  toggle: (id: number) => api.post<Scheduler>(`/schedulers/${id}/toggle`).then(r => r.data),
  trigger: (id: number) => api.post(`/schedulers/${id}/trigger`),
  getJobs: (id: number) => api.get(`/schedulers/${id}/jobs`).then(r => r.data),
};
