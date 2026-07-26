import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Code2, Copy, Check, Play, CalendarClock, Sliders, Cpu, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useProviders } from '../hooks/useProviders';

export default function PromptBuilder() {
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('Motivasi Sukses & Karir');
  const [tone, setTone] = useState('informative');
  const [audience, setAudience] = useState('general');
  const [language, setLanguage] = useState('id');
  const [customDirective, setCustomDirective] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const [selectedProviderKey, setSelectedProviderKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: providers } = useProviders(true);

  useEffect(() => {
    if (providers && providers.length > 0) {
      if (!selectedProviderKey || !providers.some(p => p.provider_key === selectedProviderKey)) {
        setSelectedProviderKey(providers[0].provider_key);
        setSelectedModel(providers[0].default_model);
      }
    }
  }, [providers, selectedProviderKey]);

  const currentProvider = providers?.find(p => p.provider_key === selectedProviderKey);

  // Generate prompt JSON spec representation with explicit main topic inclusion
  const generatedPromptSpec = `You are a content creator specializing in '${topic || 'General Topic'}'.
Create a short, impactful quote/text specifically about '${topic || 'General Topic'}'.

Rules:
- Main Topic / Focus: ${topic || 'General Topic'}
- Writing Style: ${tone} tone.
- Audience: ${audience}.
- Length: short/medium.
- Language: ${language}.${customDirective ? `\n- ${customDirective}` : ''}${negativePrompt ? `\n- AVOID: ${negativePrompt}` : ''}

JSON Schema Output:
{
  "text": "Main quote or text content specifically focused on ${topic || 'the topic'}",
  "caption": "",
  "hashtags": ["hashtag1", "hashtag2"],
  "keywords": ["seo1", "seo2"],
  "title": "Short title"
}`;

  const handleTestGeneration = async () => {
    if (!topic || !selectedProviderKey) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/generate', {
        topic,
        provider_name: selectedProviderKey,
        model_name: selectedModel
      });
      setTestResult({ type: 'success', data: res.data });
    } catch (err: any) {
      setTestResult({ 
        type: 'error', 
        message: err.response?.data?.detail || err.message || 'Generation failed' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPromptSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateScheduler = () => {
    navigate('/schedulers/new', {
      state: {
        topic,
        tone,
        audience,
        language,
        provider_name: selectedProviderKey,
        model_name: selectedModel
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Sliders className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prompt Engineering Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm">Design, fine-tune, and test structured AI prompts before creating automated schedulers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
          <h3 className="text-base font-medium flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Prompt Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium mb-1">Topic / Main Focus</label>
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Motivasi Belajar Coding & AI"
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Tone of Voice</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              >
                <option value="informative">Informative & Clear</option>
                <option value="inspirational">Inspirational & Empowering</option>
                <option value="humorous">Humorous & Casual</option>
                <option value="professional">Professional & Formal</option>
                <option value="dramatic">Dramatic & Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Target Audience</label>
              <select 
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              >
                <option value="general">General Public</option>
                <option value="developers">Developers & Tech Enthusiasts</option>
                <option value="entrepreneurs">Entrepreneurs & Founders</option>
                <option value="students">Students & Learners</option>
                <option value="creators">Content Creators</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Language</label>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              >
                <option value="id">Indonesian (Bahasa)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 flex items-center">
                <Cpu className="h-3.5 w-3.5 mr-1 text-primary" /> Test Provider
              </label>
              <select 
                value={selectedProviderKey}
                onChange={e => setSelectedProviderKey(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              >
                {providers?.map(p => (
                  <option key={p.id} value={p.provider_key}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Custom Style Directives (Optional)</label>
            <textarea 
              value={customDirective}
              onChange={e => setCustomDirective(e.target.value)}
              placeholder="e.g. Gunakan analogi pemrograman, buat kalimat pembuka yang menggugah..."
              className="w-full min-h-[60px] p-2.5 rounded-md border border-input bg-transparent text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Negative Directives / Avoid (Optional)</label>
            <input 
              type="text"
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              placeholder="e.g. Jangan gunakan kata 'cliche', jangan terlalu panjang"
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleTestGeneration}
              disabled={isTesting || !topic}
              className="flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Testing AI Output...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Test AI Generation
                </>
              )}
            </button>

            <button
              onClick={handleCreateScheduler}
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors"
            >
              <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
              Use in Scheduler
            </button>
          </div>
        </div>

        {/* Live Prompt Preview & Test Output Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Prompt Code Box */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium flex items-center">
                <Code2 className="h-4 w-4 mr-1.5 text-primary" /> Generated Prompt Spec
              </span>
              <button 
                onClick={handleCopyPrompt}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center px-2 py-1 rounded bg-background border"
              >
                {copied ? <Check className="h-3 w-3 mr-1 text-green-600" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy Spec'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono bg-muted/20 text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[260px]">
              {generatedPromptSpec}
            </pre>
          </div>

          {/* Test Generation Result Box */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[200px] flex flex-col justify-center">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Live Test Output</h4>

            {isTesting ? (
              <div className="py-8 text-center space-y-3">
                <div className="animate-pulse flex space-x-3 justify-center">
                  <Sparkles className="h-6 w-6 text-primary animate-spin" />
                </div>
                <p className="text-xs text-muted-foreground">Generating text via {currentProvider?.name}...</p>
              </div>
            ) : testResult ? (
              testResult.type === 'error' ? (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
                  {testResult.message}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-foreground">"{testResult.data.text}"</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Topic: <strong className="text-foreground">{topic}</strong></span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">OK 200</span>
                  </div>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Click <strong>"Test AI Generation"</strong> to preview the output produced by this prompt design.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
