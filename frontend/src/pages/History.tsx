import { useState } from 'react';
import { useHistoryList, useDeleteHistory } from '../hooks/useHistory';
import { FileClock, ExternalLink, Trash2, Search } from 'lucide-react';

export default function History() {
  const [search, setSearch] = useState('');
  const { data: historyData, isLoading } = useHistoryList();
  const deleteMutation = useDeleteHistory();

  const history = (historyData || []).filter((h: any) => 
    (h.content_text || '').toLowerCase().includes(search.toLowerCase()) || 
    (h.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this history record?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job History</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review past generated content and upload statuses.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileClock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No history found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your generated content will appear here once jobs are executed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Content</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item: any) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">#{item.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-700' :
                        item.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate" title={item.content_text}>{item.content_text || '-'}</p>
                      {item.media_url && (
                        <a href={item.media_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center mt-1 hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" /> View Media
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
