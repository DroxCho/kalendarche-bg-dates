import { useTranslation } from 'react-i18next';
import { Holiday } from '@/data/bulgarianHolidays';
import { Flag, Cross, Star, Leaf, Calendar, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HolidayType = Holiday['type'];

interface HolidayFilterProps {
  activeFilters: HolidayType[];
  onFilterChange: (filters: HolidayType[]) => void;
}

export function HolidayFilter({ activeFilters, onFilterChange }: HolidayFilterProps) {
  const { t } = useTranslation();

  const filterOptions: { type: HolidayType; labelKey: string; icon: React.ReactNode }[] = [
    { type: 'national', labelKey: 'holidays.national', icon: <Flag className="w-3 h-3" /> },
    { type: 'orthodox', labelKey: 'holidays.orthodox', icon: <Cross className="w-3 h-3" /> },
    { type: 'nameday', labelKey: 'holidays.nameday', icon: <Star className="w-3 h-3" /> },
    { type: 'folk', labelKey: 'holidays.folk', icon: <Flower2 className="w-3 h-3" /> },
    { type: 'fasting', labelKey: 'holidays.fasting', icon: <Leaf className="w-3 h-3" /> },
  ];

  const toggleFilter = (type: HolidayType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter(f => f !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  const allActive = activeFilters.length === filterOptions.length;

  const toggleAll = () => {
    if (allActive) {
      onFilterChange([]);
    } else {
      onFilterChange(filterOptions.map(f => f.type));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <span className="text-sm text-muted-foreground mr-1">{t('holidays.filter')}</span>
      <button
        onClick={toggleAll}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-all duration-200 border",
          allActive
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted text-muted-foreground border-border hover:bg-secondary"
        )}
      >
        <Calendar className="w-3 h-3" />
        {t('holidays.all')}
      </button>
      {filterOptions.map(({ type, labelKey, icon }) => (
        <button
          key={type}
          onClick={() => toggleFilter(type)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-all duration-200 border",
            activeFilters.includes(type)
              ? `bg-[hsl(var(--holiday-${type}))] text-primary-foreground border-[hsl(var(--holiday-${type}))]`
              : "bg-muted text-muted-foreground border-border hover:bg-secondary"
          )}
        >
          {icon}
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
