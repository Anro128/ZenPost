export interface Job {
  id: number;
  scheduler_id: number | null;
  type: 'generate' | 'render_image' | 'render_video' | 'upload' | 'retry' | 'cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
}
