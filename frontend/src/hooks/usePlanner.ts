import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerService } from '../services/plannerService';
import { PlannerItem } from '../types/planner';

export function usePlannerItems() {
  return useQuery({ queryKey: ['planner'], queryFn: plannerService.list, retry: false });
}

export function useCreatePlannerItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Partial<PlannerItem>) => plannerService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }) });
}

export function useUpdatePlannerItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<PlannerItem> }) => plannerService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }) });
}

export function useDeletePlannerItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => plannerService.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }) });
}
