import { useMemo } from 'react';
import { BULGARIAN_DAYS, getHolidaysForDate, isWeekend, Holiday } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
}

interface DayInfo {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
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

export function CalendarGrid({ year, month }: CalendarGridProps) {
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
      result.push({
        date,
        dayNumber,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isWeekend: isWeekend(date),
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isWeekend: isWeekend(date),
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - result.length; // 6 rows * 7 days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextYear, nextMonth, day);
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isWeekend: isWeekend(date),
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    return result;
  }, [year, month]);

  return (
    <div className="animate-fade-in">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {BULGARIAN_DAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center py-2 text-sm font-semibold",
              index >= 5 ? "text-primary" : "text-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              "calendar-day",
              !day.isCurrentMonth && "opacity-40",
              day.isWeekend && day.isCurrentMonth && "calendar-day-weekend",
              day.isToday && "calendar-day-today"
            )}
          >
            <span
              className={cn(
                "calendar-day-number",
                day.isWeekend && "text-primary",
                day.isToday && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
              )}
            >
              {day.dayNumber}
            </span>
            
            {day.holidays.slice(0, 2).map((holiday, hIndex) => (
              <div
                key={hIndex}
                className={cn(
                  "holiday-badge",
                  holiday.type === 'national' && "holiday-national",
                  holiday.type === 'orthodox' && "holiday-orthodox",
                  holiday.type === 'nonworking' && "holiday-nonworking"
                )}
                title={holiday.name}
              >
                {holiday.name}
              </div>
            ))}
            
            {day.holidays.length > 2 && (
              <div className="text-[10px] text-muted-foreground mt-0.5">
                +{day.holidays.length - 2}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
