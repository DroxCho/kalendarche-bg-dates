import { useTranslation } from 'react-i18next';
import { Download, Printer, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllHolidays } from '@/data/bulgarianHolidays';
import { generateICSForMonth, generateICSFile, generateICSForYear } from '@/lib/icsExport';
import { exportMonthToPDF, exportYearToPDF, exportAllToPDF } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ExportPrintButtonsProps {
  year: number;
  month: number;
  activeFilters: string[];
  onPrintAll?: () => void;
  onPrintPreview?: (mode: 'month' | 'year') => void;
}

export function ExportPrintButtons({ year, month, activeFilters, onPrintAll, onPrintPreview }: ExportPrintButtonsProps) {
  const { t } = useTranslation();

  const handleExportMonth = () => {
    const holidays = getAllHolidays();
    generateICSForMonth(holidays, year, month);
  };

  const handleExportYear = () => {
    const holidays = getAllHolidays();
    generateICSForYear(holidays, year);
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
      await exportMonthToPDF({ year, month, activeFilters });
      dismiss();
      toast({ title: t('calendar.pdfReady'), description: t('calendar.pdfSuccess') });
    } catch {
      dismiss();
      toast({ title: t('common.error'), description: t('calendar.pdfError'), variant: "destructive" });
    }
  };

  const handleExportYearPDF = async () => {
    const { dismiss } = toast({
      title: t('calendar.generatingPDF'),
      description: t('calendar.creatingYear'),
    });
    try {
      await exportYearToPDF(year, activeFilters);
      dismiss();
      toast({ title: t('calendar.pdfReady'), description: t('calendar.pdfSuccess') });
    } catch {
      dismiss();
      toast({ title: t('common.error'), description: t('calendar.pdfError'), variant: "destructive" });
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
      toast({ title: t('calendar.pdfReady'), description: t('calendar.pdfSuccess') });
    } catch {
      dismiss();
      toast({ title: t('common.error'), description: t('calendar.pdfError'), variant: "destructive" });
    }
  };

  const handlePrintMonth = () => window.print();
  const handlePrintAll = () => onPrintAll?.();

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('calendar.export')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportMonth}>{t('calendar.exportMonth')}</DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportYear}>{t('calendar.exportYear')}</DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportAll}>{t('calendar.exportAll')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportMonthPDF}>
            <FileText className="h-4 w-4 mr-2" />{t('calendar.exportMonthPDF')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportYearPDF}>
            <FileText className="h-4 w-4 mr-2" />{t('calendar.exportYearPDF')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportAllPDF}>
            <FileText className="h-4 w-4 mr-2" />{t('calendar.exportAllPDF')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('calendar.print')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onPrintPreview && (
            <>
              <DropdownMenuItem onClick={() => onPrintPreview('month')}>
                <Eye className="h-4 w-4 mr-2" />{t('calendar.previewMonth')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrintPreview('year')}>
                <Eye className="h-4 w-4 mr-2" />{t('calendar.previewYear')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handlePrintMonth}>{t('calendar.printMonth')}</DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrintAll}>{t('calendar.printAll')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
