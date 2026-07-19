import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from '../services/schedulerService';
import { Scheduler } from '../types/scheduler';

export const useSchedulers = () => {
  return useQuery({
    queryKey: ['schedulers'],
    queryFn: schedulerService.list,
  });
};

export const useScheduler = (id: number) => {
  return useQuery({
    queryKey: ['schedulers', id],
    queryFn: () => schedulerService.get(id),
    enabled: !!id,
  });
};

export const useCreateScheduler = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Scheduler>) => schedulerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
    },
  });
};

export const useUpdateScheduler = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Scheduler> }) => schedulerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
      queryClient.invalidateQueries({ queryKey: ['schedulers', variables.id] });
    },
  });
};

export const useDeleteScheduler = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
    },
  });
};

export const useToggleScheduler = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulerService.toggle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
      queryClient.invalidateQueries({ queryKey: ['schedulers', id] });
    },
  });
};

export const useTriggerScheduler = () => {
  return useMutation({
    mutationFn: (id: number) => schedulerService.trigger(id),
  });
};

export const useSchedulerJobs = (id: number) => {
  return useQuery({
    queryKey: ['schedulers', id, 'jobs'],
    queryFn: () => schedulerService.getJobs(id),
    enabled: !!id,
  });
};
