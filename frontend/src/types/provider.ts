export interface Provider {
  id: number;
  name: string;
  type: 'text' | 'image' | 'video';
  provider_key: string;
  api_key: string;
  base_url: string | null;
  default_model: string;
  is_active: boolean;
  created_at: string;
}
