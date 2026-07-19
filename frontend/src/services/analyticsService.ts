import api from './api';
import { DashboardStats, DailyChartData, ProviderUsage } from '../types/analytics';

export const analyticsService = {
  getDashboard: () => api.get<DashboardStats>('/analytics/dashboard').then(r => r.data),
  getDaily: () => api.get<DailyChartData[]>('/analytics/daily').then(r => r.data),
  getMonthly: () => api.get<DailyChartData[]>('/analytics/monthly').then(r => r.data),
  getProviders: () => api.get<ProviderUsage[]>('/analytics/providers').then(r => r.data),
};
