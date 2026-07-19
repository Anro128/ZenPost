import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services/historyService';

export function useHistoryList(params?: Record<string, string>) {
  return useQuery({ queryKey: ['history', params], queryFn: () => historyService.list(params), retry: false });
}

export function useHistoryDetail(id: number) {
  return useQuery({ queryKey: ['history', id], queryFn: () => historyService.get(id), enabled: !!id, retry: false });
}

export function useDeleteHistory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => historyService.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }) });
}

export function useBulkDeleteHistory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (ids: number[]) => historyService.bulkDelete(ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }) });
}
