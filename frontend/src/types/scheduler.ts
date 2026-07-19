export interface Scheduler {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'draft';
  cron_expression: string;
  timezone: string;
  topic: string;
  language: string;
  tone: string;
  audience: string;
  provider_id: number;
  model: string;
  output_type: 'image' | 'video';
  template_id: number | null;
  destination: string;
  footer_username: string | null;
  prompt_override: string | null;
  negative_prompt: string | null;
  max_retries: number;
  max_daily: number;
  random_seed: number | null;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}
