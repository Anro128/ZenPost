import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface FacebookPageItem {
  id: number;
  page_id: string;
  page_name: string;
  token_valid: boolean;
  avatar_url?: string;
  masked_token: string;
  created_at: string;
}

export function useFacebookPages() {
  return useQuery<FacebookPageItem[]>({
    queryKey: ['facebook_pages'],
    queryFn: async () => {
      const res = await api.get('/facebook/pages');
      return res.data;
    }
  });
}

export function useAddFacebookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post('/facebook/pages', { page_access_token: token });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook_pages'] });
    }
  });
}

export function useDeleteFacebookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/facebook/pages/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook_pages'] });
    }
  });
}
