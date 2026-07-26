import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Play, Edit, Trash2, Power, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSchedulers, useToggleScheduler, useDeleteScheduler, useTriggerScheduler } from '../../hooks/useSchedulers';

export default function SchedulerList() {
  const navigate = useNavigate();
  const { data: schedulersData, isLoading } = useSchedulers();
  const toggleMutation = useToggleScheduler();
  const deleteMutation = useDeleteScheduler();
  const triggerMutation = useTriggerScheduler();
  
  const [search, setSearch] = useState('');
  const [activeTriggerId, setActiveTriggerId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const schedulers = (schedulersData || []).filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.topic.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: number) => {
    toggleMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this scheduler?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTrigger = (id: number, name: string) => {
    setActiveTriggerId(id);
    setFeedback(null);
    triggerMutation.mutate(id, {
      onSuccess: () => {
        setActiveTriggerId(null);
        setFeedback({ 
          type: 'success', 
          message: `Successfully triggered '${name}'! Content generation job queued.` 
        });
        setTimeout(() => setFeedback(null), 5000);
      },
      onError: (err: any) => {
        setActiveTriggerId(null);
        setFeedback({ 
          type: 'error', 
          message: err.response?.data?.detail || err.message || 'Failed to trigger scheduler' 
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedulers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage automated content generation jobs.</p>
        </div>
        <button 
          onClick={() => navigate('/schedulers/new')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Scheduler
        </button>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl border text-sm flex items-center justify-between ${feedback.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
          <div className="flex items-center">
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schedulers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading schedulers...</div>
        ) : schedulers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarClock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No schedulers found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
              You don't have any active schedulers matching your search. Create a new one to automate your content.
            </p>
            <button 
              onClick={() => navigate('/schedulers/new')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Create Scheduler
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Topic & Output</th>
                  <th className="px-6 py-4 font-medium">Schedule</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedulers.map((scheduler) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    key={scheduler.id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex flex-col">
                        <span 
                          className="hover:underline cursor-pointer" 
                          onClick={() => navigate(`/schedulers/${scheduler.id}`)}
                        >
                          {scheduler.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">Dest: {scheduler.upload_destination || scheduler.destination || 'facebook'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        scheduler.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        scheduler.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {scheduler.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="truncate max-w-[150px]">{scheduler.topic}</span>
                        <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-secondary text-secondary-foreground">
                          {scheduler.output_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="font-mono text-foreground mb-1">{scheduler.cron_expression}</span>
                        <span>Next: {scheduler.next_run_at ? new Date(scheduler.next_run_at).toLocaleString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleTrigger(scheduler.id, scheduler.name)}
                          disabled={activeTriggerId === scheduler.id}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                          title="Trigger Now"
                        >
                          {activeTriggerId === scheduler.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleToggle(scheduler.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            scheduler.status === 'active' 
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={scheduler.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/schedulers/${scheduler.id}/edit`)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(scheduler.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
