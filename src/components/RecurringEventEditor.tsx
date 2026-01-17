import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, Trash2, Edit2, Check, X, Star, Gift, Calendar, Bell } from 'lucide-react';
import { RecurringEvent, EventType, EventIcon, EventColor } from '@/hooks/useRecurringEvents';
import { cn } from '@/lib/utils';

interface RecurringEventEditorProps {
  date: string;
  events: RecurringEvent[];
  onAdd: (name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onUpdate: (id: string, name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onDelete: (id: string) => void;
  currentYear: number;
  calculateYears: (event: RecurringEvent, currentYear: number) => number | null;
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  anniversary: 'Годишнина',
  memorial: 'Възпоменание',
  custom: 'Друго'
};

const EVENT_ICONS: Record<EventIcon, typeof Heart> = {
  heart: Heart,
  star: Star,
  gift: Gift,
  calendar: Calendar,
  bell: Bell
};

const EVENT_COLORS: Record<EventColor, { bg: string; border: string; text: string; badge: string }> = {
  purple: {
    bg: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-500',
    badge: 'bg-purple-100 dark:bg-purple-900'
  },
  blue: {
    bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900'
  },
  green: {
    bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-500',
    badge: 'bg-green-100 dark:bg-green-900'
  },
  orange: {
    bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-500',
    badge: 'bg-orange-100 dark:bg-orange-900'
  },
  red: {
    bg: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-500',
    badge: 'bg-red-100 dark:bg-red-900'
  }
};

export function RecurringEventEditor({ 
  date, 
  events, 
  onAdd, 
  onUpdate, 
  onDelete,
  currentYear,
  calculateYears
}: RecurringEventEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newType, setNewType] = useState<EventType>('anniversary');
  const [newIcon, setNewIcon] = useState<EventIcon>('heart');
  const [newColor, setNewColor] = useState<EventColor>('purple');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editType, setEditType] = useState<EventType>('anniversary');
  const [editIcon, setEditIcon] = useState<EventIcon>('heart');
  const [editColor, setEditColor] = useState<EventColor>('purple');

  const [, monthStr, dayStr] = date.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const handleAdd = () => {
    if (newName.trim()) {
      const year = newYear ? parseInt(newYear, 10) : undefined;
      onAdd(newName.trim(), month, day, newType, year, newIcon, newColor);
      resetAddForm();
    }
  };

  const resetAddForm = () => {
    setNewName('');
    setNewYear('');
    setNewType('anniversary');
    setNewIcon('heart');
    setNewColor('purple');
    setIsAdding(false);
  };

  const handleStartEdit = (event: RecurringEvent) => {
    setEditingId(event.id);
    setEditName(event.name);
    setEditYear(event.year?.toString() || '');
    setEditType(event.eventType);
    setEditIcon(event.icon);
    setEditColor(event.color);
  };

  const handleSaveEdit = (event: RecurringEvent) => {
    if (editName.trim()) {
      const year = editYear ? parseInt(editYear, 10) : undefined;
      onUpdate(event.id, editName.trim(), month, day, editType, year, editIcon, editColor);
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditYear('');
    setEditType('anniversary');
    setEditIcon('heart');
    setEditColor('purple');
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2 text-foreground">
          <Heart className="h-4 w-4 text-purple-500" />
          Годишнини и събития
        </h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
          >
            <Plus className="h-3 w-3" />
            Добави
          </Button>
        )}
      </div>

      {/* Existing events */}
      {events.length > 0 && (
        <div className="space-y-2 mb-3">
          {events.map((event) => {
            const years = calculateYears(event, currentYear);
            const colorStyles = EVENT_COLORS[event.color];
            const IconComponent = EVENT_ICONS[event.icon];
            
            if (editingId === event.id) {
              return (
                <div key={event.id} className="space-y-2 bg-purple-50 dark:bg-purple-950/30 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Име"
                      className="flex-1 h-8 text-sm"
                      autoFocus
                    />
                    <Input
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      placeholder="Година"
                      className="w-20 h-8 text-sm"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={editType} onValueChange={(v) => setEditType(v as EventType)}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editColor} onValueChange={(v) => setEditColor(v as EventColor)}>
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purple">Лилаво</SelectItem>
                        <SelectItem value="blue">Синьо</SelectItem>
                        <SelectItem value="green">Зелено</SelectItem>
                        <SelectItem value="orange">Оранжево</SelectItem>
                        <SelectItem value="red">Червено</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600"
                      onClick={() => handleSaveEdit(event)}
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
                </div>
              );
            }
            
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  "bg-gradient-to-r",
                  colorStyles.bg,
                  "border",
                  colorStyles.border
                )}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className={cn("h-4 w-4", colorStyles.text)} />
                  <span className="font-medium text-sm">{event.name}</span>
                  {years !== null && (
                    <span className={cn("text-xs text-muted-foreground px-1.5 py-0.5 rounded", colorStyles.badge)}>
                      {years} г.
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    ({EVENT_TYPE_LABELS[event.eventType]})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit(event)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(event.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new event form */}
      {isAdding && (
        <div className="space-y-2 bg-muted/50 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Име на събитието"
              className="flex-1 h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') resetAddForm();
              }}
            />
            <Input
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="Година"
              className="w-20 h-8 text-sm"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') resetAddForm();
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={newType} onValueChange={(v) => setNewType(v as EventType)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newColor} onValueChange={(v) => setNewColor(v as EventColor)}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Лилаво</SelectItem>
                <SelectItem value="blue">Синьо</SelectItem>
                <SelectItem value="green">Зелено</SelectItem>
                <SelectItem value="orange">Оранжево</SelectItem>
                <SelectItem value="red">Червено</SelectItem>
              </SelectContent>
            </Select>
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
              onClick={resetAddForm}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {events.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Няма добавени годишнини или събития
        </p>
      )}
    </div>
  );
}
