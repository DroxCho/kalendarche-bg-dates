import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cake, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Birthday } from '@/hooks/useBirthdays';
import { cn } from '@/lib/utils';

interface BirthdayEditorProps {
  date: string;
  birthdays: Birthday[];
  onAdd: (name: string, month: number, day: number, year?: number) => void;
  onUpdate: (id: string, name: string, month: number, day: number, year?: number) => void;
  onDelete: (id: string) => void;
  currentYear: number;
  calculateAge: (birthday: Birthday, currentYear: number) => number | null;
}

export function BirthdayEditor({ 
  date, 
  birthdays, 
  onAdd, 
  onUpdate, 
  onDelete,
  currentYear,
  calculateAge
}: BirthdayEditorProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editYear, setEditYear] = useState('');

  const [, monthStr, dayStr] = date.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const handleAdd = () => {
    if (newName.trim()) {
      const year = newYear ? parseInt(newYear, 10) : undefined;
      onAdd(newName.trim(), month, day, year);
      setNewName('');
      setNewYear('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (birthday: Birthday) => {
    setEditingId(birthday.id);
    setEditName(birthday.name);
    setEditYear(birthday.year?.toString() || '');
  };

  const handleSaveEdit = (birthday: Birthday) => {
    if (editName.trim()) {
      const year = editYear ? parseInt(editYear, 10) : undefined;
      onUpdate(birthday.id, editName.trim(), month, day, year);
      setEditingId(null);
      setEditName('');
      setEditYear('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditYear('');
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2 text-foreground">
          <Cake className="h-4 w-4 text-pink-500" />
          {t('birthdays.title')}
        </h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950"
          >
            <Plus className="h-3 w-3" />
            {t('birthdays.add')}
          </Button>
        )}
      </div>

      {/* Existing birthdays */}
      {birthdays.length > 0 && (
        <div className="space-y-2 mb-3">
          {birthdays.map((birthday) => {
            const age = calculateAge(birthday, currentYear);
            
            if (editingId === birthday.id) {
              return (
                <div key={birthday.id} className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/30 p-2 rounded-lg">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t('common.name')}
                    className="flex-1 h-8 text-sm"
                    autoFocus
                  />
                  <Input
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder={t('common.year')}
                    className="w-20 h-8 text-sm"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-green-600"
                    onClick={() => handleSaveEdit(birthday)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            }
            
            return (
              <div
                key={birthday.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
                  "border border-pink-200 dark:border-pink-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-pink-500" />
                  <span className="font-medium text-sm">{birthday.name}</span>
                  {age !== null && (
                    <span className="text-xs text-muted-foreground bg-pink-100 dark:bg-pink-900 px-1.5 py-0.5 rounded">
                      {age} {t('birthdays.years')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit(birthday)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(birthday.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new birthday form */}
      {isAdding && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('birthdays.namePlaceholder')}
            className="flex-1 h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
          />
          <Input
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder={t('birthdays.yearPlaceholder')}
            className="w-20 h-8 text-sm"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-600"
            onClick={handleAdd}
            disabled={!newName.trim()}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => {
              setIsAdding(false);
              setNewName('');
              setNewYear('');
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {birthdays.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground text-center py-2">
          {t('birthdays.noBirthdays')}
        </p>
      )}
    </div>
  );
}
