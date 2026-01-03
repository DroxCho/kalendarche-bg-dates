import { Holiday, HolidayType } from '@/data/bulgarianHolidays';

function getHolidayDescription(type: HolidayType): string {
  switch (type) {
    case 'national': return 'Национален празник';
    case 'orthodox': return 'Православен празник';
    case 'nameday': return 'Имен ден';
    case 'folk': return 'Народен празник';
    case 'fasting': return 'Постен ден';
    default: return 'Празник';
  }
}

function formatICSDate(dateString: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD format for all-day events
  return dateString.replace(/-/g, '');
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICSFile(holidays: Holiday[], filename: string = 'bulgarian-calendar'): void {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bulgarian Calendar//BG//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Български календар',
    'X-WR-TIMEZONE:Europe/Sofia',
  ];

  holidays.forEach((holiday, index) => {
    const uid = `${formatICSDate(holiday.date)}-${index}@bulgarian-calendar`;
    const description = getHolidayDescription(holiday.type);
    
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${formatICSDate(holiday.date)}`,
      `DTEND;VALUE=DATE:${formatICSDate(holiday.date)}`,
      `SUMMARY:${escapeICSText(holiday.name)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      `CATEGORIES:${escapeICSText(description)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateICSForMonth(holidays: Holiday[], year: number, month: number): void {
  const monthStr = String(month + 1).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;
  const monthHolidays = holidays.filter(h => h.date.startsWith(prefix));
  generateICSFile(monthHolidays, `bulgarian-calendar-${year}-${monthStr}`);
}

export function generateICSForYear(holidays: Holiday[], year: number): void {
  const yearHolidays = holidays.filter(h => h.date.startsWith(`${year}`));
  generateICSFile(yearHolidays, `bulgarian-calendar-${year}`);
}
