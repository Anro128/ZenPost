export interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  is_configured?: boolean;
  created_at: string;
  updated_at: string;
}
