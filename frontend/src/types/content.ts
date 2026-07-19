export interface GeneratedContent {
  id: number;
  scheduler_id: number;
  prompt_used: string;
  output_text: string;
  caption: string;
  hashtags: string[];
  keywords: string[];
  title: string;
  image_path: string | null;
  video_path: string | null;
  provider_used: string;
  model_used: string;
  cost: number;
  duration_ms: number;
  status: 'pending' | 'generating' | 'rendered' | 'uploaded' | 'failed';
  template_id: number | null;
  created_at: string;
  updated_at: string;
}
