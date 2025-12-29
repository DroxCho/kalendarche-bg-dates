import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BULGARIAN_MONTHS, getMonthRange } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';

interface MonthPaginatorProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function MonthPaginator({ currentIndex, onIndexChange }: MonthPaginatorProps) {
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

  return (
    <div className="space-y-4">
      {/* Main navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          {BULGARIAN_MONTHS[currentMonth.month]} {currentMonth.year}
        </h2>

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

      {/* Month pills */}
      <div className="flex flex-wrap gap-1.5 justify-center">
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
