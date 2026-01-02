import { Holiday } from '@/data/bulgarianHolidays';
import { Flag, Cross, Star, Leaf, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HolidayType = Holiday['type'];

interface HolidayFilterProps {
  activeFilters: HolidayType[];
  onFilterChange: (filters: HolidayType[]) => void;
}

const filterOptions: { type: HolidayType; label: string; icon: React.ReactNode }[] = [
  { type: 'national', label: 'Национален', icon: <Flag className="w-3 h-3" /> },
  { type: 'orthodox', label: 'Православен', icon: <Cross className="w-3 h-3" /> },
  { type: 'nameday', label: 'Имен ден', icon: <Star className="w-3 h-3" /> },
  { type: 'folk', label: 'Народен', icon: <Flag className="w-3 h-3" /> },
  { type: 'fasting', label: 'Постен', icon: <Leaf className="w-3 h-3" /> },
];

export function HolidayFilter({ activeFilters, onFilterChange }: HolidayFilterProps) {
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
      <span className="text-sm text-muted-foreground mr-1">Филтър:</span>
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
        Всички
      </button>
      {filterOptions.map(({ type, label, icon }) => (
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
          {label}
        </button>
      ))}
    </div>
  );
}
