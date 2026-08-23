import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BULGARIAN_DAYS, getHolidaysForDate, hasNonWorkingHoliday, Holiday } from '@/data/bulgarianHolidays';
import { translateHolidayName } from '@/data/holidayTranslations';
import { cn } from '@/lib/utils';
import { HolidayModal } from './HolidayModal';
import { CUSTOM_EVENT_COLORS } from './CustomEventEditor';
import { useCustomEventsContext } from '@/hooks/useCustomEventsContext';
import { HolidayType } from './HolidayFilter';
import { Leaf, StickyNote, Flag, Cross, Star, Flower2, Cake, Heart, CalendarRange } from 'lucide-react';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { Birthday } from '@/hooks/useBirthdays';
import { RecurringEvent, EventType, EventIcon, EventColor } from '@/hooks/useRecurringEvents';
import { CustomEvent, CustomEventColor } from '@/hooks/useCustomEvents';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  activeFilters?: HolidayType[];
  notes?: Record<string, CalendarNote[]>;
  birthdays?: Birthday[];
  recurringEvents?: RecurringEvent[];
  onAddNote?: (date: string, text: string) => void;
  onUpdateNote?: (date: string, noteId: string, text: string) => void;
  onDeleteNote?: (date: string, noteId: string) => void;
  onMoveNote?: (fromDate: string, toDate: string, noteId: string) => void;
  onAddBirthday?: (name: string, month: number, day: number, year?: number) => void;
  onUpdateBirthday?: (id: string, name: string, month: number, day: number, year?: number) => void;
  onDeleteBirthday?: (id: string) => void;
  calculateAge?: (birthday: Birthday, currentYear: number) => number | null;
  onAddRecurringEvent?: (name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onUpdateRecurringEvent?: (id: string, name: string, month: number, day: number, eventType: EventType, year?: number, icon?: EventIcon, color?: EventColor) => void;
  onDeleteRecurringEvent?: (id: string) => void;
  calculateYears?: (event: RecurringEvent, currentYear: number) => number | null;
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

type CustomEventSegData = {
  eventId: string;
  color: CustomEventColor;
  title: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  isStart: boolean;
  isEnd: boolean;
};

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

export function CalendarGrid({ 
  year, 
  month, 
  activeFilters, 
  notes = {}, 
  birthdays = [],
  recurringEvents = [],
  onAddNote, 
  onUpdateNote, 
  onDeleteNote, 
  onMoveNote,
  onAddBirthday,
  onUpdateBirthday,
  onDeleteBirthday,
  calculateAge,
  onAddRecurringEvent,
  onUpdateRecurringEvent,
  onDeleteRecurringEvent,
  calculateYears
}: CalendarGridProps) {
  const { i18n, t } = useTranslation();
  const customEventsCtx = useCustomEventsContext();
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Get birthdays for a specific date
  const getBirthdaysForDate = (month: number, day: number): Birthday[] => {
    return birthdays.filter(b => b.month === month && b.day === day);
  };

  // Get recurring events for a specific date
  const getEventsForDate = (month: number, day: number): RecurringEvent[] => {
    return recurringEvents.filter(e => e.month === month && e.day === day);
  };

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

  // Check if a fasting holiday is an ordinary Wednesday/Friday fast
  const isOrdinaryFastingDay = (holiday: Holiday): boolean => {
    if (holiday.type !== 'fasting') return false;
    const name = holiday.name.toLowerCase();
    return name === 'сряда - постен ден' || name === 'петък - постен ден';
  };

  // Check if a holiday should be displayed as a badge with name
  const shouldShowHolidayBadge = (holiday: Holiday): boolean => {
    // Hide ordinary Wednesday/Friday fasting days (icon in corner is enough)
    if (isOrdinaryFastingDay(holiday)) return false;
    return true;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fromDate: string, noteId: string, noteText: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({ fromDate, noteId }));
    e.dataTransfer.effectAllowed = 'move';
    // Create a custom drag image
    const dragEl = document.createElement('div');
    dragEl.textContent = noteText.length > 30 ? noteText.slice(0, 30) + '...' : noteText;
    dragEl.className = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-xs shadow-lg';
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
  };

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateString);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, toDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { fromDate, noteId } = data;
      if (fromDate && noteId && onMoveNote) {
        onMoveNote(fromDate, toDate, noteId);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  // Build per-cell slot layout so multi-day custom events render as one continuous
  // bar across all the days they cover (splitting only at week-row boundaries).
  const customEventSegments = useMemo<(CustomEventSegData | null)[][]>(() => {
    const events = customEventsCtx?.customEvents ?? [];
    const byCell: (CustomEventSegData | null)[][] = Array.from({ length: 42 }, () => []);
    if (!events.length) return byCell;

    const firstDate = formatDateString(days[0].date);
    const lastDate = formatDateString(days[41].date);

    const ranges: { ev: CustomEvent; from: number; to: number }[] = [];
    for (const ev of events) {
      let from: number;
      if (ev.startDate < firstDate) from = 0;
      else {
        const f = days.findIndex(d => formatDateString(d.date) === ev.startDate);
        if (f === -1) continue;
        from = f;
      }
      let to: number;
      if (ev.endDate > lastDate) to = 41;
      else {
        const f = days.findIndex(d => formatDateString(d.date) === ev.endDate);
        if (f === -1) continue;
        to = f;
      }
      if (from > to) continue;
      ranges.push({ ev, from, to });
    }

    for (let r = 0; r < 6; r++) {
      const rowStart = r * 7;
      const rowEnd = rowStart + 6;
      const inRow = ranges
        .filter(rg => rg.from <= rowEnd && rg.to >= rowStart)
        .sort((a, b) => a.from - b.from || a.to - b.to || a.ev.id.localeCompare(b.ev.id));
      const maxSlot = Math.min(inRow.length, 4);
      for (let c = rowStart; c <= rowEnd; c++) {
        while (byCell[c].length < maxSlot) byCell[c].push(null);
      }
      inRow.slice(0, 4).forEach((rg, slot) => {
        const segFrom = Math.max(rg.from, rowStart);
        const segTo = Math.min(rg.to, rowEnd);
        for (let c = segFrom; c <= segTo; c++) {
          byCell[c][slot] = {
            eventId: rg.ev.id,
            color: rg.ev.color,
            title: rg.ev.title,
            allDay: rg.ev.allDay,
            startTime: rg.ev.startTime,
            endTime: rg.ev.endTime,
            isStart: c === rg.from,
            isEnd: c === rg.to,
          };
        }
      });
    }
    return byCell;
  }, [days, customEventsCtx?.customEvents]);

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
          const hasNonWorking = hasNonWorkingHoliday(dateString);
          const dateNotes = notes[dateString] || [];
          const notesCount = dateNotes.length;
          const dateBirthdays = getBirthdaysForDate(day.date.getMonth() + 1, day.date.getDate());
          const hasBirthday = dateBirthdays.length > 0;
          const dateEvents = getEventsForDate(day.date.getMonth() + 1, day.date.getDate());
          const hasEvents = dateEvents.length > 0;
          
          return (
            <div
              key={index}
              ref={day.isToday && day.isCurrentMonth ? todayRef : null}
              onClick={() => handleDayClick(day)}
              onDragOver={(e) => handleDragOver(e, dateString)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateString)}
              className={cn(
                "calendar-day cursor-pointer hover:bg-muted/50 transition-colors",
                !day.isCurrentMonth && "opacity-40",
                day.isSaturday && day.isCurrentMonth && "calendar-day-saturday",
                day.isSunday && day.isCurrentMonth && "calendar-day-sunday",
                hasNonWorking && !day.isSaturday && !day.isSunday && day.isCurrentMonth && "calendar-day-nonworking",
                day.isToday && "calendar-day-today",
                dragOverDate === dateString && "ring-2 ring-primary ring-inset bg-primary/10"
              )}
            >
              {/* Fasting icon in top right corner with tooltip */}
              {hasFastingDay && day.isCurrentMonth && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-0.5 right-0.5 print:top-0 print:right-0 cursor-help">
                        <Leaf className="w-3 h-3 text-[hsl(var(--holiday-fasting))]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-xs space-y-0.5">
                        {day.holidays
                          .filter(h => h.type === 'fasting')
                          .map((h, i) => (
                            <div key={i}>{translateHolidayName(h.name, i18n.language)}</div>
                          ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Note indicators with tooltip - draggable */}
              {notesCount > 0 && day.isCurrentMonth && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-0.5 left-0.5 flex gap-0.5 print:hidden">
                        {dateNotes.slice(0, 3).map((note, i) => (
                          <div
                            key={note.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, dateString, note.id, note.text)}
                            className="cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <StickyNote className="w-3 h-3 text-amber-500 hover:text-amber-600 transition-colors" />
                          </div>
                        ))}
                        {notesCount > 3 && (
                          <span className="text-[8px] text-amber-600 font-bold">+{notesCount - 3}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground italic mb-1">{t('notes.dragToMove')}</p>
                        {dateNotes.slice(0, 3).map((note) => (
                          <div key={note.id} className="truncate max-w-[200px]">
                            {note.text.length > 50 ? `${note.text.slice(0, 50)}...` : note.text}
                          </div>
                        ))}
                        {notesCount > 3 && (
                          <div className="text-muted-foreground italic">+{notesCount - 3} още</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Birthday icon with tooltip */}
              {hasBirthday && day.isCurrentMonth && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-0.5 right-0.5 print:bottom-0 print:right-0 cursor-help">
                        <Cake className="w-3 h-3 text-pink-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-xs space-y-0.5">
                        {dateBirthdays.map((b) => {
                          const age = calculateAge?.(b, day.date.getFullYear());
                          return (
                            <div key={b.id} className="flex items-center gap-1">
                              <Cake className="w-3 h-3 text-pink-500" />
                              <span>{b.name}</span>
                              {age !== null && <span className="text-muted-foreground">({age} г.)</span>}
                            </div>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Recurring events icon with tooltip */}
              {hasEvents && day.isCurrentMonth && !hasBirthday && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-0.5 right-0.5 print:bottom-0 print:right-0 cursor-help">
                        <Heart className="w-3 h-3 text-purple-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-xs space-y-0.5">
                        {dateEvents.map((e) => {
                          const years = calculateYears?.(e, day.date.getFullYear());
                          return (
                            <div key={e.id} className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-purple-500" />
                              <span>{e.name}</span>
                              {years !== null && <span className="text-muted-foreground">({years} г.)</span>}
                            </div>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <span
                className={cn(
                  "calendar-day-number",
                  day.isSaturday && "text-[hsl(var(--day-saturday))]",
                  day.isSunday && "text-[hsl(var(--day-sunday))]",
                  hasNonWorking && !day.isSaturday && !day.isSunday && !day.isToday && "text-[hsl(var(--holiday-nonworking))] font-semibold",
                  day.isToday && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                )}
              >
                {day.dayNumber}
              </span>

              {/* Multi-day custom event bars (united across all days) */}
              {(customEventSegments[index] ?? []).map((seg, sIdx) => {
                if (!seg) return <div key={sIdx} className="custom-event-bar invisible" />;
                const color = CUSTOM_EVENT_COLORS[seg.color] ?? CUSTOM_EVENT_COLORS.blue;
                return (
                  <div
                    key={seg.eventId}
                    className={cn(
                      'custom-event-bar',
                      color.bar,
                      seg.isStart ? 'rounded-l-sm' : 'rounded-l-none',
                      seg.isEnd ? 'rounded-r-sm' : 'rounded-r-none',
                    )}
                    title={`${seg.title}${seg.allDay ? '' : ` (${seg.startTime}–${seg.endTime})`}`}
                  >
                    {seg.isStart && (
                      <>
                        <CalendarRange className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{seg.title}{!seg.allDay && seg.startTime ? ` ${seg.startTime}` : ''}</span>
                      </>
                    )}
                  </div>
                );
              })}

              {filteredHolidays
                .filter(holiday => shouldShowHolidayBadge(holiday))
                .slice(0, 3)
                .map((holiday, hIndex) => {
                  const getHolidayIcon = () => {
                    switch (holiday.type) {
                      case 'national':
                        return <Flag className="w-2.5 h-2.5 flex-shrink-0" />;
                      case 'orthodox':
                        return <Cross className="w-2.5 h-2.5 flex-shrink-0" />;
                      case 'nameday':
                        return <Star className="w-2.5 h-2.5 flex-shrink-0" />;
                      case 'folk':
                        return <Flower2 className="w-2.5 h-2.5 flex-shrink-0" />;
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
                      title={translateHolidayName(holiday.name, i18n.language)}
                    >
                      {icon}
                      <span className="truncate">{translateHolidayName(holiday.name, i18n.language)}</span>
                    </div>
                  );
                })}
              
              {filteredHolidays.length > 3 && (
                <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  +{filteredHolidays.length - 3} {t('notes.more')}
                </div>
              )}

              {/* Birthday names in cell */}
              {day.isCurrentMonth && dateBirthdays.slice(0, 1).map((b) => {
                const age = calculateAge?.(b, day.date.getFullYear());
                return (
                  <div
                    key={b.id}
                    className="holiday-badge bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                  >
                    <Cake className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{b.name}{age !== null ? ` (${age})` : ''}</span>
                  </div>
                );
              })}

              {dateBirthdays.length > 1 && day.isCurrentMonth && (
                <div className="text-[10px] text-pink-500 mt-0.5 font-medium">
                  +{dateBirthdays.length - 1} 🎂
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
        birthdays={selectedDay ? getBirthdaysForDate(selectedDay.date.getMonth() + 1, selectedDay.date.getDate()) : []}
        recurringEvents={selectedDay ? getEventsForDate(selectedDay.date.getMonth() + 1, selectedDay.date.getDate()) : []}
        onAddNote={onAddNote}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
        onAddBirthday={onAddBirthday}
        onUpdateBirthday={onUpdateBirthday}
        onDeleteBirthday={onDeleteBirthday}
        calculateAge={calculateAge}
        onAddRecurringEvent={onAddRecurringEvent}
        onUpdateRecurringEvent={onUpdateRecurringEvent}
        onDeleteRecurringEvent={onDeleteRecurringEvent}
        calculateYears={calculateYears}
      />
    </div>
  );
}
