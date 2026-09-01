import { useMemo, useState } from 'react';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarCheck, StickyNote, Cake, Heart, Leaf, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BULGARIAN_DAYS_FULL,
  BULGARIAN_MONTHS,
  getHolidaysForDate,
  hasNonWorkingHoliday,
  Holiday,
} from '@/data/bulgarianHolidays';
import { translateHolidayName } from '@/data/holidayTranslations';
import { HolidayType } from './HolidayFilter';
import { HolidayModal } from './HolidayModal';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { Birthday } from '@/hooks/useBirthdays';
import { RecurringEvent, EventType, EventIcon, EventColor } from '@/hooks/useRecurringEvents';
import { CUSTOM_EVENT_COLORS } from './customEventColors';
import { useCustomEventsContext } from '@/hooks/useCustomEventsContext';

const ENGLISH_DAYS_FULL = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];
const ENGLISH_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface WeekViewProps {
  focusDate: Date;
  onDateChange: (date: Date) => void;
  activeFilters: HolidayType[];
  notes: Record<string, CalendarNote[]>;
  birthdays: Birthday[];
  recurringEvents: RecurringEvent[];
  onAddNote: (date: string, text: string) => void;
  onUpdateNote: (date: string, noteId: string, text: string) => void;
  onDeleteNote: (date: string, noteId: string) => void;
  onAddBirthday: (name: string, month: number, day: number, year?: number) => void;
  onUpdateBirthday: (id: string, name: string, month: number, day: number, year?: number) => void;
  onDeleteBirthday: (id: string) => void;
  calculateAge: (birthday: Birthday, currentYear: number) => number | null;
  onAddRecurringEvent: (name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onUpdateRecurringEvent: (id: string, name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onDeleteRecurringEvent: (id: string) => void;
  calculateYears: (event: RecurringEvent, currentYear: number) => number | null;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  date.setDate(date.getDate() + diff);
  return date;
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function WeekView(props: WeekViewProps) {
  const { focusDate, onDateChange, activeFilters, notes, birthdays, recurringEvents, calculateAge, calculateYears } = props;
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const customEventsCtx = useCustomEventsContext();
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const weekStart = useMemo(() => startOfWeek(focusDate), [focusDate]);
  const today = useCurrentDate();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const filterHolidays = (hs: Holiday[]) =>
    activeFilters.length === 0 ? [] : hs.filter(h => activeFilters.includes(h.type));

  const isOrdinaryFasting = (h: Holiday) => {
    if (h.type !== 'fasting') return false;
    const n = h.name.toLowerCase();
    return n === 'сряда - постен ден' || n === 'петък - постен ден';
  };

  const handlePrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };
  const handleNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };
  const handleToday = () => onDateChange(new Date());

  const weekEnd = days[6];
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const months = isEnglish ? ENGLISH_MONTHS_FULL : BULGARIAN_MONTHS;
  const headerLabel = sameMonth
    ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${months[weekStart.getMonth()]} ${weekEnd.getFullYear()}`
    : `${weekStart.getDate()} ${months[weekStart.getMonth()]} – ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const isCurrentWeek = days.some(d => isSameDay(d, today));

  const openDay = (date: Date) => {
    setModalDate(date);
    setModalOpen(true);
  };

  const modalDateString = modalDate ? formatDateString(modalDate) : '';
  const modalHolidays = modalDate ? getHolidaysForDate(modalDateString) : [];
  const modalBirthdays = modalDate
    ? birthdays.filter(b => b.month === modalDate.getMonth() + 1 && b.day === modalDate.getDate())
    : [];
  const modalEvents = modalDate
    ? recurringEvents.filter(e => e.month === modalDate.getMonth() + 1 && e.day === modalDate.getDate())
    : [];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={handlePrev} className="h-10 w-10 shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 flex-wrap justify-center min-w-0">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground text-center">
            {headerLabel}
          </h2>
          {!isCurrentWeek && (
            <Button variant="secondary" size="sm" onClick={handleToday} className="gap-1.5 bg-emerald-100 text-emerald-700 border-2 border-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-400 dark:hover:bg-emerald-900/60">
              <CalendarCheck className="h-4 w-4" />
              {t('calendar.today')}
            </Button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={handleNext} className="h-10 w-10 shrink-0">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-1">
        {days.map((date, idx) => {
          const ds = formatDateString(date);
          const allHolidays = getHolidaysForDate(ds);
          const visibleHolidays = filterHolidays(allHolidays).filter(h => !isOrdinaryFasting(h));
          const hasFasting = allHolidays.some(h => h.type === 'fasting');
          const hasNonWorking = hasNonWorkingHoliday(ds);
          const dayNotes = notes[ds] || [];
          const dayBirthdays = birthdays.filter(b => b.month === date.getMonth() + 1 && b.day === date.getDate());
          const dayEvents = recurringEvents.filter(e => e.month === date.getMonth() + 1 && e.day === date.getDate());
          const isToday = isSameDay(date, today);
          const isWeekend = idx === 5 || idx === 6;
          const dayName = isEnglish ? ENGLISH_DAYS_FULL[idx] : BULGARIAN_DAYS_FULL[idx];

          return (
            <button
              key={ds}
              onClick={() => openDay(date)}
              className={cn(
                'flex flex-col items-stretch text-left bg-card border border-border rounded-lg p-3 min-h-[480px] hover:bg-secondary/40 transition-colors',
                isToday && 'ring-2 ring-primary ring-inset',
                idx === 5 && 'bg-[hsl(var(--day-saturday-bg))]',
                idx === 6 && 'bg-[hsl(var(--day-sunday-bg))]',
                hasNonWorking && !isWeekend && 'bg-[hsl(var(--day-sunday-bg))]',
              )}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex flex-col">
                  <span className={cn(
                    'text-[11px] uppercase tracking-wide font-medium',
                    idx === 5 && 'text-[hsl(var(--day-saturday))]',
                    idx === 6 && 'text-[hsl(var(--day-sunday))]',
                    !isWeekend && 'text-muted-foreground',
                  )}>
                    {dayName}
                  </span>
                  <span className={cn(
                    'text-2xl font-semibold leading-none mt-1',
                    idx === 5 && 'text-[hsl(var(--day-saturday))]',
                    idx === 6 && 'text-[hsl(var(--day-sunday))]',
                    hasNonWorking && !isWeekend && "text-[hsl(var(--holiday-nonworking))]",
                  )}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasFasting && <Leaf className="w-3.5 h-3.5 text-[hsl(var(--holiday-fasting))]" />}
                  {dayNotes.length > 0 && <StickyNote className="w-3.5 h-3.5 text-amber-500" />}
                  {dayBirthdays.length > 0 && <Cake className="w-3.5 h-3.5 text-pink-500" />}
                  {dayEvents.length > 0 && <Heart className="w-3.5 h-3.5 text-purple-500" />}
                </div>
              </div>
              <div className="space-y-1 flex-1">
                {visibleHolidays.slice(0, 4).map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-[11px] px-1.5 py-0.5 rounded truncate text-white',
                      h.type === 'national' && 'bg-[hsl(var(--holiday-national))]',
                      h.type === 'orthodox' && 'bg-[hsl(var(--holiday-orthodox))]',
                      h.type === 'nameday' && 'bg-[hsl(var(--holiday-nameday))]',
                      h.type === 'folk' && 'bg-[hsl(var(--holiday-folk))]',
                      h.type === 'fasting' && 'bg-[hsl(var(--holiday-fasting))]',
                      h.type === 'nonworking' && 'bg-[hsl(var(--holiday-nonworking))]',
                    )}
                    title={translateHolidayName(h.name, i18n.language)}
                  >
                    {translateHolidayName(h.name, i18n.language)}
                  </div>
                ))}
                {visibleHolidays.length > 4 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{visibleHolidays.length - 4} {t('notes.more')}
                  </div>
                )}
                {dayBirthdays.slice(0, 2).map(b => {
                  const age = calculateAge(b, date.getFullYear());
                  return (
                    <div key={b.id} className="text-[11px] px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 truncate flex items-center gap-1">
                      <Cake className="w-3 h-3 shrink-0" />
                      <span className="truncate">{b.name}{age !== null ? ` (${age})` : ''}</span>
                    </div>
                  );
                })}
                {dayEvents.slice(0, 2).map(e => {
                  const yrs = calculateYears(e, date.getFullYear());
                  return (
                    <div key={e.id} className="text-[11px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 truncate flex items-center gap-1">
                      <Heart className="w-3 h-3 shrink-0" />
                      <span className="truncate">{e.name}{yrs !== null ? ` (${yrs})` : ''}</span>
                    </div>
                  );
                })}
                {(customEventsCtx?.getCustomEventsForDate(ds) ?? []).slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className={cn('text-[11px] px-1.5 py-0.5 rounded truncate flex items-center gap-1', CUSTOM_EVENT_COLORS[ev.color].chip)}
                    title={`${ev.title}${ev.allDay ? '' : ` (${ev.startTime}–${ev.endTime})`}`}
                  >
                    <CalendarRange className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ev.title}{!ev.allDay && ev.startTime ? ` ${ev.startTime}` : ''}</span>
                  </div>
                ))}
                {dayNotes.slice(0, 2).map(n => (
                  <div key={n.id} className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 truncate flex items-center gap-1">
                    <StickyNote className="w-3 h-3 shrink-0" />
                    <span className="truncate">{n.text}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <HolidayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={modalDate}
        holidays={modalHolidays}
        notes={modalDate ? notes[modalDateString] || [] : []}
        birthdays={modalBirthdays}
        recurringEvents={modalEvents}
        onAddNote={props.onAddNote}
        onUpdateNote={props.onUpdateNote}
        onDeleteNote={props.onDeleteNote}
        onAddBirthday={props.onAddBirthday}
        onUpdateBirthday={props.onUpdateBirthday}
        onDeleteBirthday={props.onDeleteBirthday}
        calculateAge={props.calculateAge}
        onAddRecurringEvent={props.onAddRecurringEvent}
        onUpdateRecurringEvent={props.onUpdateRecurringEvent}
        onDeleteRecurringEvent={props.onDeleteRecurringEvent}
        calculateYears={props.calculateYears}
      />
    </div>
  );
}
