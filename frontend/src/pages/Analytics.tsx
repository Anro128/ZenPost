import { useAnalyticsDashboard } from '../hooks/useAnalytics';
import { BarChart3, Sparkles, Facebook, CalendarClock, CheckCircle2, Cpu, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { data: stats, isLoading } = useAnalyticsDashboard();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics dashboard...</div>;
  }

  const totalGen = stats?.total_generated || 0;
  const totalUp = stats?.total_uploaded || 0;
  const totalSched = stats?.total_schedulers || 0;
  const totalFbPages = stats?.facebook_pages_count || 0;

  const statusBreakdown = stats?.status_breakdown || {};
  const rawProviderBreakdown = stats?.provider_breakdown || {};

  // Safely normalize provider breakdown to array of { name: string, count: number }
  const providerList: { name: string; count: number }[] = [];
  if (Array.isArray(rawProviderBreakdown)) {
    rawProviderBreakdown.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        providerList.push({
          name: String(item.name || item.provider || 'gemini'),
          count: Number(item.count || item.value || 0)
        });
      }
    });
  } else if (typeof rawProviderBreakdown === 'object' && rawProviderBreakdown !== null) {
    Object.entries(rawProviderBreakdown).forEach(([key, val]) => {
      providerList.push({
        name: key,
        count: typeof val === 'number' ? val : (val as any)?.count || 0
      });
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time statistics & performance metrics of your AI content pipeline.</p>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Generated</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalGen}</p>
          <p className="text-xs text-muted-foreground">AI generated contents in DB</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Facebook Uploads</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Facebook className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalUp}</p>
          <p className="text-xs text-muted-foreground">Published to FB Pages</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Schedulers</span>
            <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalSched}</p>
          <p className="text-xs text-muted-foreground">Automated jobs active</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">FB Pages Connected</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalFbPages}</p>
          <p className="text-xs text-muted-foreground">Target publishing pages</p>
        </div>
      </div>

      {/* Grid: Status Distribution & AI Provider Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-medium flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Pipeline Status Distribution
          </h3>

          <div className="space-y-3">
            {Object.keys(statusBreakdown).length > 0 ? (
              Object.entries(statusBreakdown).map(([statusKey, count]: [string, any]) => {
                const countNum = Number(count) || 0;
                const percentage = totalGen > 0 ? Math.round((countNum / totalGen) * 100) : 0;
                return (
                  <div key={statusKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize">{statusKey}</span>
                      <span className="text-muted-foreground">{countNum} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          statusKey === 'uploaded' ? 'bg-green-600' :
                          statusKey === 'rendered' ? 'bg-blue-600' :
                          statusKey === 'failed' ? 'bg-red-600' : 'bg-purple-600'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No content data recorded yet.</p>
            )}
          </div>
        </div>

        {/* AI Provider Distribution */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-medium flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-primary" /> AI Provider Usage Breakdown
          </h3>

          <div className="space-y-3">
            {providerList.length > 0 ? (
              providerList.map((item) => {
                const percentage = totalGen > 0 ? Math.round((item.count / totalGen) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="uppercase font-mono">{item.name}</span>
                      <span className="text-muted-foreground">{item.count} calls ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No provider usage recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
