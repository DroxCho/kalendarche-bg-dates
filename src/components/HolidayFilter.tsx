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
    <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
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
      {filterOptions.map(({ type, labelKey, icon }) => {
        const isActive = activeFilters.includes(type);
        const activeClasses: Partial<Record<HolidayType, string>> = {
          national: "bg-[hsl(var(--holiday-national))] text-white border-[hsl(var(--holiday-national))]",
          orthodox: "bg-[hsl(var(--holiday-orthodox))] text-white border-[hsl(var(--holiday-orthodox))]",
          nameday: "bg-[hsl(var(--holiday-nameday))] text-white border-[hsl(var(--holiday-nameday))]",
          folk: "bg-[hsl(var(--holiday-folk))] text-white border-[hsl(var(--holiday-folk))]",
          fasting: "bg-[hsl(var(--holiday-fasting))] text-white border-[hsl(var(--holiday-fasting))]",
        };
        return (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-all duration-200 border",
              isActive
                ? activeClasses[type]
                : "bg-muted text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
            )}
          >
            {icon}
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
