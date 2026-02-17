import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { CalendarGrid } from './CalendarGrid';
import { MonthHolidayList } from './MonthHolidayList';
import { CalendarLegend } from './CalendarLegend';
import { YearView } from './YearView';
import { HolidayType } from './HolidayFilter';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { BULGARIAN_MONTHS } from '@/data/bulgarianHolidays';

interface PrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  activeFilters: HolidayType[];
  notes: Record<string, CalendarNote[]>;
  mode?: 'month' | 'year';
}

export function PrintPreview({ 
  open, 
  onOpenChange, 
  year, 
  month, 
  activeFilters,
  notes,
  mode = 'month'
}: PrintPreviewProps) {
  const handlePrint = () => {
    onOpenChange(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === 'year' ? "max-w-5xl max-h-[90vh] overflow-y-auto" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Преглед преди печат - {mode === 'year' ? `${year} година` : `${BULGARIAN_MONTHS[month]} ${year}`}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Печат
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="print-preview-container rounded-lg border border-border p-6"
          style={{
            backgroundColor: 'white',
            color: 'black',
          }}
        >
          <style>{`
            .print-preview-container {
              --background: 0 0% 100%;
              --foreground: 0 0% 0%;
              --card: 0 0% 100%;
              --card-foreground: 0 0% 0%;
              --border: 0 0% 70%;
              --muted-foreground: 0 0% 30%;
              --primary: 0 0% 10%;
              --primary-foreground: 0 0% 100%;
              --holiday-national: 348 80% 35%;
              --holiday-orthodox: 43 85% 40%;
              --holiday-nonworking: 0 75% 40%;
              --holiday-nameday: 280 65% 45%;
              --holiday-folk: 25 90% 45%;
              --holiday-fasting: 260 55% 40%;
              --day-today: 0 0% 0%;
              --day-saturday: 210 85% 40%;
              --day-saturday-bg: 210 30% 92%;
              --day-sunday: 0 75% 40%;
              --day-sunday-bg: 0 30% 92%;
            }
            .print-preview-container * {
              color: inherit;
            }
            .print-preview-container .calendar-day {
              min-height: 60px;
              border-color: rgba(0, 0, 0, 0.25) !important;
            }
            .print-preview-container .calendar-day-number {
              color: black !important;
              font-weight: 600 !important;
            }
            .print-preview-container .calendar-day-saturday .calendar-day-number {
              color: hsl(210, 85%, 35%) !important;
            }
            .print-preview-container .calendar-day-sunday .calendar-day-number {
              color: hsl(0, 75%, 35%) !important;
            }
            .print-preview-container .calendar-day-saturday,
            .print-preview-container .calendar-day-sunday {
              background-color: hsl(0, 0%, 95%) !important;
            }
            .print-preview-container .calendar-day-today {
              outline: none !important;
              box-shadow: none !important;
            }
            .print-preview-container .calendar-day-today .calendar-day-number {
              background: none !important;
              color: black !important;
              border-radius: 0 !important;
            }
            .print-preview-container .flex.items-center.gap-2:has(.border-primary) {
              display: none !important;
            }
            .print-preview-container .holiday-badge {
              font-weight: 500 !important;
            }
            .print-preview-container .holiday-national,
            .print-preview-container .holiday-orthodox,
            .print-preview-container .holiday-nameday,
            .print-preview-container .holiday-folk,
            .print-preview-container .holiday-fasting {
              color: white !important;
            }
            .print-preview-container .calendar-header {
              background: hsl(0, 0%, 95%) !important;
              color: black !important;
              font-weight: 700 !important;
            }
            .print-preview-container h2,
            .print-preview-container h3 {
              color: black !important;
            }
            .print-preview-container .bg-card {
              background: white !important;
              border-color: rgba(0, 0, 0, 0.2) !important;
            }
            .print-preview-container .border-border {
              border-color: rgba(0, 0, 0, 0.2) !important;
            }
            .print-preview-container .text-muted-foreground {
              color: hsl(0, 0%, 30%) !important;
            }
            .print-preview-container .text-foreground {
              color: black !important;
            }
          `}</style>
          
          {mode === 'month' ? (
            <>
              <CalendarGrid
                year={year}
                month={month}
                activeFilters={activeFilters}
                notes={notes}
                onAddNote={() => {}}
                onUpdateNote={() => {}}
                onDeleteNote={() => {}}
              />
              <MonthHolidayList year={year} month={month} activeFilters={activeFilters} />
              <div className="mt-6">
                <CalendarLegend printMode />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">{year}</h2>
              <YearView 
                year={year} 
                onMonthClick={() => {}}
              />
              <div className="mt-6">
                <CalendarLegend printMode />
              </div>
            </>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-2">
          Това е приблизителен преглед на как ще изглежда календарът при печат
        </p>
      </DialogContent>
    </Dialog>
  );
}