import { ChevronLeft, ChevronRight, CalendarCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BULGARIAN_MONTHS, getMonthRange } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';

interface MonthPaginatorProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onGoToToday?: () => void;
  showTodayButton?: boolean;
}

export function MonthPaginator({ currentIndex, onIndexChange, onGoToToday, showTodayButton }: MonthPaginatorProps) {
  const months = getMonthRange();
  const currentMonth = months[currentIndex];

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Main navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {showTodayButton && onGoToToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToToday}
              className="gap-1.5 print:hidden"
            >
              <CalendarCheck className="h-4 w-4" />
              Днес
            </Button>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          {BULGARIAN_MONTHS[currentMonth.month]} {currentMonth.year}
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 print:hidden"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Печат</span>
          </Button>
          
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
      <div className="flex flex-wrap gap-1.5 justify-center print:hidden">
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
            {BULGARIAN_MONTHS[month.month].slice(0, 3)} {month.year.toString().slice(2)}
          </button>
        ))}
      </div>
    </div>
  );
}
