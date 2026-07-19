import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Video, Send } from 'lucide-react';
import api from '../services/api';
import { useTemplates } from '../hooks/useTemplates';

export default function Generator() {
  const [topic, setTopic] = useState('');
  const [outputType, setOutputType] = useState('image');
  const [templateId, setTemplateId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: templates } = useTemplates();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    setIsGenerating(true);
    setResult(null);
    try {
      // POST to backend API
      const res = await api.post('/generate', { 
        topic, 
        output_type: outputType,
        template_id: templateId ? Number(templateId) : undefined
      });
      setResult({ type: 'success', data: res.data });
    } catch (err: any) {
      setResult({ type: 'error', message: err.response?.data?.detail || err.message || 'Generation failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manual Generator</h1>
        <p className="text-muted-foreground mt-1 text-sm">Test the AI pipeline manually without waiting for a schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Prompt / Topic</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full min-h-[120px] p-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="A motivational quote about persistence in coding..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Output Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setOutputType('image')}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${outputType === 'image' ? 'border-primary bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:bg-muted/30'}`}
                >
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="font-medium">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutputType('video')}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${outputType === 'video' ? 'border-primary bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:bg-muted/30'}`}
                >
                  <Video className="h-8 w-8 mb-2" />
                  <span className="font-medium">Video</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visual Template</label>
              <select 
                value={templateId}
                onChange={e => setTemplateId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Default Minimal Template</option>
                {templates?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic}
              className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Content
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="font-medium">Output Result</h3>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[300px]">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-muted h-12 w-12 mx-auto"></div>
                </div>
                <p className="text-muted-foreground animate-pulse">Running AI pipeline...</p>
              </div>
            ) : result ? (
              result.type === 'error' ? (
                <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="font-medium mb-1">Generation Failed</p>
                  <p className="text-sm">{result.message}</p>
                </div>
              ) : (
                <div className="w-full space-y-4 text-center">
                  <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-lg">
                    <p className="font-medium">Success!</p>
                    <p className="text-sm">{result.data.message}</p>
                  </div>
                  
                  {result.data.media_url && outputType === 'image' && (
                    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-muted/50 flex justify-center p-4">
                      <img src={result.data.media_url} alt="Generated output" className="max-w-full max-h-[400px] object-contain shadow-md rounded" />
                    </div>
                  )}

                  <pre className="text-left text-xs bg-muted p-4 rounded overflow-auto max-h-[150px] border border-border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground">
                <Send className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Submit a prompt to generate content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
