import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllHolidays, BULGARIAN_MONTHS, Holiday } from '@/data/bulgarianHolidays';
import { translateHolidayName } from '@/data/holidayTranslations';
import { Flag, Cross, Star, Leaf, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HolidayType } from './HolidayFilter';

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getHolidayIcon(type: Holiday['type']) {
  switch (type) {
    case 'national': return Flag;
    case 'orthodox': return Cross;
    case 'nameday': return Star;
    case 'folk': return Flower2;
    case 'fasting': return Leaf;
    default: return Flag;
  }
}

interface MonthHolidayListProps {
  year: number;
  month: number;
  activeFilters: HolidayType[];
}

export function MonthHolidayList({ year, month, activeFilters }: MonthHolidayListProps) {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const holidays = useMemo(() => {
    const all = getAllHolidays();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return all
      .filter(h => h.date.startsWith(prefix) && activeFilters.includes(h.type))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month, activeFilters]);

  if (holidays.length === 0) return null;

  const formatDay = (dateStr: string) => {
    const day = parseInt(dateStr.split('-')[2], 10);
    return day;
  };

  return (
    <div className="mt-4 text-[11px] print:text-[6.5pt] leading-tight print:leading-snug">
      <h4 className="font-bold text-xs print:text-[8pt] mb-1.5" style={{ color: 'black' }}>
        {isEnglish ? 'Holidays' : 'Празници'} – {isEnglish ? ENGLISH_MONTHS[month] : BULGARIAN_MONTHS[month]}
      </h4>
      <div className="grid grid-cols-2 print:grid-cols-3 gap-x-4 gap-y-0.5 print:gap-y-1">
        {holidays.map((h, i) => {
          const Icon = getHolidayIcon(h.type);
          return (
            <div key={`${h.date}-${i}`} className="flex items-center gap-1 min-w-0">
              <Icon
                className={cn(
                  "w-2.5 h-2.5 shrink-0",
                  h.type === 'national' && "text-[hsl(var(--holiday-national))]",
                  h.type === 'orthodox' && "text-[hsl(var(--holiday-orthodox))]",
                  h.type === 'nameday' && "text-[hsl(var(--holiday-nameday))]",
                  h.type === 'folk' && "text-[hsl(var(--holiday-folk))]",
                  h.type === 'fasting' && "text-[hsl(var(--holiday-fasting))]"
                )}
              />
              <span className="text-muted-foreground">{formatDay(h.date)}.</span>
              <span className="truncate">{translateHolidayName(h.name, i18n.language)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
