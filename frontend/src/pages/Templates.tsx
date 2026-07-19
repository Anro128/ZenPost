import { useNavigate } from 'react-router-dom';
import { useTemplates, useDeleteTemplate } from '../hooks/useTemplates';
import { Plus, Edit, Trash2, LayoutTemplate } from 'lucide-react';

export default function Templates() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useTemplates();
  const deleteMutation = useDeleteTemplate();

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1 text-sm">Design templates for image and video generation.</p>
        </div>
        <button 
          onClick={() => navigate('/templates/new')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border shadow-sm">Loading templates...</div>
      ) : !templates || templates.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-border shadow-sm">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
            Create a template to define how your generated text should be styled visually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
              <div 
                className="h-32 w-full flex items-center justify-center" 
                style={{ backgroundColor: template.bg_color || '#000000', color: template.text_color || '#ffffff' }}
              >
                <div style={{ 
                  fontFamily: template.font_family, 
                  fontSize: '18px', 
                  textAlign: template.text_align || 'center' 
                }}>
                  Abc
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {template.is_default && (
                    <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-4 space-y-1">
                  <p>Layout: {template.layout}</p>
                  <p>Font: {template.font_family}</p>
                </div>
                <div className="mt-auto flex justify-end gap-2 border-t pt-3 border-border">
                  <button 
                    onClick={() => navigate(`/templates/${template.id}/edit`)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
