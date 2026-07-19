import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import SchedulerList from './pages/schedulers/SchedulerList';
import SchedulerForm from './pages/schedulers/SchedulerForm';
import SchedulerDetail from './pages/schedulers/SchedulerDetail';
import Templates from './pages/Templates';
import TemplateEditor from './pages/templates/TemplateEditor';
import Planner from './pages/Planner';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Generator from './pages/Generator';
import PromptBuilder from './pages/PromptBuilder';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="schedulers" element={<SchedulerList />} />
              <Route path="schedulers/new" element={<SchedulerForm />} />
              <Route path="schedulers/:id" element={<SchedulerDetail />} />
              <Route path="schedulers/:id/edit" element={<SchedulerForm />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/new" element={<TemplateEditor />} />
              <Route path="templates/:id/edit" element={<TemplateEditor />} />
              <Route path="planner" element={<Planner />} />
              <Route path="history" element={<History />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="generator" element={<Generator />} />
              <Route path="prompt-builder" element={<PromptBuilder />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
