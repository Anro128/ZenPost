import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '../services/templateService';
import { Template } from '../types/template';

export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: templateService.list, retry: false });
}

export function useTemplate(id: number) {
  return useQuery({ queryKey: ['templates', id], queryFn: () => templateService.get(id), enabled: !!id, retry: false });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Partial<Template>) => templateService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }) });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Template> }) => templateService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }) });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => templateService.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }) });
}
