import api from './api';
import { Setting } from '../types/settings';

export const settingsService = {
  getAll: () => api.get<Setting[]>('/settings').then(r => r.data),
  getByCategory: (category: string) => api.get<Setting[]>(`/settings/${category}`).then(r => r.data),
  update: (data: Record<string, string>) => api.put('/settings', data).then(r => r.data),
  updateKey: (key: string, value: string) => api.put(`/settings/${key}`, { value }).then(r => r.data),
};
