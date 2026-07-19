import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useScheduler, useCreateScheduler, useUpdateScheduler } from '../../hooks/useSchedulers';
import { useTemplates } from '../../hooks/useTemplates';
import { Scheduler } from '../../types/scheduler';

export default function SchedulerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: scheduler, isLoading: isLoadingData } = useScheduler(Number(id));
  const { data: templates } = useTemplates();
  const createMutation = useCreateScheduler();
  const updateMutation = useUpdateScheduler();

  const { register, handleSubmit, reset } = useForm<Partial<Scheduler>>({
    defaultValues: {
      name: '',
      cron_expression: '0 8 * * *',
      topic: '',
      provider_id: 1,
      model: 'gpt-4o',
      output_type: 'image',
      destination: 'instagram',
      status: 'active',
      max_daily: 1,
    }
  });

  useEffect(() => {
    if (scheduler) {
      reset(scheduler);
    }
  }, [scheduler, reset]);

  const onSubmit = (data: Partial<Scheduler>) => {
    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data }, {
        onSuccess: () => navigate('/schedulers')
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/schedulers')
      });
    }
  };

  if (isEditing && isLoadingData) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? 'Edit Scheduler' : 'New Scheduler'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure automated content generation.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              {...register('name', { required: true })} 
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Daily Tech Quotes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cron Expression</label>
              <input 
                {...register('cron_expression', { required: true })} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                placeholder="0 8 * * *"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                {...register('status')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topic / Prompt Context</label>
            <textarea 
              {...register('topic', { required: true })} 
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Provide a motivational quote about technology and future..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">AI Provider ID</label>
              <input 
                type="number"
                {...register('provider_id', { valueAsNumber: true })} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input 
                {...register('model')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Output Type</label>
              <select 
                {...register('output_type')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visual Template</label>
              <select 
                {...register('template_id', { valueAsNumber: true })}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Default Minimal Template</option>
                {templates?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <input 
                {...register('destination')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="instagram, tiktok"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button 
            type="button" 
            onClick={() => navigate('/schedulers')}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50"
          >
            {isEditing ? 'Save Changes' : 'Create Scheduler'}
          </button>
        </div>
      </form>
    </div>
  );
}
