export type HolidayType = 'national' | 'orthodox' | 'nonworking' | 'nameday' | 'folk' | 'fasting';

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
  const palmSunday = addDays(easter, -7);
  const lazarusSaturday = addDays(easter, -8);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const holySpirit = addDays(easter, 50);
  const greatLentStart = addDays(easter, -48);
  const greatLentEnd = addDays(easter, -1);
  const meatfareSunday = addDays(easter, -56);
  const cheesefareDay = addDays(easter, -49);
  
  // Easter-related Orthodox holidays
  holidays.push(
    { date: formatDate(greatLentStart), name: 'Начало на Великия пост', type: 'fasting' },
    { date: formatDate(greatLentEnd), name: 'Край на Великия пост', type: 'fasting' },
    { date: formatDate(cheesefareDay), name: 'Сирни Заговезни', type: 'folk' },
    { date: formatDate(lazarusSaturday), name: 'Лазаровден', type: 'folk' },
    { date: formatDate(palmSunday), name: 'Цветница', type: 'orthodox' },
    { date: formatDate(goodFriday), name: 'Разпети петък', type: 'orthodox' },
    { date: formatDate(holySaturday), name: 'Велика събота', type: 'orthodox' },
    { date: formatDate(easter), name: 'Великден', type: 'orthodox' },
    { date: formatDate(easterMonday), name: 'Великден (втори ден)', type: 'orthodox' },
    { date: formatDate(ascension), name: 'Спасовден', type: 'orthodox' },
    { date: formatDate(pentecost), name: 'Петдесетница', type: 'orthodox' },
    { date: formatDate(holySpirit), name: 'Духовден', type: 'orthodox' },
  );

  // Major Orthodox holidays (fixed dates)
  holidays.push(
    { date: `${year}-01-06`, name: 'Богоявление (Йордановден)', type: 'orthodox' },
    { date: `${year}-02-02`, name: 'Сретение Господне', type: 'orthodox' },
    { date: `${year}-03-25`, name: 'Благовещение', type: 'orthodox' },
    { date: `${year}-05-21`, name: 'Св. Константин и Елена', type: 'orthodox' },
    { date: `${year}-06-24`, name: 'Еньовден', type: 'orthodox' },
    { date: `${year}-06-29`, name: 'Петровден', type: 'orthodox' },
    { date: `${year}-07-17`, name: 'Св. Марина', type: 'orthodox' },
    { date: `${year}-07-20`, name: 'Илинден', type: 'orthodox' },
    { date: `${year}-08-06`, name: 'Преображение Господне', type: 'orthodox' },
    { date: `${year}-08-15`, name: 'Успение Богородично', type: 'orthodox' },
    { date: `${year}-08-29`, name: 'Обезглавяване на Йоан Кръстител', type: 'orthodox' },
    { date: `${year}-09-08`, name: 'Рождество Богородично', type: 'orthodox' },
    { date: `${year}-09-14`, name: 'Кръстовден', type: 'orthodox' },
    { date: `${year}-10-14`, name: 'Петковден', type: 'orthodox' },
    { date: `${year}-10-26`, name: 'Димитровден', type: 'orthodox' },
    { date: `${year}-11-08`, name: 'Архангеловден', type: 'orthodox' },
    { date: `${year}-11-21`, name: 'Въведение Богородично', type: 'orthodox' },
    { date: `${year}-12-06`, name: 'Никулден', type: 'orthodox' },
  );

  // Name days (Имени дни)
  holidays.push(
    { date: `${year}-01-01`, name: 'Васильовден', type: 'nameday' },
    { date: `${year}-01-07`, name: 'Ивановден', type: 'nameday' },
    { date: `${year}-01-17`, name: 'Антоновден', type: 'nameday' },
    { date: `${year}-01-18`, name: 'Атанасовден', type: 'nameday' },
    { date: `${year}-02-01`, name: 'Трифоновден (Имен ден)', type: 'nameday' },
    { date: `${year}-02-03`, name: 'Симеоновден', type: 'nameday' },
    { date: `${year}-03-09`, name: 'Младенци', type: 'nameday' },
    { date: `${year}-03-19`, name: 'Тодоровден', type: 'nameday' },
    { date: `${year}-04-23`, name: 'Гергьовден', type: 'nameday' },
    { date: `${year}-05-02`, name: 'Борисовден', type: 'nameday' },
    { date: `${year}-05-11`, name: 'Св. Методий', type: 'nameday' },
    { date: `${year}-05-18`, name: 'Александровден', type: 'nameday' },
    { date: `${year}-06-30`, name: 'Павловден', type: 'nameday' },
    { date: `${year}-07-07`, name: 'Недельо', type: 'nameday' },
    { date: `${year}-07-25`, name: 'Анна', type: 'nameday' },
    { date: `${year}-08-09`, name: 'Панталеймоновден', type: 'nameday' },
    { date: `${year}-09-17`, name: 'Вяра, Надежда, Любов', type: 'nameday' },
    { date: `${year}-10-01`, name: 'Покров Богородичен', type: 'nameday' },
    { date: `${year}-10-27`, name: 'Прокопиевден', type: 'nameday' },
    { date: `${year}-11-11`, name: 'Мина', type: 'nameday' },
    { date: `${year}-11-30`, name: 'Андреевден', type: 'nameday' },
    { date: `${year}-12-04`, name: 'Варвара', type: 'nameday' },
    { date: `${year}-12-05`, name: 'Сава', type: 'nameday' },
    { date: `${year}-12-20`, name: 'Игнажден', type: 'nameday' },
    { date: `${year}-12-27`, name: 'Стефановден', type: 'nameday' },
  );

  // Bulgarian folk feasts (Народни празници)
  holidays.push(
    { date: `${year}-01-01`, name: 'Сурва (Сурвакане)', type: 'folk' },
    { date: `${year}-01-06`, name: 'Йордановден (Водици) - народни обичаи', type: 'folk' },
    { date: `${year}-01-18`, name: 'Атанасовден - празник на зимата', type: 'folk' },
    { date: `${year}-01-20`, name: 'Ивановден - празник на семейството', type: 'folk' },
    { date: `${year}-01-21`, name: 'Бабинден', type: 'folk' },
    { date: `${year}-02-01`, name: 'Трифоновден - празник на лозарите', type: 'folk' },
    { date: `${year}-02-10`, name: 'Ден на виното и любовта', type: 'folk' },
    { date: `${year}-02-14`, name: 'Св. Трифон Зарезан', type: 'folk' },
    { date: `${year}-03-01`, name: 'Баба Марта', type: 'folk' },
    { date: `${year}-03-09`, name: 'Младенци - 40 мъченици', type: 'folk' },
    { date: `${year}-03-22`, name: 'Ден на пролетното равноденствие', type: 'folk' },
    { date: `${year}-03-25`, name: 'Благовещение - празник на майчинството', type: 'folk' },
    { date: `${year}-04-14`, name: 'Ден на виното (Св. Мартин)', type: 'folk' },
    { date: `${year}-05-02`, name: 'Борисовден - празник на градинарите', type: 'folk' },
    { date: `${year}-05-06`, name: 'Гергьовден - празник на овчарите', type: 'folk' },
    { date: `${year}-05-21`, name: 'Константин и Елена - нестинарски игри', type: 'folk' },
    { date: `${year}-06-01`, name: 'Ден на розата', type: 'folk' },
    { date: `${year}-06-24`, name: 'Еньовден - билки и магии', type: 'folk' },
    { date: `${year}-06-29`, name: 'Петровден - празник на рибарите', type: 'folk' },
    { date: `${year}-07-02`, name: 'Ден на билките', type: 'folk' },
    { date: `${year}-07-20`, name: 'Илинден - празник на жътвата', type: 'folk' },
    { date: `${year}-07-27`, name: 'Св. Седмочисленици', type: 'folk' },
    { date: `${year}-08-01`, name: 'Макавей - празник на пчеларите', type: 'folk' },
    { date: `${year}-08-15`, name: 'Голяма Богородица - празник на билките', type: 'folk' },
    { date: `${year}-08-28`, name: 'Успение Богородично - Голяма Богородица', type: 'folk' },
    { date: `${year}-09-01`, name: 'Симеоновден - начало на есента', type: 'folk' },
    { date: `${year}-09-14`, name: 'Кръстовден - край на лятото', type: 'folk' },
    { date: `${year}-09-21`, name: 'Ден на есенното равноденствие', type: 'folk' },
    { date: `${year}-10-14`, name: 'Петковден - празник на жените', type: 'folk' },
    { date: `${year}-10-26`, name: 'Димитровден - край на земеделската година', type: 'folk' },
    { date: `${year}-11-08`, name: 'Архангеловден - празник на пастирите', type: 'folk' },
    { date: `${year}-11-11`, name: 'Мартиновден - празник на виното', type: 'folk' },
    { date: `${year}-11-21`, name: 'Въведение Богородично - Ден на християнското семейство', type: 'folk' },
    { date: `${year}-11-30`, name: 'Андреевден - мечкинден', type: 'folk' },
    { date: `${year}-12-04`, name: 'Варваринден - празник на ковачите', type: 'folk' },
    { date: `${year}-12-06`, name: 'Никулден - празник на моряците', type: 'folk' },
    { date: `${year}-12-19`, name: 'Зимен Свети Никола', type: 'folk' },
    { date: `${year}-12-20`, name: 'Игнажден - начало на Коледните празници', type: 'folk' },
    { date: `${year}-12-21`, name: 'Ден на зимното слънцестоене', type: 'folk' },
    { date: `${year}-12-24`, name: 'Коледуване', type: 'folk' },
    { date: `${year}-12-25`, name: 'Коледа - народни обичаи', type: 'folk' },
    { date: `${year}-12-27`, name: 'Стефановден - празник на дърводелците', type: 'folk' },
    { date: `${year}-12-31`, name: 'Силвестрова нощ - Нова година', type: 'folk' },
  );

  // Fasting periods (Постни дни)
  
  // Great Lent fasting days (every day during Great Lent is a fasting day)
  for (let i = 0; i < 48; i++) {
    const fastingDay = addDays(greatLentStart, i);
    if (i === 0) {
      holidays.push({ date: formatDate(fastingDay), name: 'Начало на Великия пост (Чисти понеделник)', type: 'fasting' });
    } else if (i === 47) {
      holidays.push({ date: formatDate(fastingDay), name: 'Велика събота - край на поста', type: 'fasting' });
    } else {
      holidays.push({ date: formatDate(fastingDay), name: 'Великопостен ден', type: 'fasting' });
    }
  }
  
  // Petrov post (Apostles' Fast) - Monday after Pentecost to June 28
  const petrovPostStart = addDays(pentecost, 1);
  const petrovPostEnd = new Date(year, 5, 28); // June 28
  let currentDay = new Date(petrovPostStart);
  while (currentDay <= petrovPostEnd) {
    const formattedDate = formatDate(currentDay);
    if (currentDay.getTime() === petrovPostStart.getTime()) {
      holidays.push({ date: formattedDate, name: 'Начало на Петров пост', type: 'fasting' });
    } else if (currentDay.getTime() === petrovPostEnd.getTime()) {
      holidays.push({ date: formattedDate, name: 'Край на Петров пост', type: 'fasting' });
    } else {
      holidays.push({ date: formattedDate, name: 'Петров пост', type: 'fasting' });
    }
    currentDay = addDays(currentDay, 1);
  }

  // Bogorodichen post (Dormition Fast) - August 1-14
  for (let day = 1; day <= 14; day++) {
    const date = `${year}-08-${String(day).padStart(2, '0')}`;
    if (day === 1) {
      holidays.push({ date, name: 'Начало на Богородичен пост', type: 'fasting' });
    } else if (day === 14) {
      holidays.push({ date, name: 'Край на Богородичен пост', type: 'fasting' });
    } else {
      holidays.push({ date, name: 'Богородичен пост', type: 'fasting' });
    }
  }

  // Christmas post (Advent/Nativity Fast) - November 15 - December 24
  for (let day = 15; day <= 30; day++) {
    const date = `${year}-11-${String(day).padStart(2, '0')}`;
    if (day === 15) {
      holidays.push({ date, name: 'Начало на Коледен пост (Филипов пост)', type: 'fasting' });
    } else {
      holidays.push({ date, name: 'Коледен пост', type: 'fasting' });
    }
  }
  for (let day = 1; day <= 24; day++) {
    const date = `${year}-12-${String(day).padStart(2, '0')}`;
    if (day === 24) {
      holidays.push({ date, name: 'Бъдни вечер - край на Коледен пост', type: 'fasting' });
    } else {
      holidays.push({ date, name: 'Коледен пост', type: 'fasting' });
    }
  }

  // Weekly fasting days (Wednesday and Friday)
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  for (let d = new Date(startOfYear); d <= endOfYear; d = addDays(d, 1)) {
    const dayOfWeek = d.getDay();
    // Wednesday (3) and Friday (5) are traditional fasting days
    if (dayOfWeek === 3 || dayOfWeek === 5) {
      const dateStr = formatDate(d);
      // Check if it's not already covered by a major fast
      const existingFast = holidays.find(h => h.date === dateStr && h.type === 'fasting');
      if (!existingFast) {
        holidays.push({ 
          date: dateStr, 
          name: dayOfWeek === 3 ? 'Сряда - постен ден' : 'Петък - постен ден', 
          type: 'fasting' 
        });
      }
    }
  }

  // Special single-day fasts
  holidays.push(
    { date: `${year}-01-05`, name: 'Пост на Богоявление', type: 'fasting' },
    { date: `${year}-08-29`, name: 'Пост за Усекновение', type: 'fasting' },
    { date: `${year}-09-14`, name: 'Пост на Кръстовден', type: 'fasting' },
  );

  // Rusalia week (week after Pentecost)
  const rusaliaStart = addDays(pentecost, 1);
  holidays.push(
    { date: formatDate(rusaliaStart), name: 'Русалска неделя', type: 'folk' },
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
