import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    }
  });
}

export const useDashboardStats = useAnalyticsDashboard;

export function useDailyAnalytics(days: number = 7) {
  return useQuery({
    queryKey: ['analytics_daily', days],
    queryFn: async () => {
      const res = await api.get(`/analytics/daily?days=${days}`);
      return res.data;
    }
  });
}

export function useProviderUsage() {
  return useQuery({
    queryKey: ['analytics_providers'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data?.provider_breakdown || {};
    }
  });
}
