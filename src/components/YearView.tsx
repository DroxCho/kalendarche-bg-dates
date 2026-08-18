import { useMemo } from 'react';
import { BULGARIAN_MONTHS, BULGARIAN_DAYS, getHolidaysForDate, hasNonWorkingHoliday, Holiday } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';
import { Leaf, Flag, Cross } from 'lucide-react';

interface YearViewProps {
  year: number;
  onMonthClick: (month: number) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function MiniMonth({ year, month, onMonthClick }: { year: number; month: number; onMonthClick: () => void }) {
  const days = useMemo(() => {
    const result: { date: Date; dayNumber: number; isCurrentMonth: boolean; holidays: Holiday[] }[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month padding
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
        holidays: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        holidays: getHolidaysForDate(formatDateString(date)),
      });
    }

    // Next month padding
    const remainingDays = 42 - result.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextYear, nextMonth, day);
      result.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        holidays: [],
      });
    }

    return result;
  }, [year, month]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div 
      className="bg-card border border-border rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onMonthClick}
    >
      <h3 className="text-sm font-semibold text-center mb-1 text-foreground">
        {BULGARIAN_MONTHS[month]}
      </h3>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {BULGARIAN_DAYS.map((day, idx) => (
          <div
            key={day}
            className={cn(
              "text-[8px] text-center font-medium",
              idx === 5 && "text-[hsl(var(--day-saturday))]",
              idx === 6 && "text-[hsl(var(--day-sunday))]",
              idx < 5 && "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => {
          const isToday = day.date.getTime() === today.getTime() && day.isCurrentMonth;
          const dayOfWeek = day.date.getDay();
          const isSaturday = dayOfWeek === 6;
          const isSunday = dayOfWeek === 0;
          const hasNonWorking = day.isCurrentMonth && hasNonWorkingHoliday(formatDateString(day.date));
          const hasNational = day.holidays.some(h => h.type === 'national');
          const hasOrthodox = day.holidays.some(h => h.type === 'orthodox');
          const hasFolk = day.holidays.some(h => h.type === 'folk');
          const hasFasting = day.holidays.some(h => h.type === 'fasting');
          const hasNameday = day.holidays.some(h => h.type === 'nameday');

          return (
            <div
              key={index}
              className={cn(
                "relative w-full aspect-square flex items-center justify-center text-[9px]",
                !day.isCurrentMonth && "opacity-30",
                day.isCurrentMonth && isSaturday && "text-[hsl(var(--day-saturday))]",
                day.isCurrentMonth && isSunday && "text-[hsl(var(--day-sunday))]",
                hasNonWorking && !isSaturday && !isSunday && day.isCurrentMonth && !isToday && "calendar-day-nonworking",
                hasNonWorking && !isSaturday && !isSunday && !isToday && "text-[hsl(var(--holiday-nonworking))] font-bold",
                isToday && "bg-primary text-primary-foreground rounded-full font-bold",
                hasNational && day.isCurrentMonth && !isToday && "bg-[hsl(var(--holiday-national)/0.3)] rounded-sm",
                hasOrthodox && day.isCurrentMonth && !isToday && !hasNational && "bg-[hsl(var(--holiday-orthodox)/0.3)] rounded-sm"
              )}
              title={day.holidays.map(h => h.name).join(', ')}
            >
              {day.dayNumber}
              {/* Holiday indicators */}
              {day.isCurrentMonth && (hasFasting || hasFolk || hasNameday) && !isToday && (
                <div className="absolute -top-0.5 -right-0.5 flex gap-0">
                  {hasFasting && <div className="w-1 h-1 rounded-full bg-[hsl(var(--holiday-fasting))]" />}
                  {hasFolk && <div className="w-1 h-1 rounded-full bg-[hsl(var(--holiday-folk))]" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function YearView({ year, onMonthClick }: YearViewProps) {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }, (_, month) => (
          <MiniMonth
            key={month}
            year={year}
            month={month}
            onMonthClick={() => onMonthClick(month)}
          />
        ))}
      </div>
    </div>
  );
}
