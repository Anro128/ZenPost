import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSettingsByCategory, useUpdateSettings } from '../hooks/useSettings';
import { Settings as SettingsIcon, Key } from 'lucide-react';

export default function Settings() {
  const { data: settingsList, isLoading } = useSettingsByCategory('api_keys');
  const updateMutation = useUpdateSettings();

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settingsList) {
      const defaultValues: Record<string, string> = {};
      settingsList.forEach((s: any) => {
        defaultValues[s.key] = s.value;
      });
      reset(defaultValues);
    }
  }, [settingsList, reset]);

  const onSubmit = (data: any) => {
    // Only send the keys that are defined in the form
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your API keys and global configurations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h3 className="text-lg font-medium flex items-center mb-4">
            <Key className="mr-2 h-5 w-5" />
            AI Provider API Keys
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your API keys for the AI providers you want to use. Keys are stored locally in your SQLite database.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <input 
                type="password"
                {...register('OPENAI_API_KEY')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="sk-..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Anthropic (Claude) API Key</label>
              <input 
                type="password"
                {...register('ANTHROPIC_API_KEY')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="sk-ant-..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gemini API Key</label>
              <input 
                type="password"
                {...register('GEMINI_API_KEY')} 
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
