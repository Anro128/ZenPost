import { motion } from 'framer-motion';
import { CalendarClock, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboardStats, useDailyAnalytics, useProviderUsage } from '../hooks/useAnalytics';

// Fallback Mock Data
const mockStats = {
  total_schedulers: 12,
  generated_today: 45,
  uploaded_today: 38,
  failed_today: 2,
  upcoming_jobs: [
    { scheduler_name: 'Tech News Daily', next_run: 'In 2 hours', topic: 'AI Updates' },
    { scheduler_name: 'Motivational Quotes', next_run: 'In 5 hours', topic: 'Success' }
  ],
  recent_activity: [
    { id: 1, type: 'success', message: 'Generated 5 tech posts', timestamp: '10 mins ago' },
    { id: 2, type: 'error', message: 'Failed to upload video', timestamp: '1 hour ago' }
  ]
};

const mockChartData = [
  { date: 'Mon', generated: 12, uploaded: 10, failed: 0 },
  { date: 'Tue', generated: 19, uploaded: 15, failed: 1 },
  { date: 'Wed', generated: 25, uploaded: 20, failed: 2 },
  { date: 'Thu', generated: 32, uploaded: 30, failed: 0 },
  { date: 'Fri', generated: 45, uploaded: 38, failed: 2 },
];

const mockProviderData = [
  { name: 'OpenAI', value: 400 },
  { name: 'Claude', value: 300 },
  { name: 'Gemini', value: 300 },
];
const COLORS = ['#000000', '#666666', '#cccccc'];

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

  const stats = { ...mockStats, ...(statsData || {}) };
  const areaData = chartData || mockChartData;
  const pieData = providerData ? providerData.map((p: any) => ({ name: p.name, value: p.count })) : mockProviderData;

  const statCards = [
    { title: 'Total Schedulers', value: stats.total_schedulers, icon: CalendarClock, color: 'text-gray-900' },
    { title: 'Generated Today', value: stats.generated_today, icon: Sparkles, color: 'text-gray-900' },
    { title: 'Uploaded', value: stats.uploaded_today, icon: Upload, color: 'text-gray-900' },
    { title: 'Failed', value: stats.failed_today, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Overview of your AI content generation platform.</p>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item} className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              {isLoadingStats ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <span className="text-3xl font-bold tracking-tighter">{stat.value}</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <h2 className="text-lg font-medium mb-6">Generation Trend (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            {isLoadingChart ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="generated" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorGenerated)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col"
        >
          <h2 className="text-lg font-medium mb-6">AI Usage</h2>
          <div className="flex-1 min-h-[250px]">
            {isLoadingProviders ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recent_activity.map((act) => (
              <div key={act.id} className="flex items-start space-x-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${act.type === 'error' ? 'bg-red-500' : 'bg-black'}`} />
                <div>
                  <p className="text-sm font-medium">{act.message}</p>
                  <p className="text-xs text-muted-foreground">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <h2 className="text-lg font-medium mb-4">Upcoming Jobs</h2>
          <div className="space-y-4">
            {stats.upcoming_jobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{job.scheduler_name}</p>
                  <p className="text-xs text-muted-foreground">{job.next_run}</p>
                </div>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-background">
                  {job.topic}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
