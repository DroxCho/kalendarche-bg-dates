import { useState } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { MonthPaginator } from './MonthPaginator';
import { CalendarLegend } from './CalendarLegend';
import { getMonthRange } from '@/data/bulgarianHolidays';

export function BulgarianCalendar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const months = getMonthRange();
  const currentMonth = months[currentIndex];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <MonthPaginator
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
      
      <CalendarGrid
        year={currentMonth.year}
        month={currentMonth.month}
      />
      
      <CalendarLegend />
    </div>
  );
}
