import { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllHolidays, BULGARIAN_MONTHS, Holiday } from '@/data/bulgarianHolidays';
import { translateHolidayName } from '@/data/holidayTranslations';
import { Calendar, Cross, Flag, Star, Leaf, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// English month names
const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface HolidaySidebarProps {
  year: number;
  month: number;
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
      return Flower2;
    case 'fasting':
      return Leaf;
    default:
      return Calendar;
  }
}

export function HolidaySidebar({ year, month }: HolidaySidebarProps) {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const getMonthName = (monthIndex: number) => {
    return isEnglish ? ENGLISH_MONTHS[monthIndex] : BULGARIAN_MONTHS[monthIndex];
  };

  const formatDayMonth = (dateString: string): string => {
    const [, monthStr, dayStr] = dateString.split('-');
    const day = parseInt(dayStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;
    return `${day} ${getMonthName(monthIdx)}`;
  };

  const monthHolidays = useMemo(() => {
    const allHolidays = getAllHolidays();
    const monthStr = String(month + 1).padStart(2, '0');
    const yearMonthPrefix = `${year}-${monthStr}`;
    
    return allHolidays
      .filter(h => h.date.startsWith(yearMonthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month]);

  const nextUpcomingDate = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const next = monthHolidays.find(h => h.date >= todayStr);
    return next?.date ?? null;
  }, [monthHolidays]);

  const highlightRef = useRef<HTMLLIElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const container = scrollContainerRef.current;
    const el = highlightRef.current;
    if (container && el) {
      container.scrollTo({ top: el.offsetTop - container.offsetTop, behavior: 'smooth' });
    }
  }, [nextUpcomingDate, year, month]);

  return (
    <aside className="bg-card border border-border rounded-xl p-4 sm:p-5 h-fit lg:sticky lg:top-8 lg:max-h-[min(calc(100vh-8rem),600px)] flex flex-col overflow-hidden">
      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2 bg-card">
        <Calendar className="w-5 h-5 text-primary" />
        {t('sidebar.upcomingHolidays')}
      </h2>
      <div ref={scrollContainerRef} className="overflow-y-auto flex-1 min-h-0 pt-8 pb-4 px-2">
      
      
      {monthHolidays.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t('sidebar.noUpcoming')}
        </p>
      ) : (
        <ul className="space-y-3">
          {(() => {
            let firstHighlighted = false;
            return monthHolidays.map((holiday, index) => {
              const Icon = getHolidayIcon(holiday.type);
              const isNextUpcoming = holiday.date === nextUpcomingDate;
              const assignRef = isNextUpcoming && !firstHighlighted;
              if (assignRef) firstHighlighted = true;
              return (
                <li
                  key={`${holiday.date}-${index}`}
                  ref={assignRef ? highlightRef : undefined}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    holiday.type === 'national' && "bg-[hsl(var(--holiday-national))]/10 border-[hsl(var(--holiday-national))]/30",
                    holiday.type === 'orthodox' && "bg-[hsl(var(--holiday-orthodox))]/10 border-[hsl(var(--holiday-orthodox))]/30",
                    holiday.type === 'nonworking' && "bg-[hsl(var(--holiday-nonworking))]/10 border-[hsl(var(--holiday-nonworking))]/30",
                    holiday.type === 'nameday' && "bg-[hsl(var(--holiday-nameday))]/10 border-[hsl(var(--holiday-nameday))]/30",
                    holiday.type === 'folk' && "bg-[hsl(var(--holiday-folk))]/10 border-[hsl(var(--holiday-folk))]/30",
                    holiday.type === 'fasting' && "bg-[hsl(var(--holiday-fasting))]/10 border-[hsl(var(--holiday-fasting))]/30",
                    isNextUpcoming && "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-md"
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
                      <p className={cn("text-xs text-muted-foreground flex items-center gap-2", isNextUpcoming && "text-primary font-semibold")}>
                        <span>{formatDayMonth(holiday.date)}</span>
                        {isNextUpcoming && (
                          <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] uppercase tracking-wide">
                            {isEnglish ? 'NEXT' : 'СЛЕДВАЩ'}
                          </span>
                        )}
                      </p>
                      <p className={cn("font-medium text-foreground text-sm leading-tight mt-0.5", isNextUpcoming && "font-semibold")}>
                        {translateHolidayName(holiday.name, i18n.language)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            });
          })()}
        </ul>
      )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t('holidays.all')}: <span className="font-medium text-foreground">{monthHolidays.length}</span>
        </p>
      </div>
    </aside>
  );
}
