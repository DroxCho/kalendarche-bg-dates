import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, Church, Flag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllHolidays, BULGARIAN_MONTHS, Holiday } from '@/data/bulgarianHolidays';
import { translateHolidayName } from '@/data/holidayTranslations';
import { cn } from '@/lib/utils';

// English month names
const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface HolidaySearchProps {
  onNavigateToMonth: (year: number, month: number) => void;
}

function getHolidayIcon(type: Holiday['type']) {
  switch (type) {
    case 'national':
      return Flag;
    case 'orthodox':
      return Church;
    default:
      return Calendar;
  }
}

export function HolidaySearch({ onNavigateToMonth }: HolidaySearchProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const allHolidays = useMemo(() => getAllHolidays(), []);
  const isEnglish = i18n.language === 'en';

  const getMonthName = (monthIndex: number) => {
    return isEnglish ? ENGLISH_MONTHS[monthIndex] : BULGARIAN_MONTHS[monthIndex];
  };

  const formatFullDate = (dateString: string): string => {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);
    return `${day} ${getMonthName(month)} ${year}`;
  };

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // Normalize query: replace dots/slashes with dashes for date matching
    const normalizedQuery = query.trim().replace(/[.\/]/g, '-');
    
    // Try to parse as date in formats: DD-MM-YYYY, DD-MM, DD
    const dateParts = normalizedQuery.split('-').map(p => parseInt(p, 10));
    const hasDateQuery = dateParts.length >= 1 && !isNaN(dateParts[0]);
    
    return allHolidays
      .filter(h => {
        const translatedName = translateHolidayName(h.name, i18n.language);
        const nameMatch = h.name.toLowerCase().includes(lowerQuery) || translatedName.toLowerCase().includes(lowerQuery);
        
        if (nameMatch) return true;
        
        // Date matching
        if (hasDateQuery) {
          const [yearStr, monthStr, dayStr] = h.date.split('-');
          const hDay = parseInt(dayStr, 10);
          const hMonth = parseInt(monthStr, 10);
          const hYear = parseInt(yearStr, 10);
          
          if (dateParts.length === 1) {
            // Match day
            return hDay === dateParts[0];
          } else if (dateParts.length === 2) {
            // DD-MM
            return hDay === dateParts[0] && hMonth === dateParts[1];
          } else if (dateParts.length >= 3) {
            // DD-MM-YYYY
            return hDay === dateParts[0] && hMonth === dateParts[1] && hYear === dateParts[2];
          }
        }
        
        return false;
      })
      .slice(0, 10);
  }, [query, allHolidays, i18n.language]);

  const handleResultClick = (holiday: Holiday) => {
    const [yearStr, monthStr] = holiday.date.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    onNavigateToMonth(year, month);
    setQuery('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-8 py-1 text-xs"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <ul className="max-h-80 overflow-y-auto">
            {searchResults.map((holiday, index) => {
              const Icon = getHolidayIcon(holiday.type);
              return (
                <li key={`${holiday.date}-${index}`}>
                  <button
                    onClick={() => handleResultClick(holiday)}
                    className={cn(
                      "w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-b-0"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        holiday.type === 'national' && "text-holiday-national",
                        holiday.type === 'orthodox' && "text-holiday-orthodox",
                        holiday.type === 'nonworking' && "text-holiday-nonworking"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {translateHolidayName(holiday.name, i18n.language)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatFullDate(holiday.date)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {query.trim().length >= 2 && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          {t('search.noResults')}
        </div>
      )}
    </div>
  );
}
