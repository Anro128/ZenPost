export interface PlannerItem {
  id: number;
  topic: string;
  keyword: string;
  category: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  prompt: string | null;
  status: 'draft' | 'scheduled' | 'generated' | 'published';
  scheduler_id: number | null;
  created_at: string;
  updated_at: string;
}
