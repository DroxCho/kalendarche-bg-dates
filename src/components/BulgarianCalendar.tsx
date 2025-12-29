import { useState, useCallback } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { MonthPaginator } from './MonthPaginator';
import { CalendarLegend } from './CalendarLegend';
import { HolidaySidebar } from './HolidaySidebar';
import { HolidaySearch } from './HolidaySearch';
import { getMonthRange } from '@/data/bulgarianHolidays';

export function BulgarianCalendar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const months = getMonthRange();
  const currentMonth = months[currentIndex];

  const handleNavigateToMonth = useCallback((year: number, month: number) => {
    const index = months.findIndex(m => m.year === year && m.month === month);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [months]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <HolidaySearch onNavigateToMonth={handleNavigateToMonth} />
      
      <MonthPaginator
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <CalendarGrid
            year={currentMonth.year}
            month={currentMonth.month}
          />
          <div className="mt-6">
            <CalendarLegend />
          </div>
        </div>
        
        <div className="lg:w-72 shrink-0">
          <HolidaySidebar
            year={currentMonth.year}
            month={currentMonth.month}
          />
        </div>
      </div>
    </div>
  );
}
