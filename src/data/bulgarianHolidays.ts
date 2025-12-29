export type HolidayType = 'national' | 'orthodox' | 'nonworking';

export interface Holiday {
  date: string; // Format: YYYY-MM-DD
  name: string;
  type: HolidayType;
}

// Bulgarian month names
export const BULGARIAN_MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
];

// Bulgarian day names (starting from Monday)
export const BULGARIAN_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const BULGARIAN_DAYS_FULL = [
  'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'
];

// Calculate Orthodox Easter date using the Meeus Julian algorithm
function getOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  
  // Convert from Julian to Gregorian calendar (add 13 days for 1900-2099)
  const julianDate = new Date(year, month - 1, day);
  julianDate.setDate(julianDate.getDate() + 13);
  
  return julianDate;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Generate holidays for a specific year
function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  
  // Fixed National Holidays
  holidays.push(
    { date: `${year}-01-01`, name: 'Нова година', type: 'national' },
    { date: `${year}-03-03`, name: 'Ден на Освобождението', type: 'national' },
    { date: `${year}-05-01`, name: 'Ден на труда', type: 'national' },
    { date: `${year}-05-06`, name: 'Гергьовден - Ден на храбростта', type: 'national' },
    { date: `${year}-05-24`, name: 'Ден на славянската писменост', type: 'national' },
    { date: `${year}-09-06`, name: 'Ден на Съединението', type: 'national' },
    { date: `${year}-09-22`, name: 'Ден на Независимостта', type: 'national' },
    { date: `${year}-11-01`, name: 'Ден на народните будители', type: 'national' },
    { date: `${year}-12-24`, name: 'Бъдни вечер', type: 'national' },
    { date: `${year}-12-25`, name: 'Коледа', type: 'national' },
    { date: `${year}-12-26`, name: 'Коледа (втори ден)', type: 'national' },
  );

  // Orthodox Easter and related holidays
  const easter = getOrthodoxEaster(year);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const easterMonday = addDays(easter, 1);
  
  holidays.push(
    { date: formatDate(goodFriday), name: 'Разпети петък', type: 'orthodox' },
    { date: formatDate(holySaturday), name: 'Велика събота', type: 'orthodox' },
    { date: formatDate(easter), name: 'Великден', type: 'orthodox' },
    { date: formatDate(easterMonday), name: 'Великден (втори ден)', type: 'orthodox' },
  );

  // Major Orthodox holidays
  holidays.push(
    { date: `${year}-01-06`, name: 'Богоявление (Йордановден)', type: 'orthodox' },
    { date: `${year}-01-07`, name: 'Ивановден', type: 'orthodox' },
    { date: `${year}-02-14`, name: 'Св. Трифон Зарезан', type: 'orthodox' },
    { date: `${year}-03-25`, name: 'Благовещение', type: 'orthodox' },
    { date: `${year}-05-21`, name: 'Св. Константин и Елена', type: 'orthodox' },
    { date: `${year}-06-24`, name: 'Еньовден', type: 'orthodox' },
    { date: `${year}-07-17`, name: 'Св. Марина', type: 'orthodox' },
    { date: `${year}-08-15`, name: 'Успение Богородично', type: 'orthodox' },
    { date: `${year}-09-14`, name: 'Кръстовден', type: 'orthodox' },
    { date: `${year}-10-14`, name: 'Петковден', type: 'orthodox' },
    { date: `${year}-10-26`, name: 'Димитровден', type: 'orthodox' },
    { date: `${year}-11-08`, name: 'Архангеловден', type: 'orthodox' },
    { date: `${year}-11-21`, name: 'Въведение Богородично', type: 'orthodox' },
    { date: `${year}-12-06`, name: 'Никулден', type: 'orthodox' },
  );

  return holidays;
}

// Generate all holidays from December 2025 to January 2027
export function getAllHolidays(): Holiday[] {
  const holidays: Holiday[] = [];
  
  // Get holidays for 2025, 2026, and 2027
  holidays.push(...getHolidaysForYear(2025));
  holidays.push(...getHolidaysForYear(2026));
  holidays.push(...getHolidaysForYear(2027));
  
  return holidays;
}

// Get holidays for a specific date
export function getHolidaysForDate(dateString: string): Holiday[] {
  return getAllHolidays().filter(h => h.date === dateString);
}

// Check if a date is a weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Generate list of months from December 2025 to January 2027
export function getMonthRange(): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  
  // December 2025
  months.push({ year: 2025, month: 11 });
  
  // All of 2026
  for (let m = 0; m < 12; m++) {
    months.push({ year: 2026, month: m });
  }
  
  // January 2027
  months.push({ year: 2027, month: 0 });
  
  return months;
}
