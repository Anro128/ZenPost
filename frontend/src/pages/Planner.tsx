import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlannerItems, useCreatePlannerItem, useDeletePlannerItem } from '../hooks/usePlanner';
import { CalendarDays, Plus, Trash2, Calendar, Tag, ArrowRight, KanbanSquare } from 'lucide-react';
import { PlannerItem } from '../types/planner';

export default function Planner() {
  const navigate = useNavigate();
  const { data: items, isLoading } = usePlannerItems();
  const createMutation = useCreatePlannerItem();
  const deleteMutation = useDeletePlannerItem();

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('Tech & Motivation');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    createMutation.mutate({
      topic,
      keyword: keyword || topic,
      category,
      target_date: targetDate,
      priority,
      notes: notes || null,
      status: 'draft'
    }, {
      onSuccess: () => {
        setShowAddForm(false);
        setTopic('');
        setKeyword('');
        setNotes('');
      }
    });
  };

  const handleDelete = (id: number, topicName: string) => {
    if (window.confirm(`Delete '${topicName}' from planner?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleConvertToScheduler = (item: PlannerItem) => {
    navigate('/schedulers/new', {
      state: {
        topic: item.topic,
        planner_id: item.id
      }
    });
  };

  const filteredItems = (items || []).filter((item: PlannerItem) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <KanbanSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Content Planner</h1>
            <p className="text-muted-foreground mt-1 text-sm">Organize, schedule, and plan your upcoming AI content topics.</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showAddForm ? 'Close Form' : 'Add Content Idea'}
        </button>
      </div>

      {/* Inline Form to Add New Idea */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-base font-medium">Add New Topic / Content Idea</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Topic / Title</label>
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Tips Belajar Python untuk Pemula"
                required
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Target Date</label>
              <input 
                type="date" 
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                required
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <input 
                type="text" 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Keyword / Hashtag</label>
              <input 
                type="text" 
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. #coding #python"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Notes / Outline (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Targetkan audiens mahasiswa, sertakan 3 poin penting..."
              className="w-full min-h-[60px] p-2.5 rounded-md border border-input bg-transparent text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md border border-input text-xs font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !topic}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Content Idea'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        {['all', 'draft', 'scheduled', 'published'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${filterStatus === st ? 'bg-secondary text-secondary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid of Planned Items */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading planner items...</div>
        ) : !filteredItems || filteredItems.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No planned content items</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Add your upcoming topic ideas to organize your content pipeline.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredItems.map((item: PlannerItem) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm truncate">{item.topic}</h4>
                    
                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      item.priority === 'high' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                      item.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {item.priority}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground capitalize">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-0.5">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> {item.target_date}
                    </span>
                    <span className="flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1" /> {item.category}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-muted-foreground italic pt-1">{item.notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                  <button 
                    onClick={() => handleConvertToScheduler(item)}
                    className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Convert to Scheduler <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(item.id, item.topic)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-muted rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
