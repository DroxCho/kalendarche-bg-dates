import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarCheck, Calendar, Flag, Cross, Star, Flower2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BULGARIAN_DAYS_FULL,
  BULGARIAN_MONTHS,
  getHolidaysForDate,
  hasNonWorkingHoliday,
  Holiday,
} from '@/data/bulgarianHolidays';
import { translateHolidayName, translateHolidayDescription } from '@/data/holidayTranslations';
import { HolidayType } from './HolidayFilter';
import { NoteEditor } from './NoteEditor';
import { BirthdayEditor } from './BirthdayEditor';
import { RecurringEventEditor } from './RecurringEventEditor';
import { ShareButtons } from './ShareButtons';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { Birthday } from '@/hooks/useBirthdays';
import { RecurringEvent, EventType, EventIcon, EventColor } from '@/hooks/useRecurringEvents';

const ENGLISH_DAYS_FULL = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];
const ENGLISH_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DayViewProps {
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

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getHolidayIcon(type: Holiday['type']) {
  switch (type) {
    case 'national': return Flag;
    case 'orthodox': return Cross;
    case 'nameday': return Star;
    case 'folk': return Flower2;
    case 'fasting': return Leaf;
    default: return Calendar;
  }
}

export function DayView(props: DayViewProps) {
  const { focusDate, onDateChange, activeFilters, notes, birthdays, recurringEvents, calculateAge, calculateYears } = props;
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayOfWeek = focusDate.getDay();
  const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const dayName = isEnglish ? ENGLISH_DAYS_FULL[dayIdx] : BULGARIAN_DAYS_FULL[dayIdx];
  const monthName = isEnglish ? ENGLISH_MONTHS_FULL[focusDate.getMonth()] : BULGARIAN_MONTHS[focusDate.getMonth()];
  const ds = formatDateString(focusDate);

  const allHolidays = getHolidaysForDate(ds);
  const holidays = activeFilters.length === 0 ? [] : allHolidays.filter(h => activeFilters.includes(h.type));
  const hasNonWorking = hasNonWorkingHoliday(ds);
  const dayNotes = notes[ds] || [];
  const dayBirthdays = birthdays.filter(b => b.month === focusDate.getMonth() + 1 && b.day === focusDate.getDate());
  const dayEvents = recurringEvents.filter(e => e.month === focusDate.getMonth() + 1 && e.day === focusDate.getDate());

  const isToday = focusDate.getTime() === today.getTime();
  const isWeekend = dayIdx === 5 || dayIdx === 6;

  const handlePrev = () => {
    const d = new Date(focusDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };
  const handleNext = () => {
    const d = new Date(focusDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };
  const handleToday = () => onDateChange(new Date());

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={handlePrev} className="h-10 w-10 shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 flex-wrap justify-center min-w-0">
          <h2 className={cn(
            'text-xl sm:text-2xl md:text-3xl font-display font-semibold text-center',
            dayIdx === 5 && 'text-[hsl(var(--day-saturday))]',
            dayIdx === 6 && 'text-[hsl(var(--day-sunday))]',
            !isWeekend && 'text-foreground',
          )}>
            {focusDate.getDate()} {monthName} {focusDate.getFullYear()}
          </h2>
          {!isToday && (
            <Button variant="secondary" size="sm" onClick={handleToday} className="gap-1.5">
              <CalendarCheck className="h-4 w-4" />
              {t('calendar.today')}
            </Button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={handleNext} className="h-10 w-10 shrink-0">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground -mt-2">{dayName}</p>

      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-5 space-y-4">
        {holidays.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">{t('holidays.noHolidays')}</p>
        ) : (
          holidays.map((holiday, idx) => {
            const Icon = getHolidayIcon(holiday.type);
            const desc = translateHolidayDescription(holiday.name, i18n.language, {});
            return (
              <div
                key={idx}
                className={cn(
                  'p-4 rounded-lg border flex items-start gap-3',
                  holiday.type === 'national' && 'bg-[hsl(var(--holiday-national))]/10 border-[hsl(var(--holiday-national))]/30',
                  holiday.type === 'orthodox' && 'bg-[hsl(var(--holiday-orthodox))]/10 border-[hsl(var(--holiday-orthodox))]/30',
                  holiday.type === 'nameday' && 'bg-[hsl(var(--holiday-nameday))]/10 border-[hsl(var(--holiday-nameday))]/30',
                  holiday.type === 'folk' && 'bg-[hsl(var(--holiday-folk))]/10 border-[hsl(var(--holiday-folk))]/30',
                  holiday.type === 'fasting' && 'bg-[hsl(var(--holiday-fasting))]/10 border-[hsl(var(--holiday-fasting))]/30',
                  holiday.type === 'nonworking' && 'bg-[hsl(var(--holiday-nonworking))]/10 border-[hsl(var(--holiday-nonworking))]/30',
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 mt-0.5 shrink-0',
                  holiday.type === 'national' && 'text-[hsl(var(--holiday-national))]',
                  holiday.type === 'orthodox' && 'text-[hsl(var(--holiday-orthodox))]',
                  holiday.type === 'nameday' && 'text-[hsl(var(--holiday-nameday))]',
                  holiday.type === 'folk' && 'text-[hsl(var(--holiday-folk))]',
                  holiday.type === 'fasting' && 'text-[hsl(var(--holiday-fasting))]',
                  holiday.type === 'nonworking' && 'text-[hsl(var(--holiday-nonworking))]',
                )} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{translateHolidayName(holiday.name, i18n.language)}</h3>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{t(`holidays.${holiday.type}`)}</p>
                  {desc && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>}
                </div>
              </div>
            );
          })
        )}

        <NoteEditor
          date={ds}
          notes={dayNotes}
          onAdd={props.onAddNote}
          onUpdate={props.onUpdateNote}
          onDelete={props.onDeleteNote}
        />

        <BirthdayEditor
          date={ds}
          birthdays={dayBirthdays}
          onAdd={props.onAddBirthday}
          onUpdate={props.onUpdateBirthday}
          onDelete={props.onDeleteBirthday}
          currentYear={focusDate.getFullYear()}
          calculateAge={calculateAge}
        />

        <RecurringEventEditor
          date={ds}
          events={dayEvents}
          onAdd={props.onAddRecurringEvent}
          onUpdate={props.onUpdateRecurringEvent}
          onDelete={props.onDeleteRecurringEvent}
          currentYear={focusDate.getFullYear()}
          calculateYears={calculateYears}
        />

        <ShareButtons date={focusDate} holidays={allHolidays} />
      </div>
    </div>
  );
}
