import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Grid3X3, CalendarRange, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarGrid } from './CalendarGrid';
import { MonthPaginator } from './MonthPaginator';
import { CalendarLegend } from './CalendarLegend';
import { HolidaySidebar } from './HolidaySidebar';
import { HolidaySearch } from './HolidaySearch';
import { HolidayFilter, HolidayType } from './HolidayFilter';
import { YearView } from './YearView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { PrintAllCalendar } from './PrintAllCalendar';
import { getMonthRange, getHolidaysForDate } from '@/data/bulgarianHolidays';
import { useCalendarNotes, ImportResult as NotesImportResult } from '@/hooks/useCalendarNotes';
import { useBirthdays, ImportResult as BirthdaysImportResult } from '@/hooks/useBirthdays';
import { useRecurringEvents, ImportResult as EventsImportResult } from '@/hooks/useRecurringEvents';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { parseUrlDate } from '@/lib/sharing';
import { HolidayModal } from './HolidayModal';
import { ExportPrintButtons } from './ExportPrintButtons';
import { PrintPreview } from './PrintPreview';

const ALL_HOLIDAY_TYPES: HolidayType[] = ['national', 'orthodox', 'nameday', 'folk', 'fasting'];

export type CalendarViewMode = 'day' | 'week' | 'month' | 'year';

interface BulgarianCalendarProps {
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
}


export function BulgarianCalendar({ viewMode, setViewMode }: BulgarianCalendarProps) {
  const months = useMemo(() => getMonthRange(), []);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const now = new Date();
    const idx = months.findIndex(m => m.year === now.getFullYear() && m.month === now.getMonth());
    return idx >= 0 ? idx : 0;
  });
  const [activeFilters, setActiveFilters] = useState<HolidayType[]>(ALL_HOLIDAY_TYPES);
  const [focusDate, setFocusDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [printAll, setPrintAll] = useState(false);
  const [sharedDate, setSharedDate] = useState<Date | null>(null);
  const [sharedModalOpen, setSharedModalOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printPreviewMode, setPrintPreviewMode] = useState<'month' | 'year'>('month');
  const { toast } = useToast();
  
  const handleNotesImport = useCallback((result: NotesImportResult) => {
    toast({
      title: 'Бележки импортирани',
      description: `${result.count} бележки бяха синхронизирани с вашия профил.`
    });
  }, [toast]);
  
  const handleBirthdaysImport = useCallback((result: BirthdaysImportResult) => {
    toast({
      title: 'Рождени дни импортирани',
      description: `${result.count} рождени дни бяха синхронизирани с вашия профил.`
    });
  }, [toast]);

  const handleEventsImport = useCallback((result: EventsImportResult) => {
    toast({
      title: 'Събития импортирани',
      description: `${result.count} годишнини бяха синхронизирани с вашия профил.`
    });
  }, [toast]);
  
  const { notes, addNote, updateNote, removeNote, moveNote } = useCalendarNotes(handleNotesImport);
  const { birthdays, addBirthday, updateBirthday, removeBirthday, getBirthdaysForDateString, calculateAge } = useBirthdays(handleBirthdaysImport);
  const { events: recurringEvents, addEvent, updateEvent, removeEvent, getEventsForDate, calculateYears } = useRecurringEvents(handleEventsImport);
  const { user } = useAuth();
  
  
  const currentMonth = months[currentIndex];

  // Handle shared URL on mount
  useEffect(() => {
    const dateStr = parseUrlDate();
    if (dateStr) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Navigate to the month
      const index = months.findIndex(m => m.year === year && m.month === month - 1);
      if (index !== -1) {
        setCurrentIndex(index);
      }
      
      // Open modal for that date
      setSharedDate(date);
      setSharedModalOpen(true);
      
      // Clean URL without refreshing page
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [months]);

  const handleNavigateToMonth = useCallback((year: number, month: number) => {
    const index = months.findIndex(m => m.year === year && m.month === month);
    if (index !== -1) {
      setCurrentIndex(index);
      setViewMode('month');
    }
  }, [months]);

  // Find current month index for "Today" button
  const todayMonthIndex = useMemo(() => {
    const today = new Date();
    return months.findIndex(m => m.year === today.getFullYear() && m.month === today.getMonth());
  }, [months]);

  const isViewingCurrentMonth = currentIndex === todayMonthIndex;

  const handleGoToToday = useCallback(() => {
    if (todayMonthIndex !== -1) {
      setCurrentIndex(todayMonthIndex);
      setViewMode('month');
    }
  }, [todayMonthIndex]);

  const handleYearMonthClick = useCallback((month: number) => {
    const index = months.findIndex(m => m.year === currentMonth.year && m.month === month);
    if (index !== -1) {
      setCurrentIndex(index);
      setViewMode('month');
    }
  }, [months, currentMonth.year]);

  const handlePrintAll = useCallback(() => {
    setPrintAll(true);
  }, []);

  const handlePrintPreview = useCallback((mode: 'month' | 'year') => {
    setPrintPreviewMode(mode);
    setPrintPreviewOpen(true);
  }, []);

  // Trigger print when printAll is set, then reset
  useEffect(() => {
    if (printAll) {
      // Small delay to ensure DOM updates
      const timeout = setTimeout(() => {
        window.print();
        setPrintAll(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [printAll]);

  const portalTarget = document.getElementById('export-print-portal');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {portalTarget && createPortal(
        <ExportPrintButtons
          year={currentMonth.year}
          month={currentMonth.month}
          activeFilters={activeFilters}
          onPrintAll={handlePrintAll}
          onPrintPreview={handlePrintPreview}
        />,
        portalTarget
      )}
      <div className="print:hidden">
        <HolidaySearch onNavigateToMonth={handleNavigateToMonth} />
      </div>
      
      {(viewMode === 'month' || viewMode === 'year') && (
        <div className={`${printAll ? 'print:hidden' : ''}`}>
          <MonthPaginator
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            onGoToToday={handleGoToToday}
            showTodayButton={(!isViewingCurrentMonth || viewMode === 'year') && todayMonthIndex !== -1}
          />
        </div>
      )}

      <HolidayFilter
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />

      {/* Print all calendar - only visible when printing all */}
      {printAll && (
        <PrintAllCalendar activeFilters={activeFilters} notes={notes} />
      )}

      {/* Regular view - hidden when printing all */}
      <div className={printAll ? 'print:hidden' : ''}>
        {viewMode === 'month' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <CalendarGrid
                year={currentMonth.year}
                month={currentMonth.month}
                activeFilters={activeFilters}
                notes={notes}
                birthdays={birthdays}
                recurringEvents={recurringEvents}
                onAddNote={addNote}
                onUpdateNote={updateNote}
                onDeleteNote={removeNote}
                onMoveNote={moveNote}
                onAddBirthday={addBirthday}
                onUpdateBirthday={updateBirthday}
                onDeleteBirthday={removeBirthday}
                calculateAge={calculateAge}
                onAddRecurringEvent={addEvent}
                onUpdateRecurringEvent={updateEvent}
                onDeleteRecurringEvent={removeEvent}
                calculateYears={calculateYears}
              />
              <div className="mt-6 hidden print:block">
                <CalendarLegend />
              </div>
            </div>

            <div className="lg:w-72 shrink-0 print:hidden">
              <HolidaySidebar
                year={currentMonth.year}
                month={currentMonth.month}
              />
            </div>
          </div>
        )}

        {viewMode === 'year' && (
          <div>
            <YearView
              year={currentMonth.year}
              onMonthClick={handleYearMonthClick}
            />
            <div className="mt-6 hidden print:block">
              <CalendarLegend />
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <WeekView
            focusDate={focusDate}
            onDateChange={setFocusDate}
            activeFilters={activeFilters}
            notes={notes}
            birthdays={birthdays}
            recurringEvents={recurringEvents}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={removeNote}
            onAddBirthday={addBirthday}
            onUpdateBirthday={updateBirthday}
            onDeleteBirthday={removeBirthday}
            calculateAge={calculateAge}
            onAddRecurringEvent={addEvent}
            onUpdateRecurringEvent={updateEvent}
            onDeleteRecurringEvent={removeEvent}
            calculateYears={calculateYears}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            focusDate={focusDate}
            onDateChange={setFocusDate}
            activeFilters={activeFilters}
            notes={notes}
            birthdays={birthdays}
            recurringEvents={recurringEvents}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={removeNote}
            onAddBirthday={addBirthday}
            onUpdateBirthday={updateBirthday}
            onDeleteBirthday={removeBirthday}
            calculateAge={calculateAge}
            onAddRecurringEvent={addEvent}
            onUpdateRecurringEvent={updateEvent}
            onDeleteRecurringEvent={removeEvent}
            calculateYears={calculateYears}
          />
        )}
      </div>


      {/* Shared date modal */}
      <HolidayModal
        open={sharedModalOpen}
        onOpenChange={setSharedModalOpen}
        date={sharedDate}
        holidays={sharedDate ? getHolidaysForDate(
          `${sharedDate.getFullYear()}-${String(sharedDate.getMonth() + 1).padStart(2, '0')}-${String(sharedDate.getDate()).padStart(2, '0')}`
        ) : []}
        notes={sharedDate ? notes[`${sharedDate.getFullYear()}-${String(sharedDate.getMonth() + 1).padStart(2, '0')}-${String(sharedDate.getDate()).padStart(2, '0')}`] || [] : []}
        birthdays={sharedDate ? getBirthdaysForDateString(`${sharedDate.getFullYear()}-${String(sharedDate.getMonth() + 1).padStart(2, '0')}-${String(sharedDate.getDate()).padStart(2, '0')}`) : []}
        recurringEvents={sharedDate ? getEventsForDate(sharedDate.getMonth() + 1, sharedDate.getDate()) : []}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onDeleteNote={removeNote}
        onAddBirthday={addBirthday}
        onUpdateBirthday={updateBirthday}
        onDeleteBirthday={removeBirthday}
        calculateAge={calculateAge}
        onAddRecurringEvent={addEvent}
        onUpdateRecurringEvent={updateEvent}
        onDeleteRecurringEvent={removeEvent}
        calculateYears={calculateYears}
      />

      {/* Print preview modal */}
      <PrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        year={currentMonth.year}
        month={currentMonth.month}
        activeFilters={activeFilters}
        notes={notes}
        mode={printPreviewMode}
      />
    </div>
  );
}
