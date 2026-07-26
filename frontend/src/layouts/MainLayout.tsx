import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../components/theme-provider';
import { 
  LayoutDashboard, 
  CalendarClock, 
  LayoutTemplate, 
  KanbanSquare, 
  History, 
  Sparkles, 
  PenTool, 
  Settings,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import api from '../services/api';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Schedulers', path: '/schedulers', icon: CalendarClock },
  { name: 'Facebook Pages', path: '/facebook-pages', icon: Facebook },
  { name: 'Templates', path: '/templates', icon: LayoutTemplate },
  { name: 'Planner', path: '/planner', icon: KanbanSquare },
  { name: 'History', path: '/history', icon: History },
  { name: 'Generator', path: '/generator', icon: Sparkles },
  { name: 'Prompt Builder', path: '/prompt-builder', icon: PenTool },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API logout error
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="border-r border-border flex flex-col justify-between"
      >
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <span className="font-bold text-lg whitespace-nowrap">AI Generator</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                  isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className="min-w-[20px]" />
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-xs font-medium rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="min-w-[18px]" />
            {!collapsed && <span className="ml-3 font-semibold">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center bg-secondary/50 px-3 py-1.5 rounded-md text-xs cursor-pointer hover:bg-secondary">
              Search... <kbd className="ml-2 bg-background border px-1 rounded">⌘K</kbd>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
