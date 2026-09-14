import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, CalendarRange, Check, Clock, Edit2, Plus, Trash2, X } from 'lucide-react';
import { CustomEvent, CustomEventInput, CustomEventColor } from '@/hooks/useCustomEvents';
import { useCustomEventsContext } from '@/hooks/useCustomEventsContext';
import { CUSTOM_EVENT_COLORS } from '@/components/customEventColors';
import { cn } from '@/lib/utils';

const todayString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const emptyForm = (): CustomEventInput => ({
  title: '',
  description: '',
  startDate: todayString(),
  endDate: todayString(),
  allDay: true,
  startTime: '09:00',
  endTime: '10:00',
  color: 'blue',
});

const MyEvents = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ctx = useCustomEventsContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomEventInput>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<CustomEvent | null>(null);

  const events = useMemo(
    () => [...(ctx?.customEvents ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [ctx?.customEvents]
  );

  const set = <K extends keyof CustomEventInput>(key: K, value: CustomEventInput[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
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
    if (!ctx || !form.title.trim()) return;
    const normalized: CustomEventInput = {
      ...form,
      endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
    };
    if (editingId) ctx.updateCustomEvent(editingId, normalized);
    else ctx.addCustomEvent(normalized);
    closeForm();
  };

  const confirmDelete = () => {
    if (ctx && pendingDelete) ctx.deleteCustomEvent(pendingDelete.id);
    if (pendingDelete && editingId === pendingDelete.id) closeForm();
    setPendingDelete(null);
  };

  const renderForm = () => (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <Input
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder={t('customEvents.titlePlaceholder')}
        className="h-9 text-sm"
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
          <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('customEvents.endDate')}</Label>
          <Input type="date" value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} className="h-9 text-sm" />
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
            <Input type="time" value={form.startTime || ''} onChange={e => set('startTime', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('customEvents.endTime')}</Label>
            <Input type="time" value={form.endTime || ''} onChange={e => set('endTime', e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select value={form.color} onValueChange={v => set('color', v as CustomEventColor)}>
          <SelectTrigger className="h-9 flex-1 text-xs">
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
        <Button size="sm" className="h-9" onClick={handleSave} disabled={!form.title.trim()}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-9" onClick={closeForm}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarRange className="h-5 w-5 text-blue-500" />
              {t('customEvents.title')}
            </CardTitle>
            {!isAdding && !editingId && (
              <Button size="sm" className="gap-1" onClick={startAdd}>
                <Plus className="h-4 w-4" />
                {t('customEvents.add')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {isAdding && renderForm()}

            {events.length === 0 && !isAdding && (
              <p className="text-sm text-muted-foreground">{t('customEvents.noEvents')}</p>
            )}

            {events.map(event =>
              editingId === event.id ? (
                <div key={event.id}>{renderForm()}</div>
              ) : (
                <div key={event.id} className="flex items-start gap-2 rounded-lg border p-3">
                  <span className={cn('mt-1 h-full min-h-[32px] w-1 rounded-full', CUSTOM_EVENT_COLORS[event.color].bar)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-[11px]', CUSTOM_EVENT_COLORS[event.color].chip)}>
                        {event.startDate === event.endDate ? event.startDate : `${event.startDate} → ${event.endDate}`}
                      </span>
                      {!event.allDay && event.startTime ? (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{t('customEvents.allDay')}</span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(event)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setPendingDelete(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customEvents.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customEvents.deleteConfirm', { title: pendingDelete?.title ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('customEvents.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyEvents;
