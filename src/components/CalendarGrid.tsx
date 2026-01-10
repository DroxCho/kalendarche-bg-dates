import { useState, useMemo, useEffect, useRef } from 'react';
import { BULGARIAN_DAYS, getHolidaysForDate, Holiday } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';
import { HolidayModal } from './HolidayModal';
import { HolidayType } from './HolidayFilter';
import { Leaf, StickyNote, Flag, Cross, Star } from 'lucide-react';
import { CalendarNote } from '@/hooks/useCalendarNotes';

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  activeFilters?: HolidayType[];
  notes?: Record<string, CalendarNote[]>;
  onAddNote?: (date: string, text: string) => void;
  onUpdateNote?: (date: string, noteId: string, text: string) => void;
  onDeleteNote?: (date: string, noteId: string) => void;
}

interface DayInfo {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
  holidays: Holiday[];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday (0) to 7 for Monday-first week
  return day === 0 ? 6 : day - 1;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarGrid({ year, month, activeFilters, notes = {}, onAddNote, onUpdateNote, onDeleteNote }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Scroll to today on initial mount
  useEffect(() => {
    if (todayRef.current && !hasScrolled.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolled.current = true;
    }
  }, []);

  const days = useMemo(() => {
    const result: DayInfo[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const date = new Date(prevYear, prevMonth, dayNumber);
      const dayOfWeek = date.getDay();
      result.push({
        date,
        dayNumber,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSaturday: dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSaturday: dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - result.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const dayOfWeek = date.getDay();
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSaturday: dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    return result;
  }, [year, month]);

  const handleDayClick = (day: DayInfo) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const filterHolidays = (holidays: Holiday[]) => {
    if (!activeFilters || activeFilters.length === 0) return [];
    return holidays.filter(h => activeFilters.includes(h.type));
  };

  // Check if a fasting holiday should show its name (start, end, or single-day)
  const shouldShowFastingName = (holiday: Holiday): boolean => {
    if (holiday.type !== 'fasting') return true;
    const name = holiday.name.toLowerCase();
    return name.includes('начало') || 
           name.includes('край') || 
           name.includes('пост на') || 
           name.includes('пост за') ||
           name.includes('усекновение');
  };

  return (
    <div className="animate-fade-in">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {BULGARIAN_DAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center py-2 text-sm font-semibold",
              index === 5 && "text-[hsl(var(--day-saturday))]",
              index === 6 && "text-[hsl(var(--day-sunday))]",
              index < 5 && "text-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
        {days.map((day, index) => {
          const filteredHolidays = filterHolidays(day.holidays);
          const hasFastingDay = day.holidays.some(h => h.type === 'fasting');
          const dateString = formatDateString(day.date);
          const dateNotes = notes[dateString] || [];
          const notesCount = dateNotes.length;
          
          return (
            <div
              key={index}
              ref={day.isToday && day.isCurrentMonth ? todayRef : null}
              onClick={() => handleDayClick(day)}
              className={cn(
                "calendar-day cursor-pointer hover:bg-muted/50 transition-colors",
                !day.isCurrentMonth && "opacity-40",
                day.isSaturday && day.isCurrentMonth && "calendar-day-saturday",
                day.isSunday && day.isCurrentMonth && "calendar-day-sunday",
                day.isToday && "calendar-day-today"
              )}
            >
              {/* Fasting icon in top right corner */}
              {hasFastingDay && day.isCurrentMonth && (
                <div className="absolute top-0.5 right-0.5 print:top-0 print:right-0">
                  <Leaf className="w-3 h-3 text-[hsl(var(--holiday-fasting))]" />
                </div>
              )}
              
              {/* Note indicators - one icon per note */}
              {notesCount > 0 && day.isCurrentMonth && (
                <div className="absolute top-0.5 left-0.5 flex gap-0.5 print:hidden">
                  {Array.from({ length: Math.min(notesCount, 3) }).map((_, i) => (
                    <StickyNote key={i} className="w-3 h-3 text-amber-500" />
                  ))}
                  {notesCount > 3 && (
                    <span className="text-[8px] text-amber-600 font-bold">+{notesCount - 3}</span>
                  )}
                </div>
              )}
              
              <span
                className={cn(
                  "calendar-day-number",
                  day.isSaturday && "text-[hsl(var(--day-saturday))]",
                  day.isSunday && "text-[hsl(var(--day-sunday))]",
                  day.isToday && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                )}
              >
                {day.dayNumber}
              </span>
              
              {filteredHolidays
                .filter(holiday => shouldShowFastingName(holiday))
                .slice(0, 2)
                .map((holiday, hIndex) => {
                  const getHolidayIcon = () => {
                    switch (holiday.type) {
                      case 'national':
                        return <Flag className="w-2.5 h-2.5 flex-shrink-0" />;
                      case 'orthodox':
                        return <Cross className="w-2.5 h-2.5 flex-shrink-0" />;
                      case 'nameday':
                        return <Star className="w-2.5 h-2.5 flex-shrink-0" />;
                      default:
                        return null;
                    }
                  };
                  const icon = getHolidayIcon();
                  
                  return (
                    <div
                      key={hIndex}
                      className={cn(
                        "holiday-badge",
                        holiday.type === 'national' && "holiday-national",
                        holiday.type === 'orthodox' && "holiday-orthodox",
                        holiday.type === 'nonworking' && "holiday-nonworking",
                        holiday.type === 'nameday' && "holiday-nameday",
                        holiday.type === 'folk' && "holiday-folk",
                        holiday.type === 'fasting' && "holiday-fasting"
                      )}
                      title={holiday.name}
                    >
                      {icon}
                      <span className="truncate">{holiday.name}</span>
                    </div>
                  );
                })}
              
              {filteredHolidays.length > 2 && (
                <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  +{filteredHolidays.length - 2} още
                </div>
              )}
            </div>
          );
        })}
      </div>

      <HolidayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDay?.date || null}
        holidays={selectedDay?.holidays || []}
        notes={selectedDay ? notes[formatDateString(selectedDay.date)] || [] : []}
        onAddNote={onAddNote}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
      />
    </div>
  );
}
