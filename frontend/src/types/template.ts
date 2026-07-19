export interface Template {
  id: number;
  name: string;
  layout: 'centered' | 'top_aligned' | 'split' | 'large_quote';
  font_family: string;
  font_size: number;
  font_weight: number;
  text_color: string;
  bg_color: string;
  padding_x: number;
  padding_y: number;
  line_height: number;
  text_align: 'center' | 'left' | 'right';
  vertical_align: 'center' | 'top' | 'bottom';
  footer_font_size: number;
  footer_color: string;
  footer_text?: string;
  border_radius: number;
  shadow: string | null;
  watermark: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
