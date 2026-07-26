import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarClock, Sparkles, Upload, Facebook, Play, Plus, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboardStats, useDailyAnalytics, useProviderUsage } from '../hooks/useAnalytics';
import { useTriggerScheduler } from '../hooks/useSchedulers';

const mockChartData = [
  { date: 'Mon', generated: 4, uploaded: 4 },
  { date: 'Tue', generated: 8, uploaded: 7 },
  { date: 'Wed', generated: 12, uploaded: 10 },
  { date: 'Thu', generated: 16, uploaded: 15 },
  { date: 'Fri', generated: 20, uploaded: 18 },
  { date: 'Sat', generated: 24, uploaded: 22 },
  { date: 'Sun', generated: 28, uploaded: 25 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
  const { data: chartData, isLoading: isLoadingChart } = useDailyAnalytics();
  const { data: providerData, isLoading: isLoadingProviders } = useProviderUsage();
  
  const triggerMutation = useTriggerScheduler();
  const [triggeringId, setTriggeringId] = useState<number | null>(null);

  const handleTrigger = (id: number) => {
    setTriggeringId(id);
    triggerMutation.mutate(id, {
      onSettled: () => setTriggeringId(null)
    });
  };

  const stats = statsData || {
    total_schedulers: 0,
    total_generated: 0,
    total_uploaded: 0,
    facebook_pages_count: 0,
    upcoming_jobs: [],
    recent_activity: []
  };

  const areaData = (chartData && chartData.length > 0) ? chartData : mockChartData;
  const pieData = (providerData && providerData.length > 0) 
    ? providerData.map((p: any) => ({ name: p.name || 'AI Provider', value: p.count || 1 }))
    : [{ name: 'Gemini', value: 1 }];

  const statCards = [
    { title: 'Active Schedulers', value: stats.total_schedulers, icon: CalendarClock, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Total Generated', value: stats.total_generated, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { title: 'FB Page Uploads', value: stats.total_uploaded, icon: Upload, color: 'text-green-600', bg: 'bg-green-500/10' },
    { title: 'Connected Pages', value: stats.facebook_pages_count, icon: Facebook, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time status of automated Facebook content generation & publishing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/generator"
            className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3.5"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Manual Generator
          </Link>
          <Link
            to="/schedulers/new"
            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background shadow-sm hover:bg-accent h-9 px-3.5"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Scheduler
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item} className="p-5 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
              <div>
                {isLoadingStats ? (
                  <div className="h-7 w-12 bg-muted animate-pulse rounded"></div>
                ) : (
                  <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid: Generation Trend Chart & AI Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Generation & Upload Trend</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">7 Days</span>
          </div>

          <div className="h-[260px] w-full">
            {isLoadingChart ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="generated" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGenerated)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between"
        >
          <h2 className="text-base font-semibold">AI Provider Distribution</h2>
          <div className="flex-1 min-h-[220px]">
            {isLoadingProviders ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Grid: Upcoming Jobs & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Schedulers (Upcoming Jobs) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center">
              <CalendarClock className="h-4 w-4 mr-2 text-primary" /> Active Automation Jobs
            </h2>
            <Link to="/schedulers" className="text-xs font-medium text-blue-600 hover:underline flex items-center">
              View All <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.upcoming_jobs && stats.upcoming_jobs.length > 0 ? (
              stats.upcoming_jobs.map((job: any) => (
                <div key={job.id} className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">{job.scheduler_name}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[240px]">{job.topic}</p>
                    <p className="text-[11px] text-blue-600 font-mono">Next: {job.next_run}</p>
                  </div>

                  <button
                    onClick={() => handleTrigger(job.id)}
                    disabled={triggeringId === job.id}
                    className="py-1.5 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
                  >
                    {triggeringId === job.id ? (
                      <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" /> Run Now
                      </>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active schedulers configured yet. <Link to="/schedulers/new" className="text-blue-600 underline">Create one now</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Content Generation Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-600" /> Recent Content Feed
            </h2>
            <Link to="/history" className="text-xs font-medium text-blue-600 hover:underline flex items-center">
              History <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((act: any) => (
                <div key={act.id} className="p-3 rounded-lg border border-border/60 bg-background flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {act.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{act.title}</p>
                      <p className="text-[10px] text-muted-foreground">Time: {act.timestamp}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] rounded font-mono capitalize ${
                    act.status === 'uploaded' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                    act.status === 'rendered' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                    act.status === 'failed' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                    'bg-purple-500/10 text-purple-600'
                  }`}>
                    {act.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No recent content generated yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
