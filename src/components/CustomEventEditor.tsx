import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarRange, Plus, Trash2, Edit2, Check, X, Clock } from 'lucide-react';
import { CustomEvent, CustomEventInput, CustomEventColor } from '@/hooks/useCustomEvents';
import { CUSTOM_EVENT_COLORS } from './customEventColors';
import { cn } from '@/lib/utils';

interface CustomEventEditorProps {
  date: string; // YYYY-MM-DD
  events: CustomEvent[];
  onAdd: (input: CustomEventInput) => void;
  onUpdate: (id: string, input: CustomEventInput) => void;
  onDelete: (id: string) => void;
}

const emptyForm = (date: string): CustomEventInput => ({
  title: '',
  description: '',
  startDate: date,
  endDate: date,
  allDay: true,
  startTime: '09:00',
  endTime: '10:00',
  color: 'blue',
});

export function CustomEventEditor({ date, events, onAdd, onUpdate, onDelete }: CustomEventEditorProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomEventInput>(() => emptyForm(date));

  const set = <K extends keyof CustomEventInput>(key: K, value: CustomEventInput[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm(date));
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm(date));
    setIsAdding(true);
  };

  const startEdit = (event: CustomEvent) => {
    setIsAdding(false);
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      color: event.color,
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const normalized: CustomEventInput = {
      ...form,
      endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
    };
    if (editingId) onUpdate(editingId, normalized);
    else onAdd(normalized);
    closeForm();
  };

  const renderForm = () => (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <Input
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder={t('customEvents.titlePlaceholder')}
        className="h-8 text-sm"
        maxLength={120}
        autoFocus
      />
      <Textarea
        value={form.description || ''}
        onChange={e => set('description', e.target.value)}
        placeholder={t('customEvents.descriptionPlaceholder')}
        className="min-h-[60px] text-sm"
        maxLength={500}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('customEvents.startDate')}</Label>
          <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('customEvents.endDate')}</Label>
          <Input type="date" value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} className="h-8 text-sm" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm">{t('customEvents.allDay')}</Label>
        <Switch checked={form.allDay} onCheckedChange={v => set('allDay', v)} />
      </div>

      {!form.allDay && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('customEvents.startTime')}</Label>
            <Input type="time" value={form.startTime || ''} onChange={e => set('startTime', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('customEvents.endTime')}</Label>
            <Input type="time" value={form.endTime || ''} onChange={e => set('endTime', e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select value={form.color} onValueChange={v => set('color', v as CustomEventColor)}>
          <SelectTrigger className="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">{t('events.colorBlue')}</SelectItem>
            <SelectItem value="green">{t('events.colorGreen')}</SelectItem>
            <SelectItem value="purple">{t('events.colorPurple')}</SelectItem>
            <SelectItem value="orange">{t('events.colorOrange')}</SelectItem>
            <SelectItem value="red">{t('events.colorRed')}</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8" onClick={handleSave} disabled={!form.title.trim()}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8" onClick={closeForm}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2 text-foreground">
          <CalendarRange className="h-4 w-4 text-blue-500" />
          {t('customEvents.title')}
        </h4>
        {!isAdding && !editingId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={startAdd}
            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Plus className="h-3 w-3" />
            {t('customEvents.add')}
          </Button>
        )}
      </div>

      {events.length > 0 && (
        <div className="space-y-2 mb-3">
          {events.map(event =>
            editingId === event.id ? (
              <div key={event.id}>{renderForm()}</div>
            ) : (
              <div key={event.id} className="flex items-start gap-2 rounded-lg border p-2">
                <span className={cn('mt-1 h-full min-h-[28px] w-1 rounded-full', CUSTOM_EVENT_COLORS[event.color].bar)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className={cn('text-[11px] px-1.5 py-0.5 rounded', CUSTOM_EVENT_COLORS[event.color].chip)}>
                      {event.startDate === event.endDate
                        ? event.startDate
                        : `${event.startDate} → ${event.endDate}`}
                    </span>
                    {!event.allDay && event.startTime && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                      </span>
                    )}
                    {event.allDay && (
                      <span className="text-[11px] text-muted-foreground">{t('customEvents.allDay')}</span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{event.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(event)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(event.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {isAdding && renderForm()}

      {!isAdding && !editingId && events.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('customEvents.noEvents')}</p>
      )}
    </div>
  );
}
