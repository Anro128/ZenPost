import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTemplate, useCreateTemplate, useUpdateTemplate } from '../../hooks/useTemplates';
import { Template } from '../../types/template';

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: template, isLoading } = useTemplate(Number(id));
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  const { register, handleSubmit, reset, watch } = useForm<Partial<Template>>({
    defaultValues: {
      name: '',
      layout: 'centered',
      font_family: 'Inter',
      font_size: 48,
      font_weight: 700,
      text_color: '#ffffff',
      bg_color: '#000000',
      padding_x: 40,
      padding_y: 40,
      line_height: 1.2,
      text_align: 'center',
      vertical_align: 'center',
      footer_font_size: 24,
      footer_color: '#aaaaaa',
      footer_text: '',
      border_radius: 0,
      is_default: false,
    }
  });

  useEffect(() => {
    if (template) reset(template);
  }, [template, reset]);

  const onSubmit = (data: Partial<Template>) => {
    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data }, { onSuccess: () => navigate('/templates') });
    } else {
      createMutation.mutate(data, { onSuccess: () => navigate('/templates') });
    }
  };

  const previewBgColor = watch('bg_color') || '#000000';
  const previewTextColor = watch('text_color') || '#ffffff';
  const previewFont = watch('font_family') || 'Inter';

  if (isEditing && isLoading) return <div className="p-8">Loading template...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? 'Edit Template' : 'New Template'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Design styling for content generation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <input {...register('name')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Layout</label>
                <select {...register('layout')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="centered">Centered</option>
                  <option value="top_aligned">Top Aligned</option>
                  <option value="split">Split</option>
                  <option value="large_quote">Large Quote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <input {...register('font_family')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" {...register('text_color')} className="h-9 w-9 rounded-md p-0.5 border border-input" />
                  <input type="text" {...register('text_color')} className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input type="color" {...register('bg_color')} className="h-9 w-9 rounded-md p-0.5 border border-input" />
                  <input type="text" {...register('bg_color')} className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <input type="number" {...register('font_size', { valueAsNumber: true })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Align</label>
                <select {...register('text_align')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vertical Align</label>
                <select {...register('vertical_align')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Line Height</label>
                <input type="number" step="0.1" {...register('line_height', { valueAsNumber: true })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" {...register('is_default')} id="is_default" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              <label htmlFor="is_default" className="text-sm font-medium">Set as default template</label>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="font-medium text-sm mb-4">Footer Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Footer Text</label>
                  <input {...register('footer_text')} placeholder="e.g. @mychannel" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Footer Color</label>
                  <div className="flex gap-2">
                    <input type="color" {...register('footer_color')} className="h-9 w-9 rounded-md p-0.5 border border-input" />
                    <input type="text" {...register('footer_color')} className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate('/templates')} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent h-9 px-4 py-2">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50">
              {isEditing ? 'Save Template' : 'Create Template'}
            </button>
          </div>
        </form>

        <div>
          <div className="sticky top-6 border border-border shadow-sm rounded-xl overflow-hidden bg-card">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-medium">Live Preview</h3>
            </div>
            <div className="aspect-square w-full flex flex-col items-center justify-center p-8 transition-colors duration-200 relative" style={{ backgroundColor: previewBgColor }}>
              <p style={{ color: previewTextColor, fontFamily: previewFont, textAlign: watch('text_align'), fontSize: watch('font_size') ? `${watch('font_size')}px` : '48px', lineHeight: watch('line_height') }}>
                "The only way to do great work is to love what you do."
              </p>
              {(watch('footer_text') || watch('footer_color')) && (
                <div className="absolute bottom-8 w-full text-center" style={{ color: watch('footer_color') || '#999999', fontSize: '18px', fontFamily: previewFont }}>
                  {watch('footer_text') || '@vibecoded'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
