import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsService.getDashboard,
    retry: 1,
  });
};

export const useDailyAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: analyticsService.getDaily,
    retry: 1,
  });
};

export const useProviderUsage = () => {
  return useQuery({
    queryKey: ['analytics', 'providers'],
    queryFn: analyticsService.getProviders,
    retry: 1,
  });
};
