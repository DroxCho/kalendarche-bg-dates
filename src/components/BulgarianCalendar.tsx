import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarGrid } from './CalendarGrid';
import { MonthPaginator } from './MonthPaginator';
import { CalendarLegend } from './CalendarLegend';
import { HolidaySidebar } from './HolidaySidebar';
import { HolidaySearch } from './HolidaySearch';
import { HolidayFilter, HolidayType } from './HolidayFilter';
import { YearView } from './YearView';
import { PrintAllCalendar } from './PrintAllCalendar';
import { getMonthRange, getHolidaysForDate } from '@/data/bulgarianHolidays';
import { useCalendarNotes, ImportResult as NotesImportResult } from '@/hooks/useCalendarNotes';
import { useBirthdays, ImportResult as BirthdaysImportResult } from '@/hooks/useBirthdays';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NotificationToggle } from './NotificationToggle';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { CalendarDays, Grid3X3, LogIn, LogOut, User } from 'lucide-react';
import { parseUrlDate } from '@/lib/sharing';
import { HolidayModal } from './HolidayModal';
import { PrintPreview } from './PrintPreview';

const ALL_HOLIDAY_TYPES: HolidayType[] = ['national', 'orthodox', 'nameday', 'folk', 'fasting'];

export function BulgarianCalendar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<HolidayType[]>(ALL_HOLIDAY_TYPES);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
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
  
  const { notes, addNote, updateNote, removeNote, moveNote } = useCalendarNotes(handleNotesImport);
  const { birthdays, addBirthday, updateBirthday, removeBirthday, getBirthdaysForDateString, calculateAge } = useBirthdays(handleBirthdaysImport);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const months = getMonthRange();
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <HolidaySearch onNavigateToMonth={handleNavigateToMonth} />
      </div>
      
      <div className={`flex items-center justify-between flex-wrap gap-3 print:justify-center ${printAll ? 'print:hidden' : ''}`}>
        <MonthPaginator
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onGoToToday={handleGoToToday}
          showTodayButton={(!isViewingCurrentMonth || viewMode === 'year') && todayMonthIndex !== -1}
          onPrintAll={handlePrintAll}
          onPrintPreview={handlePrintPreview}
          activeFilters={activeFilters}
        />
        
        <div className="flex items-center gap-1 print:hidden">
          <ThemeToggle />
          <NotificationToggle />
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
            className="gap-1.5"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Месец</span>
          </Button>
          <Button
            variant={viewMode === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('year')}
            className="gap-1.5"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Година</span>
          </Button>
          
          {/* Auth buttons */}
          {!loading && (
            user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="gap-1.5"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Профил</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Изход</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Вход</span>
              </Button>
            )
          )}
        </div>
      </div>
      
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
        {viewMode === 'month' ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <CalendarGrid
                year={currentMonth.year}
                month={currentMonth.month}
                activeFilters={activeFilters}
                notes={notes}
                birthdays={birthdays}
                onAddNote={addNote}
                onUpdateNote={updateNote}
                onDeleteNote={removeNote}
                onMoveNote={moveNote}
                onAddBirthday={addBirthday}
                onUpdateBirthday={updateBirthday}
                onDeleteBirthday={removeBirthday}
                calculateAge={calculateAge}
              />
              <div className="mt-6">
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
        ) : (
          <div>
            <YearView 
              year={currentMonth.year} 
              onMonthClick={handleYearMonthClick}
            />
            <div className="mt-6">
              <CalendarLegend />
            </div>
          </div>
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
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onDeleteNote={removeNote}
        onAddBirthday={addBirthday}
        onUpdateBirthday={updateBirthday}
        onDeleteBirthday={removeBirthday}
        calculateAge={calculateAge}
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
