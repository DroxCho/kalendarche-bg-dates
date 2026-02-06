import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Trash2, Save, X, Plus, Pencil } from 'lucide-react';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  date: string;
  notes: CalendarNote[];
  onAdd: (date: string, text: string) => void;
  onUpdate: (date: string, noteId: string, text: string) => void;
  onDelete: (date: string, noteId: string) => void;
}

export function NoteEditor({ date, notes, onAdd, onUpdate, onDelete }: NoteEditorProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [editText, setEditText] = useState('');

  const handleAddSave = () => {
    if (newNoteText.trim()) {
      onAdd(date, newNoteText);
      setNewNoteText('');
      setIsAdding(false);
    }
  };

  const handleEditStart = (note: CalendarNote) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onUpdate(date, editingId, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (noteId: string) => {
    onDelete(date, noteId);
    if (editingId === noteId) {
      setEditingId(null);
      setEditText('');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">{t('notes.title')} ({notes.length})</span>
        </div>
        {!isAdding && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsAdding(true)}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="w-3 h-3" />
            {t('notes.add')}
          </Button>
        )}
      </div>

      {/* Add new note form */}
      {isAdding && (
        <div className="space-y-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
          <Textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={t('notes.placeholder')}
            className="min-h-[60px] text-sm resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddSave} className="gap-1 h-7">
              <Save className="w-3 h-3" />
              {t('common.save')}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsAdding(false);
                setNewNoteText('');
              }}
              className="h-7"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Existing notes */}
      {notes.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          {t('notes.noNotes')}
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div 
              key={note.id}
              className={cn(
                "p-3 rounded-lg border",
                editingId === note.id 
                  ? "bg-muted/50 border-primary/30" 
                  : "bg-muted/30 border-border"
              )}
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEditSave} className="gap-1 h-7">
                      <Save className="w-3 h-3" />
                      {t('common.save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-7">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap mb-2">
                    {note.text}
                  </p>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditStart(note)}
                      className="h-6 px-2 text-xs gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive gap-1"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
