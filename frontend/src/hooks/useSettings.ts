import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: settingsService.getAll, retry: false });
}

export function useSettingsByCategory(category: string) {
  return useQuery({ queryKey: ['settings', category], queryFn: () => settingsService.getByCategory(category), retry: false });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, string>) => settingsService.update(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) });
}
