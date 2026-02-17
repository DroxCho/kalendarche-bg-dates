import { getMonthRange, BULGARIAN_MONTHS } from '@/data/bulgarianHolidays';
import { CalendarGrid } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';
import { MonthHolidayList } from './MonthHolidayList';
import { HolidayType } from './HolidayFilter';

interface PrintAllCalendarProps {
  activeFilters: HolidayType[];
  notes: Record<string, Array<{ id: string; text: string; createdAt: number }>>;
}

export function PrintAllCalendar({ activeFilters, notes }: PrintAllCalendarProps) {
  const months = getMonthRange();

  return (
    <div className="hidden print:block">
      {months.map((month, index) => (
        <div key={`${month.year}-${month.month}`} className="print-month-page">
          <h2 className="text-2xl font-display font-semibold text-center mb-4 print:text-black">
            {BULGARIAN_MONTHS[month.month]} {month.year}
          </h2>
          <CalendarGrid
            year={month.year}
            month={month.month}
            activeFilters={activeFilters}
            notes={notes}
          />
          <MonthHolidayList year={month.year} month={month.month} activeFilters={activeFilters} />
          {index === months.length - 1 && (
            <div className="mt-4">
              <CalendarLegend />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
