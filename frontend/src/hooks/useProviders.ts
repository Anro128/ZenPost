import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface ProviderItem {
  id: number;
  name: string;
  provider_key: string;
  api_key_name: string;
  default_model: string;
  available_models: string[];
  base_url?: string;
  is_active: boolean;
  is_configured: boolean;
}

export function useProviders(configuredOnly = false) {
  return useQuery<ProviderItem[]>({
    queryKey: ['providers', { configuredOnly }],
    queryFn: async () => {
      const res = await api.get('/providers', {
        params: { configured_only: configuredOnly }
      });
      return res.data;
    }
  });
}
