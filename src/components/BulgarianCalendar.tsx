import { useState, useCallback, useMemo } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { MonthPaginator } from './MonthPaginator';
import { CalendarLegend } from './CalendarLegend';
import { HolidaySidebar } from './HolidaySidebar';
import { HolidaySearch } from './HolidaySearch';
import { HolidayFilter, HolidayType } from './HolidayFilter';
import { YearView } from './YearView';
import { getMonthRange } from '@/data/bulgarianHolidays';
import { useCalendarNotes } from '@/hooks/useCalendarNotes';
import { NotificationToggle } from './NotificationToggle';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { CalendarDays, Grid3X3 } from 'lucide-react';

const ALL_HOLIDAY_TYPES: HolidayType[] = ['national', 'orthodox', 'nameday', 'folk', 'fasting'];

export function BulgarianCalendar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<HolidayType[]>(ALL_HOLIDAY_TYPES);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const { notes, addNote, updateNote, removeNote } = useCalendarNotes();
  
  const months = getMonthRange();
  const currentMonth = months[currentIndex];

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <HolidaySearch onNavigateToMonth={handleNavigateToMonth} />
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-3 print:justify-center">
        <MonthPaginator
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onGoToToday={handleGoToToday}
          showTodayButton={(!isViewingCurrentMonth || viewMode === 'year') && todayMonthIndex !== -1}
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
        </div>
      </div>
      
      <HolidayFilter
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />
      
      {viewMode === 'month' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <CalendarGrid
              year={currentMonth.year}
              month={currentMonth.month}
              activeFilters={activeFilters}
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={removeNote}
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
  );
}
