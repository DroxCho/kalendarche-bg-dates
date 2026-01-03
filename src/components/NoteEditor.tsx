import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Trash2, Save, X } from 'lucide-react';

interface NoteEditorProps {
  date: string;
  existingNote?: string;
  onSave: (date: string, note: string) => void;
  onDelete: (date: string) => void;
  onClose: () => void;
}

export function NoteEditor({ date, existingNote, onSave, onDelete, onClose }: NoteEditorProps) {
  const [note, setNote] = useState(existingNote || '');
  const [isEditing, setIsEditing] = useState(!existingNote);

  useEffect(() => {
    setNote(existingNote || '');
    setIsEditing(!existingNote);
  }, [existingNote, date]);

  const handleSave = () => {
    onSave(date, note);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(date);
    setNote('');
    setIsEditing(true);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium">Бележка</span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Добавете бележка за този ден..."
            className="min-h-[80px] text-sm resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="gap-1">
              <Save className="w-3 h-3" />
              Запази
            </Button>
            {existingNote && (
              <Button size="sm" variant="ghost" onClick={() => {
                setNote(existingNote);
                setIsEditing(false);
              }}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap">
            {note}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Редактирай
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
