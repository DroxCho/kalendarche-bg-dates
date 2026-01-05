import { ChevronLeft, ChevronRight, CalendarCheck, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BULGARIAN_MONTHS, getMonthRange, getAllHolidays } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';
import { generateICSForMonth } from '@/lib/icsExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateICSFile, generateICSForYear } from '@/lib/icsExport';

interface MonthPaginatorProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onGoToToday?: () => void;
  showTodayButton?: boolean;
  onPrintAll?: () => void;
}

export function MonthPaginator({ currentIndex, onIndexChange, onGoToToday, showTodayButton, onPrintAll }: MonthPaginatorProps) {
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

  const handlePrintMonth = () => {
    window.print();
  };

  const handlePrintAll = () => {
    if (onPrintAll) {
      onPrintAll();
    }
  };

  const handleExportMonth = () => {
    const holidays = getAllHolidays();
    generateICSForMonth(holidays, currentMonth.year, currentMonth.month);
  };

  const handleExportYear = () => {
    const holidays = getAllHolidays();
    generateICSForYear(holidays, currentMonth.year);
  };

  const handleExportAll = () => {
    const holidays = getAllHolidays();
    generateICSFile(holidays, 'bulgarian-calendar-all');
  };

  return (
    <div className="space-y-4">
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
          
          {showTodayButton && onGoToToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToToday}
              className="gap-1.5"
            >
              <CalendarCheck className="h-4 w-4" />
              Днес
            </Button>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground print:text-black">
          {BULGARIAN_MONTHS[currentMonth.month]} {currentMonth.year}
        </h2>

        <div className="flex items-center gap-2 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Експорт</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportMonth}>
                Експорт на месец (.ics)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportYear}>
                Експорт на година (.ics)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAll}>
                Експорт на всичко (.ics)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Печат</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrintMonth}>
                Печат на месец
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintAll}>
                Печат на цял календар
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
