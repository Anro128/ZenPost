import { usePlannerItems, useDeletePlannerItem } from '../hooks/usePlanner';
import { CalendarDays, Trash2, Clock } from 'lucide-react';

export default function Planner() {
  const { data: items, isLoading } = usePlannerItems();
  const deleteMutation = useDeletePlannerItem();

  const handleDelete = (id: number) => {
    if (window.confirm('Remove this item from the planner?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Planner</h1>
        <p className="text-muted-foreground mt-1 text-sm">Upcoming scheduled content generation.</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading planner...</div>
        ) : !items || items.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Planner is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Schedulers automatically populate the planner with upcoming jobs.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Planned execution</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Scheduler ID: {item.scheduler_id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-sm font-medium">{new Date(item.scheduled_time).toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">
                      Status: <span className="capitalize">{item.status}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
