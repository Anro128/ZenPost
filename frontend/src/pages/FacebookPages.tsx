import React, { useState } from 'react';
import { useFacebookPages, useAddFacebookPage, useDeleteFacebookPage } from '../hooks/useFacebookPages';
import { Facebook, Plus, Trash2, CheckCircle2, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export default function FacebookPages() {
  const [tokenInput, setTokenInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: pages, isLoading } = useFacebookPages();
  const addMutation = useAddFacebookPage();
  const deleteMutation = useDeleteFacebookPage();

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setFeedback(null);
    addMutation.mutate(tokenInput.trim(), {
      onSuccess: (data) => {
        setFeedback({ type: 'success', message: data.message });
        setTokenInput('');
      },
      onError: (err: any) => {
        setFeedback({ 
          type: 'error', 
          message: err.response?.data?.detail || err.message || 'Failed to validate Facebook Page Token' 
        });
      }
    });
  };

  const handleDelete = (id: number, pageName: string) => {
    if (window.confirm(`Are you sure you want to disconnect '${pageName}'?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
          <Facebook className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facebook Pages Manager</h1>
          <p className="text-muted-foreground mt-1 text-sm">Connect & manage your Facebook Pages for automated AI content publishing.</p>
        </div>
      </div>

      {/* Token Input Card */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center">
            <Plus className="h-5 w-5 mr-2 text-primary" /> Connect New Facebook Page
          </h3>
          <a 
            href="https://developers.facebook.com/tools/explorer/" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center"
          >
            Graph API Explorer <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          Paste your Facebook <strong>Page Access Token</strong> below. The system will automatically validate the token via Facebook Graph API v21.0 and save the connected Page ID and Avatar.
        </p>

        {feedback && (
          <div className={`p-3.5 rounded-lg border text-sm flex items-center ${feedback.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleAddPage} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Page Access Token</label>
            <input 
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="EAAG..."
              required
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={addMutation.isPending || !tokenInput.trim()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 disabled:opacity-50"
          >
            {addMutation.isPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Validating Token...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Validate & Connect Page
              </>
            )}
          </button>
        </form>
      </div>

      {/* Connected Pages List */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-lg font-medium">Connected Facebook Pages</h3>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading connected pages...</div>
        ) : pages && pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map(page => (
              <div key={page.id} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {page.avatar_url ? (
                    <img src={page.avatar_url} alt={page.page_name} className="h-10 w-10 rounded-full object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                      {page.page_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-medium text-sm truncate">{page.page_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">ID: {page.page_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                    Active
                  </span>
                  <button
                    onClick={() => handleDelete(page.id, page.page_name)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 rounded-md hover:bg-muted transition-colors"
                    title="Disconnect Page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
            <Facebook className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="font-medium">No Facebook Pages connected yet</p>
            <p className="text-xs mt-1">Paste a Page Access Token above to connect your Facebook Page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
