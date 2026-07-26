import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useScheduler, useCreateScheduler, useUpdateScheduler } from '../../hooks/useSchedulers';
import { useTemplates } from '../../hooks/useTemplates';
import { useProviders } from '../../hooks/useProviders';
import { useFacebookPages } from '../../hooks/useFacebookPages';
import { Scheduler } from '../../types/scheduler';
import { AlertTriangle, Clock, Calendar, Repeat, Facebook, AtSign } from 'lucide-react';

export default function SchedulerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: scheduler, isLoading: isLoadingData } = useScheduler(Number(id));
  const { data: templates } = useTemplates();
  const { data: providers, isLoading: isLoadingProviders } = useProviders(true);
  const { data: fbPages } = useFacebookPages();

  const createMutation = useCreateScheduler();
  const updateMutation = useUpdateScheduler();

  const [selectedProviderKey, setSelectedProviderKey] = useState('');

  // Easy Schedule state
  const [scheduleMode, setScheduleMode] = useState<'daily' | 'interval' | 'weekly' | 'custom'>('daily');
  const [startTime, setStartTime] = useState('08:00');
  const [intervalHours, setIntervalHours] = useState(4);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [customCron, setCustomCron] = useState('0 8 * * *');

  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Scheduler>>({
    defaultValues: {
      name: '',
      cron_expression: '0 8 * * *',
      topic: '',
      provider_name: 'openai',
      model_name: 'gpt-4o-mini',
      output_type: 'image',
      destination: 'facebook',
      footer_username: '@vibecoded',
      status: 'active',
      max_daily: 1,
    }
  });

  const currentCron = watch('cron_expression');

  // Convert Schedule UI inputs to Cron Expression
  useEffect(() => {
    let cron = '0 8 * * *';
    const [hStr, mStr] = startTime.split(':');
    const h = parseInt(hStr, 10) || 8;
    const m = parseInt(mStr, 10) || 0;

    if (scheduleMode === 'daily') {
      cron = `${m} ${h} * * *`;
    } else if (scheduleMode === 'interval') {
      cron = `${m} */${intervalHours} * * *`;
    } else if (scheduleMode === 'weekly') {
      cron = `${m} ${h} * * ${dayOfWeek}`;
    } else if (scheduleMode === 'custom') {
      cron = customCron;
    }

    setValue('cron_expression', cron);
  }, [scheduleMode, startTime, intervalHours, dayOfWeek, customCron, setValue]);

  // Set default provider when list loads
  useEffect(() => {
    if (providers && providers.length > 0) {
      if (!selectedProviderKey || !providers.some(p => p.provider_key === selectedProviderKey)) {
        setSelectedProviderKey(providers[0].provider_key);
        setValue('provider_name', providers[0].provider_key);
        setValue('model_name', providers[0].default_model);
      }
    }
  }, [providers, selectedProviderKey, setValue]);

  const currentProvider = providers?.find(p => p.provider_key === selectedProviderKey);

  useEffect(() => {
    if (scheduler) {
      reset(scheduler);
      if (scheduler.provider_name) {
        setSelectedProviderKey(scheduler.provider_name);
      }
      if (scheduler.cron_expression) {
        setCustomCron(scheduler.cron_expression);
        const parts = scheduler.cron_expression.split(' ');
        if (parts.length === 5) {
          const m = parseInt(parts[0], 10) || 0;
          const h = parseInt(parts[1], 10);
          if (parts[1].startsWith('*/')) {
            setScheduleMode('interval');
            setIntervalHours(parseInt(parts[1].replace('*/', ''), 10) || 4);
          } else if (!isNaN(h) && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
            setScheduleMode('daily');
            setStartTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
          } else {
            setScheduleMode('custom');
          }
        }
      }
    }
  }, [scheduler, reset]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pKey = e.target.value;
    setSelectedProviderKey(pKey);
    setValue('provider_name', pKey);
    
    const provObj = providers?.find(p => p.provider_key === pKey);
    if (provObj) {
      setValue('model_name', provObj.default_model);
    }
  };

  const onSubmit = (data: Partial<Scheduler>) => {
    data.destination = 'facebook';
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

  const hasConfiguredProviders = providers && providers.length > 0;

  const getScheduleSummary = () => {
    if (scheduleMode === 'daily') return `Berjalan setiap hari pada jam ${startTime}`;
    if (scheduleMode === 'interval') return `Berjalan setiap ${intervalHours} jam sekali (mulai menit ke-${startTime.split(':')[1] || '00'})`;
    if (scheduleMode === 'weekly') {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return `Berjalan setiap hari ${days[dayOfWeek % 7]} pada jam ${startTime}`;
    }
    return `Custom Cron: ${currentCron}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? 'Edit Scheduler' : 'New Scheduler'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure automated Facebook Page content generation & publishing.</p>
      </div>

      {!isLoadingProviders && !hasConfiguredProviders && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-amber-600">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              No AI provider API Keys configured in .env. Please add your API key in Settings first.
            </span>
          </div>
          <Link 
            to="/settings" 
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              {...register('name', { required: true })} 
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Daily Tech Quotes Page Post"
            />
          </div>

          {/* User-friendly Schedule Builder */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" /> Schedule Config
              </label>
              <span className="text-xs font-mono bg-background border px-2 py-0.5 rounded text-muted-foreground">
                Cron: {currentCron}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode('daily')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center transition-all ${scheduleMode === 'daily' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
              >
                <Calendar className="h-3.5 w-3.5 mr-1" /> Daily
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode('interval')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center transition-all ${scheduleMode === 'interval' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
              >
                <Repeat className="h-3.5 w-3.5 mr-1" /> Every X Hours
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode('weekly')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center transition-all ${scheduleMode === 'weekly' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
              >
                Weekly
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode('custom')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center transition-all ${scheduleMode === 'custom' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
              >
                Custom Cron
              </button>
            </div>

            {scheduleMode === 'daily' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Start Time (Jam Berapa)</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select 
                    {...register('status')} 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            )}

            {scheduleMode === 'interval' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Setiap Berapa Jam sekali</label>
                  <select
                    value={intervalHours}
                    onChange={e => setIntervalHours(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                  >
                    <option value={1}>Setiap 1 Jam</option>
                    <option value={2}>Setiap 2 Jam</option>
                    <option value={3}>Setiap 3 Jam</option>
                    <option value={4}>Setiap 4 Jam</option>
                    <option value={6}>Setiap 6 Jam</option>
                    <option value={12}>Setiap 12 Jam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Start Time (Jam / Menit)</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {scheduleMode === 'weekly' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Hari</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                  >
                    <option value={1}>Senin</option>
                    <option value={2}>Selasa</option>
                    <option value={3}>Rabu</option>
                    <option value={4}>Kamis</option>
                    <option value={5}>Jumat</option>
                    <option value={6}>Sabtu</option>
                    <option value={0}>Minggu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Jam Berapa</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {scheduleMode === 'custom' && (
              <div className="pt-2">
                <label className="block text-xs font-medium mb-1">Raw Cron Expression</label>
                <input 
                  type="text" 
                  value={customCron}
                  onChange={e => setCustomCron(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-mono shadow-sm focus:outline-none"
                  placeholder="0 8 * * *"
                />
              </div>
            )}

            <div className="text-xs text-primary font-medium bg-primary/10 p-2.5 rounded-lg flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{getScheduleSummary()}</span>
            </div>
          </div>

          {/* Facebook Page Selector & Footer Username */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <Facebook className="h-4 w-4 mr-1.5 text-blue-600" /> Target Facebook Page
              </label>
              {fbPages && fbPages.length > 0 ? (
                <select 
                  {...register('facebook_page_id', { valueAsNumber: true })}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {fbPages.map(p => (
                    <option key={p.id} value={p.id}>{p.page_name} (ID: {p.page_id})</option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md flex items-center justify-between">
                  <span>No FB Pages.</span>
                  <Link to="/facebook-pages" className="text-blue-600 font-medium hover:underline ml-1">Connect</Link>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <AtSign className="h-4 w-4 mr-1.5 text-primary" /> Footer Username / Watermark
              </label>
              <input 
                {...register('footer_username')}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. @nama_page"
              />
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
              <label className="block text-sm font-medium mb-1">AI Provider (Active Keys)</label>
              <select 
                value={selectedProviderKey}
                onChange={handleProviderChange}
                disabled={!hasConfiguredProviders}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                {hasConfiguredProviders ? (
                  providers.map(p => (
                    <option key={p.id} value={p.provider_key}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Active Provider</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model (DB)</label>
              <select 
                {...register('model_name')}
                disabled={!hasConfiguredProviders}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs disabled:opacity-50"
              >
                {currentProvider?.available_models.map(m => (
                  <option key={m} value={m}>{m}</option>
                )) || <option value="">None</option>}
              </select>
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
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Default Minimal Template</option>
                {templates?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
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
            disabled={createMutation.isPending || updateMutation.isPending || !hasConfiguredProviders}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50"
          >
            {isEditing ? 'Save Changes' : 'Create Scheduler'}
          </button>
        </div>
      </form>
    </div>
  );
}
