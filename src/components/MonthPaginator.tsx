import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BULGARIAN_MONTHS, getMonthRange } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';

// English month names for translation
const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthPaginatorProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onGoToToday?: () => void;
  showTodayButton?: boolean;
}

export function MonthPaginator({ currentIndex, onIndexChange, onGoToToday, showTodayButton }: MonthPaginatorProps) {
  const { t, i18n } = useTranslation();
  const months = getMonthRange();
  const currentMonth = months[currentIndex];
  const isEnglish = i18n.language === 'en';

  const getMonthName = (monthIndex: number) => {
    return isEnglish ? ENGLISH_MONTHS[monthIndex] : BULGARIAN_MONTHS[monthIndex];
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < months.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Main navigation */}
      <div className="flex items-center justify-between print:justify-center">
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground print:text-black text-center">
            {getMonthName(currentMonth.month)} {currentMonth.year}
          </h2>

          {showTodayButton && onGoToToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToToday}
              className="gap-1.5 print:hidden bg-emerald-100 text-emerald-700 border-2 border-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-400 dark:hover:bg-emerald-900/60"
            >
              <CalendarCheck className="h-4 w-4" />
              {t('calendar.today')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === months.length - 1}
            className="h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Month pills */}
      <div className="flex flex-wrap gap-1.5 justify-center w-full print:hidden">
        {months.map((month, index) => (
          <button
            key={`${month.year}-${month.month}`}
            onClick={() => onIndexChange(index)}
            className={cn(
              "px-2 py-1 text-xs rounded-full transition-all duration-200",
              "hover:bg-secondary",
              index === currentIndex
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground"
            )}
          >
            {getMonthName(month.month).slice(0, 3)} {month.year.toString().slice(2)}
          </button>
        ))}
      </div>
    </div>
  );
}
