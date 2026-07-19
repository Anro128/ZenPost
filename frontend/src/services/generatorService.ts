import api from './api';

export const generatorService = {
  generate: (data: Record<string, unknown>) => api.post('/generate', data).then(r => r.data),
  preview: (data: Record<string, unknown>) => api.post('/generate/preview', data).then(r => r.data),
  regenerate: (id: number) => api.post(`/regenerate/${id}`).then(r => r.data),
};
