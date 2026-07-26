import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { password });
      if (res.data && res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Login failed. Please check your password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1 shadow-inner">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Content Generator</h1>
          <p className="text-sm text-muted-foreground">Enter master password to access your dashboard.</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium text-center animate-in fade-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium text-foreground flex items-center justify-between">
              <span>Master Password</span>
              <span className="text-[10px] text-muted-foreground">Set in .env file</span>
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                autoFocus
                className="w-full pl-9 pr-10 h-10 rounded-lg border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
