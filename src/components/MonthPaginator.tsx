import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarCheck, Printer, Download, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BULGARIAN_MONTHS, getMonthRange, getAllHolidays } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';
import { generateICSForMonth } from '@/lib/icsExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { generateICSFile, generateICSForYear } from '@/lib/icsExport';
import { exportMonthToPDF, exportYearToPDF, exportAllToPDF } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';

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
  onPrintAll?: () => void;
  onPrintPreview?: (mode: 'month' | 'year') => void;
  activeFilters?: string[];
}

export function MonthPaginator({ currentIndex, onIndexChange, onGoToToday, showTodayButton, onPrintAll, onPrintPreview, activeFilters = [] }: MonthPaginatorProps) {
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

  const handleExportMonthPDF = async () => {
    const { dismiss } = toast({
      title: t('calendar.generatingPDF'),
      description: t('calendar.pleaseWait'),
    });
    try {
      await exportMonthToPDF({ year: currentMonth.year, month: currentMonth.month, activeFilters });
      dismiss();
      toast({
        title: t('calendar.pdfReady'),
        description: t('calendar.pdfSuccess'),
      });
    } catch (error) {
      dismiss();
      toast({
        title: t('common.error'),
        description: t('calendar.pdfError'),
        variant: "destructive",
      });
    }
  };

  const handleExportYearPDF = async () => {
    const { dismiss } = toast({
      title: t('calendar.generatingPDF'),
      description: t('calendar.creatingYear'),
    });
    try {
      await exportYearToPDF(currentMonth.year, activeFilters);
      dismiss();
      toast({
        title: t('calendar.pdfReady'),
        description: t('calendar.pdfSuccess'),
      });
    } catch (error) {
      dismiss();
      toast({
        title: t('common.error'),
        description: t('calendar.pdfError'),
        variant: "destructive",
      });
    }
  };

  const handleExportAllPDF = async () => {
    const { dismiss } = toast({
      title: t('calendar.generatingPDF'),
      description: t('calendar.creatingAll'),
    });
    try {
      await exportAllToPDF(activeFilters);
      dismiss();
      toast({
        title: t('calendar.pdfReady'),
        description: t('calendar.pdfSuccess'),
      });
    } catch (error) {
      dismiss();
      toast({
        title: t('common.error'),
        description: t('calendar.pdfError'),
        variant: "destructive",
      });
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
          
          {showTodayButton && onGoToToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToToday}
              className="gap-1.5"
            >
              <CalendarCheck className="h-4 w-4" />
              {t('calendar.today')}
            </Button>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground print:text-black">
          {getMonthName(currentMonth.month)} {currentMonth.year}
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
                <span className="hidden sm:inline">{t('calendar.export')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportMonth}>
                {t('calendar.exportMonth')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportYear}>
                {t('calendar.exportYear')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAll}>
                {t('calendar.exportAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportMonthPDF}>
                <FileText className="h-4 w-4 mr-2" />
                {t('calendar.exportMonthPDF')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportYearPDF}>
                <FileText className="h-4 w-4 mr-2" />
                {t('calendar.exportYearPDF')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAllPDF}>
                <FileText className="h-4 w-4 mr-2" />
                {t('calendar.exportAllPDF')}
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
                <span className="hidden sm:inline">{t('calendar.print')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPrintPreview && (
                <>
                  <DropdownMenuItem onClick={() => onPrintPreview('month')}>
                    <Eye className="h-4 w-4 mr-2" />
                    {t('calendar.previewMonth')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPrintPreview('year')}>
                    <Eye className="h-4 w-4 mr-2" />
                    {t('calendar.previewYear')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handlePrintMonth}>
                {t('calendar.printMonth')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintAll}>
                {t('calendar.printAll')}
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
