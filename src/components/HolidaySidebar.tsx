import { useMemo } from 'react';
import { getAllHolidays, BULGARIAN_MONTHS, Holiday } from '@/data/bulgarianHolidays';
import { Calendar, Cross, Flag, Star, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HolidaySidebarProps {
  year: number;
  month: number;
}

function formatDayMonth(dateString: string): string {
  const [, monthStr, dayStr] = dateString.split('-');
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  return `${day} ${BULGARIAN_MONTHS[month]}`;
}

function getHolidayIcon(type: Holiday['type']) {
  switch (type) {
    case 'national':
      return Flag;
    case 'orthodox':
      return Cross;
    case 'nameday':
      return Star;
    case 'folk':
      return Flag;
    case 'fasting':
      return Leaf;
    default:
      return Calendar;
  }
}

function getHolidayColorClass(type: Holiday['type'], variant: 'bg' | 'border' | 'text') {
  const colorMap: Record<Holiday['type'], string> = {
    national: 'holiday-national',
    orthodox: 'holiday-orthodox',
    nonworking: 'holiday-nonworking',
    nameday: 'holiday-nameday',
    folk: 'holiday-folk',
    fasting: 'holiday-fasting',
  };
  
  const base = colorMap[type];
  if (variant === 'bg') return `bg-[hsl(var(--${base}))]/10`;
  if (variant === 'border') return `border-[hsl(var(--${base}))]/30`;
  return `text-[hsl(var(--${base}))]`;
}

export function HolidaySidebar({ year, month }: HolidaySidebarProps) {
  const monthHolidays = useMemo(() => {
    const allHolidays = getAllHolidays();
    const monthStr = String(month + 1).padStart(2, '0');
    const yearMonthPrefix = `${year}-${monthStr}`;
    
    return allHolidays
      .filter(h => h.date.startsWith(yearMonthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month]);

  return (
    <aside className="bg-card border border-border rounded-xl p-5 h-fit sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Празници през {BULGARIAN_MONTHS[month]}
      </h2>
      
      {monthHolidays.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Няма празници този месец.
        </p>
      ) : (
        <ul className="space-y-3">
          {monthHolidays.map((holiday, index) => {
            const Icon = getHolidayIcon(holiday.type);
            return (
              <li
                key={`${holiday.date}-${index}`}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  holiday.type === 'national' && "bg-[hsl(var(--holiday-national))]/10 border-[hsl(var(--holiday-national))]/30",
                  holiday.type === 'orthodox' && "bg-[hsl(var(--holiday-orthodox))]/10 border-[hsl(var(--holiday-orthodox))]/30",
                  holiday.type === 'nonworking' && "bg-[hsl(var(--holiday-nonworking))]/10 border-[hsl(var(--holiday-nonworking))]/30",
                  holiday.type === 'nameday' && "bg-[hsl(var(--holiday-nameday))]/10 border-[hsl(var(--holiday-nameday))]/30",
                  holiday.type === 'folk' && "bg-[hsl(var(--holiday-folk))]/10 border-[hsl(var(--holiday-folk))]/30",
                  holiday.type === 'fasting' && "bg-[hsl(var(--holiday-fasting))]/10 border-[hsl(var(--holiday-fasting))]/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      holiday.type === 'national' && "text-[hsl(var(--holiday-national))]",
                      holiday.type === 'orthodox' && "text-[hsl(var(--holiday-orthodox))]",
                      holiday.type === 'nonworking' && "text-[hsl(var(--holiday-nonworking))]",
                      holiday.type === 'nameday' && "text-[hsl(var(--holiday-nameday))]",
                      holiday.type === 'folk' && "text-[hsl(var(--holiday-folk))]",
                      holiday.type === 'fasting' && "text-[hsl(var(--holiday-fasting))]"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm leading-tight">
                      {holiday.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDayMonth(holiday.date)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Общо: <span className="font-medium text-foreground">{monthHolidays.length}</span> празника
        </p>
      </div>
    </aside>
  );
}
