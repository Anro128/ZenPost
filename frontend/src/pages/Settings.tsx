import React, { useState } from 'react';
import { useSettingsByCategory } from '../hooks/useSettings';
import { Settings as SettingsIcon, Key, CheckCircle, Shield, Lock, Eye, EyeOff, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const { data: settingsList, isLoading } = useSettingsByCategory('api_keys');

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwIsLoading, setPwIsLoading] = useState(false);
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');
  const [pwErrorMsg, setPwErrorMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccessMsg('');
    setPwErrorMsg('');

    if (newPassword !== confirmPassword) {
      setPwErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setPwErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    setPwIsLoading(true);

    try {
      const res = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPwSuccessMsg(res.data.message || 'Master password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccessMsg(''), 5000);
    } catch (err: any) {
      setPwErrorMsg(err.response?.data?.detail || err.message || 'Failed to update password.');
    } finally {
      setPwIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  const isConfigured = (keyName: string) => {
    const found = settingsList?.find((s: any) => s.key === keyName);
    return found?.is_configured || found?.value ? true : false;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage master authentication password and view server environment configurations.</p>
        </div>
      </div>

      {/* 1. Master Password Reset Card */}
      <form onSubmit={handlePasswordChange} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium flex items-center">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Master Password Security
            </h3>
            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-mono">
              APP_PASSWORD
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Update your master dashboard password. The new password will be saved directly into your server's <code>.env</code> file.
          </p>

          {pwSuccessMsg && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg flex items-center text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              {pwSuccessMsg}
            </div>
          )}

          {pwErrorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {pwErrorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Current Master Password</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">New Password</label>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 4 characters"
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Confirm New Password</label>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
              </button>

              <button 
                type="submit" 
                disabled={pwIsLoading || !currentPassword || !newPassword}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50"
              >
                {pwIsLoading ? 'Updating .env...' : 'Update Master Password'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 2. Read-Only Server API Keys Security Status */}
      <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium flex items-center">
              <Key className="mr-2 h-5 w-5 text-primary" />
              AI Provider API Keys Status
            </h3>
            <span className="inline-flex items-center text-xs text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Locked in Server .env
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            For security reasons, AI API keys cannot be viewed or edited via Web/API interface. All API keys are loaded strictly from the server's <code>.env</code> file.
          </p>
          
          <div className="space-y-3">
            {[
              { label: 'Google Gemini API Key', key: 'GEMINI_API_KEY' },
              { label: 'OpenAI API Key', key: 'OPENAI_API_KEY' },
              { label: 'Anthropic (Claude) API Key', key: 'ANTHROPIC_API_KEY' },
              { label: 'DeepSeek API Key', key: 'DEEPSEEK_API_KEY' },
            ].map(item => {
              const active = isConfigured(item.key);
              return (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{item.key}</p>
                  </div>
                  {active ? (
                    <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-500/10 px-2.5 py-1 rounded-md">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Active in .env
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Not Configured
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
