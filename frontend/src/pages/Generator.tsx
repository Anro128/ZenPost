import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Video, Send, Cpu, AlertTriangle, Facebook, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTemplates } from '../hooks/useTemplates';
import { useProviders } from '../hooks/useProviders';
import { useFacebookPages } from '../hooks/useFacebookPages';

export default function Generator() {
  const [topic, setTopic] = useState('');
  const [outputType, setOutputType] = useState('image');
  const [templateId, setTemplateId] = useState('');
  const [selectedProviderKey, setSelectedProviderKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFbPageId, setSelectedFbPageId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishingFb, setIsPublishingFb] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [fbPublishResult, setFbPublishResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: templates } = useTemplates();
  const { data: providers, isLoading: isLoadingProviders } = useProviders(true);
  const { data: fbPages } = useFacebookPages();

  // Set default provider when list loads
  useEffect(() => {
    if (providers && providers.length > 0) {
      if (!selectedProviderKey || !providers.some(p => p.provider_key === selectedProviderKey)) {
        setSelectedProviderKey(providers[0].provider_key);
        setSelectedModel(providers[0].default_model);
      }
    }
  }, [providers, selectedProviderKey]);

  // Set default FB page
  useEffect(() => {
    if (fbPages && fbPages.length > 0 && !selectedFbPageId) {
      setSelectedFbPageId(String(fbPages[0].id));
    }
  }, [fbPages, selectedFbPageId]);

  const currentProvider = providers?.find(p => p.provider_key === selectedProviderKey);

  useEffect(() => {
    if (currentProvider) {
      setSelectedModel(currentProvider.default_model);
    }
  }, [selectedProviderKey, currentProvider]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !selectedProviderKey) return;
    
    setIsGenerating(true);
    setResult(null);
    setFbPublishResult(null);
    try {
      const res = await api.post('/generate', { 
        topic, 
        output_type: outputType,
        template_id: templateId ? Number(templateId) : undefined,
        provider_name: selectedProviderKey,
        model_name: selectedModel
      });
      setResult({ type: 'success', data: res.data });
    } catch (err: any) {
      setResult({ type: 'error', message: err.response?.data?.detail || err.message || 'Generation failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishToFacebook = async () => {
    if (!result?.data || !selectedFbPageId) return;

    setIsPublishingFb(true);
    setFbPublishResult(null);
    try {
      const res = await api.post('/facebook/publish', {
        facebook_page_id: Number(selectedFbPageId),
        message: result.data.text,
        image_url: result.data.media_url
      });
      setFbPublishResult({ success: true, message: res.data.message });
    } catch (err: any) {
      setFbPublishResult({ 
        success: false, 
        message: err.response?.data?.detail || err.message || 'Failed to publish to Facebook' 
      });
    } finally {
      setIsPublishingFb(false);
    }
  };

  const hasConfiguredProviders = providers && providers.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manual Generator</h1>
        <p className="text-muted-foreground mt-1 text-sm">Test the AI pipeline and publish output directly to your Facebook Page.</p>
      </div>

      {!isLoadingProviders && !hasConfiguredProviders && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-amber-600">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              No AI provider API Keys configured yet in .env. Please add your API key in Settings first.
            </span>
          </div>
          <Link 
            to="/settings" 
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Prompt / Topic</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="A motivational quote about persistence in coding..."
                required
              />
            </div>

            {/* AI Provider & Model selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Cpu className="h-4 w-4 mr-1 text-primary" /> AI Provider
                </label>
                <select 
                  value={selectedProviderKey}
                  onChange={e => setSelectedProviderKey(e.target.value)}
                  disabled={!hasConfiguredProviders}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  {hasConfiguredProviders ? (
                    providers.map(p => (
                      <option key={p.id} value={p.provider_key}>
                        {p.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No Active Provider</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model (Active Keys)</label>
                <select 
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  disabled={!hasConfiguredProviders}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs disabled:opacity-50"
                >
                  {currentProvider?.available_models.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )) || <option value="">None</option>}
                </select>
              </div>
            </div>

            {/* Target Facebook Page Selection */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <Facebook className="h-4 w-4 mr-1.5 text-blue-600" /> Target Facebook Page
              </label>
              {fbPages && fbPages.length > 0 ? (
                <select 
                  value={selectedFbPageId}
                  onChange={e => setSelectedFbPageId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {fbPages.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.page_name} (ID: {page.page_id})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-muted-foreground bg-muted p-2.5 rounded-md flex items-center justify-between">
                  <span>No Facebook Pages connected.</span>
                  <Link to="/facebook-pages" className="text-blue-600 font-medium hover:underline ml-2">Connect Page</Link>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Output Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setOutputType('image')}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${outputType === 'image' ? 'border-primary bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:bg-muted/30'}`}
                >
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="font-medium text-xs">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutputType('video')}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${outputType === 'video' ? 'border-primary bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:bg-muted/30'}`}
                >
                  <Video className="h-6 w-6 mb-1" />
                  <span className="font-medium text-xs">Video</span>
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
              disabled={isGenerating || !topic || !selectedProviderKey}
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
                <p className="text-muted-foreground animate-pulse text-sm">Generating via {currentProvider?.name} ({selectedModel})...</p>
              </div>
            ) : result ? (
              result.type === 'error' ? (
                <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 max-w-full">
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
                      <img src={result.data.media_url} alt="Generated output" className="max-w-full max-h-[350px] object-contain shadow-md rounded" />
                    </div>
                  )}

                  {/* Publish to Facebook Page Action */}
                  <div className="pt-2 border-t border-border space-y-3">
                    {fbPublishResult && (
                      <div className={`p-3 rounded-lg text-xs font-medium ${fbPublishResult.success ? 'bg-green-500/10 text-green-600 border border-green-500/20 flex items-center justify-center' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                        {fbPublishResult.success && <CheckCircle2 className="h-4 w-4 mr-1.5 flex-shrink-0" />}
                        <span>{fbPublishResult.message}</span>
                      </div>
                    )}

                    <button
                      onClick={handlePublishToFacebook}
                      disabled={isPublishingFb || !selectedFbPageId}
                      className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isPublishingFb ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Publishing to Facebook Page...
                        </>
                      ) : (
                        <>
                          <Facebook className="h-4 w-4 mr-2" />
                          Publish to Facebook Page Now
                        </>
                      )}
                    </button>
                  </div>
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
