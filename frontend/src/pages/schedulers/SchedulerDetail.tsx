import { useParams, Link } from 'react-router-dom';
import { useScheduler, useSchedulerJobs } from '../../hooks/useSchedulers';

export default function SchedulerDetail() {
  const { id } = useParams();
  const schedulerId = Number(id);
  const { data: scheduler, isLoading: isSchedulerLoading } = useScheduler(schedulerId);
  const { data: jobs, isLoading: isJobsLoading } = useSchedulerJobs(schedulerId);

  if (isSchedulerLoading) {
    return <div className="p-8">Loading scheduler details...</div>;
  }

  if (!scheduler) {
    return <div className="p-8">Scheduler not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{scheduler.name}</h1>
          <p className="text-muted-foreground mt-1">Status: {scheduler.status}</p>
        </div>
        <Link to={`/schedulers/${schedulerId}/edit`} className="bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors hover:bg-primary/90">
          Edit Scheduler
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-lg font-medium">Configuration</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Cron Expression:</span>
            <span className="font-mono">{scheduler.cron_expression}</span>
            <span className="text-muted-foreground">Topic:</span>
            <span>{scheduler.topic}</span>
            <span className="text-muted-foreground">Provider ID:</span>
            <span>{scheduler.provider_id}</span>
            <span className="text-muted-foreground">Model:</span>
            <span>{scheduler.model}</span>
            <span className="text-muted-foreground">Output Type:</span>
            <span className="uppercase">{scheduler.output_type}</span>
            <span className="text-muted-foreground">Destination:</span>
            <span>{scheduler.destination}</span>
            <span className="text-muted-foreground">Max Daily:</span>
            <span>{scheduler.max_daily}</span>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-lg font-medium">Recent Jobs</h3>
          {isJobsLoading ? (
            <p className="text-muted-foreground text-sm">Loading jobs...</p>
          ) : (jobs && jobs.length > 0) ? (
            <div className="space-y-3">
              {jobs.map((job: any) => (
                <div key={job.id} className="flex flex-col text-sm border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium">Job #{job.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(job.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No jobs executed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
