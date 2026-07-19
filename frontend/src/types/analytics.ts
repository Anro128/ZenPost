export interface DashboardStats {
  total_schedulers: number;
  generated_today: number;
  uploaded_today: number;
  failed_today: number;
  upcoming_jobs: UpcomingJob[];
  recent_activity: RecentActivity[];
}

export interface UpcomingJob {
  scheduler_name: string;
  next_run: string;
  topic: string;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export interface DailyChartData {
  date: string;
  generated: number;
  uploaded: number;
  failed: number;
}

export interface ProviderUsage {
  name: string;
  count: number;
  cost: number;
}
