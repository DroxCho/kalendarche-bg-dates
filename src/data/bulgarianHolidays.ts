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
  const todorovden = addDays(easter, -43); // 1st Saturday of Great Lent
  const midPentecost = addDays(easter, 24); // Преполовение
  const rusalskaNedelya = addDays(easter, 50); // starts on Holy Spirit Monday
  
  // Easter-related Orthodox holidays
  holidays.push(
    { date: formatDate(greatLentStart), name: 'Начало на Великия пост', type: 'fasting' },
    { date: formatDate(greatLentEnd), name: 'Край на Великия пост', type: 'fasting' },
    { date: formatDate(meatfareSunday), name: 'Месни Заговезни', type: 'folk' },
    { date: formatDate(cheesefareDay), name: 'Сирни Заговезни', type: 'folk' },
    { date: formatDate(todorovden), name: 'Тодоровден - празник на конете', type: 'folk' },
    { date: formatDate(lazarusSaturday), name: 'Лазаровден', type: 'folk' },
    { date: formatDate(palmSunday), name: 'Цветница', type: 'orthodox' },
    { date: formatDate(goodFriday), name: 'Разпети петък', type: 'orthodox' },
    { date: formatDate(holySaturday), name: 'Велика събота', type: 'orthodox' },
    { date: formatDate(easter), name: 'Великден', type: 'orthodox' },
    { date: formatDate(easterMonday), name: 'Великден (втори ден)', type: 'orthodox' },
    { date: formatDate(midPentecost), name: 'Преполовение', type: 'orthodox' },
    { date: formatDate(ascension), name: 'Спасовден', type: 'orthodox' },
    { date: formatDate(pentecost), name: 'Петдесетница', type: 'orthodox' },
    { date: formatDate(holySpirit), name: 'Духовден', type: 'orthodox' },
    { date: formatDate(rusalskaNedelya), name: 'Русалска неделя', type: 'folk' },
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
    // Януари
    { date: `${year}-01-01`, name: 'Васильовден – Василка, Васил, Васко', type: 'nameday' },
    { date: `${year}-01-02`, name: 'Силвестър, Силвия, Силвана', type: 'nameday' },
    { date: `${year}-01-04`, name: 'Тереза, Терезия', type: 'nameday' },
    { date: `${year}-01-06`, name: 'Йордановден – Йордан, Йорданка, Данчо, Богдан', type: 'nameday' },
    { date: `${year}-01-07`, name: 'Ивановден – Иван, Ивайло, Ивана, Йоан, Яна, Янко', type: 'nameday' },
    { date: `${year}-01-17`, name: 'Антоновден – Антон, Антоний, Антония, Тони', type: 'nameday' },
    { date: `${year}-01-18`, name: 'Атанасовден – Атанас, Наско, Насе, Танас', type: 'nameday' },
    { date: `${year}-01-20`, name: 'Емилиановден – Емил, Емилия, Емилиян', type: 'nameday' },
    { date: `${year}-01-21`, name: 'Максим, Максимилиян, Нина', type: 'nameday' },
    { date: `${year}-01-25`, name: 'Григоровден – Григор, Григорий, Гриша', type: 'nameday' },

    // Февруари
    { date: `${year}-02-01`, name: 'Трифоновден – Трифон, Трифонка', type: 'nameday' },
    { date: `${year}-02-03`, name: 'Симеоновден – Симеон, Симо, Симона', type: 'nameday' },
    { date: `${year}-02-05`, name: 'Агата, Агатия, Добринка', type: 'nameday' },
    { date: `${year}-02-06`, name: 'Фотинов ден – Фотин, Светла, Светлин, Светлана', type: 'nameday' },
    { date: `${year}-02-10`, name: 'Валентин, Валентина', type: 'nameday' },
    { date: `${year}-02-11`, name: 'Влас, Власи, Власий', type: 'nameday' },
    { date: `${year}-02-14`, name: 'Валентин, Валентина (Западна традиция)', type: 'nameday' },

    // Март
    { date: `${year}-03-01`, name: 'Марта, Мартин, Мартина', type: 'nameday' },
    { date: `${year}-03-09`, name: 'Младенци – Младен, Младенка', type: 'nameday' },
    { date: `${year}-03-17`, name: 'Алексий, Алексей, Алекси', type: 'nameday' },
    { date: `${year}-03-25`, name: 'Благовещение – Благой, Блага, Благовеста, Бона', type: 'nameday' },
    { date: `${year}-03-26`, name: 'Гаврил, Габриел, Габриела', type: 'nameday' },

    // Април
    { date: `${year}-04-04`, name: 'Дарин, Дарина, Дария', type: 'nameday' },
    { date: `${year}-04-14`, name: 'Мартин, Мартина (пролетен)', type: 'nameday' },
    { date: `${year}-04-25`, name: 'Маркoвден – Марко, Марк', type: 'nameday' },
    { date: `${year}-04-30`, name: 'Яковден – Яков, Якоб', type: 'nameday' },

    // Май
    { date: `${year}-05-01`, name: 'Еремия, Йеремия', type: 'nameday' },
    { date: `${year}-05-02`, name: 'Борисовден – Борис, Борислав, Борислава, Борянка', type: 'nameday' },
    { date: `${year}-05-05`, name: 'Ирина, Ирена, Мирена', type: 'nameday' },
    { date: `${year}-05-06`, name: 'Гергьовден – Георги, Гергана, Ганка, Галин', type: 'nameday' },
    { date: `${year}-05-11`, name: 'Кирил, Методий, Методи, Кирилка', type: 'nameday' },
    { date: `${year}-05-18`, name: 'Александровден – Александър, Александра, Сашо, Сашка', type: 'nameday' },
    { date: `${year}-05-21`, name: 'Константин, Елена, Костадин, Костадинка', type: 'nameday' },

    // Юни
    { date: `${year}-06-24`, name: 'Еньовден – Еню, Янка, Билян, Биляна', type: 'nameday' },
    { date: `${year}-06-29`, name: 'Петровден – Петър, Петра, Петко, Петкана, Камен', type: 'nameday' },
    { date: `${year}-06-30`, name: 'Павловден – Павел, Павлина, Паулина', type: 'nameday' },

    // Юли
    { date: `${year}-07-01`, name: 'Козма, Дамян, Дамяна', type: 'nameday' },
    { date: `${year}-07-07`, name: 'Неделя, Недялко, Недялка, Кирил', type: 'nameday' },
    { date: `${year}-07-08`, name: 'Прокопиевден – Прокопий, Прокопи', type: 'nameday' },
    { date: `${year}-07-17`, name: 'Марина, Маргарита, Маринела, Маринчо', type: 'nameday' },
    { date: `${year}-07-20`, name: 'Илинден – Илия, Илиян, Илиянa, Илко', type: 'nameday' },
    { date: `${year}-07-25`, name: 'Анна, Анка, Ани, Яна', type: 'nameday' },
    { date: `${year}-07-27`, name: 'Пантелеймон, Пантелей', type: 'nameday' },

    // Август
    { date: `${year}-08-01`, name: 'Макавей – Макавей, Маца', type: 'nameday' },
    { date: `${year}-08-07`, name: 'Донка, Донко, Доника', type: 'nameday' },
    { date: `${year}-08-09`, name: 'Панталеймоновден – Панталей, Пламен', type: 'nameday' },
    { date: `${year}-08-15`, name: 'Мария, Марийка, Мариета, Мариана, Маня', type: 'nameday' },
    { date: `${year}-08-26`, name: 'Наталия, Адриан, Адриана', type: 'nameday' },

    // Септември
    { date: `${year}-09-01`, name: 'Симеоновден (есенен) – Симеон, Симона', type: 'nameday' },
    { date: `${year}-09-08`, name: 'Малка Богородица – Мария, Марийка', type: 'nameday' },
    { date: `${year}-09-17`, name: 'Вяра, Надежда, Любов – Вера, Надя, Любка, Софка, София', type: 'nameday' },

    // Октомври
    { date: `${year}-10-01`, name: 'Покров Богородичен – Закрила', type: 'nameday' },
    { date: `${year}-10-06`, name: 'Тома, Томислав, Томислава', type: 'nameday' },
    { date: `${year}-10-14`, name: 'Петковден – Петка, Параскева, Петкана', type: 'nameday' },
    { date: `${year}-10-18`, name: 'Лукановден – Лука, Лукан', type: 'nameday' },
    { date: `${year}-10-26`, name: 'Димитровден – Димитър, Димитрина, Митко, Митка', type: 'nameday' },

    // Ноември
    { date: `${year}-11-01`, name: 'Ден на будителите – Иван, Ивайло (за учителите)', type: 'nameday' },
    { date: `${year}-11-08`, name: 'Архангеловден – Ангел, Ангелина, Архангел, Михаил, Михаела, Гавраил', type: 'nameday' },
    { date: `${year}-11-11`, name: 'Мина, Минка, Минчо', type: 'nameday' },
    { date: `${year}-11-21`, name: 'Въведение – Мария, Марийка (за въведение)', type: 'nameday' },
    { date: `${year}-11-24`, name: 'Катеринден – Катерина, Екатерина, Катя', type: 'nameday' },
    { date: `${year}-11-25`, name: 'Климентовден – Климент, Клементина', type: 'nameday' },
    { date: `${year}-11-30`, name: 'Андреевден – Андрей, Андрея, Андриан', type: 'nameday' },

    // Декември
    { date: `${year}-12-04`, name: 'Варваринден – Варвара, Барбара', type: 'nameday' },
    { date: `${year}-12-05`, name: 'Савинден – Сава, Савка, Савчо', type: 'nameday' },
    { date: `${year}-12-06`, name: 'Никулден – Никола, Николай, Николина, Nico, Колю', type: 'nameday' },
    { date: `${year}-12-09`, name: 'Аненден – Ана, Анна (зимна)', type: 'nameday' },
    { date: `${year}-12-17`, name: 'Даниел, Данаил, Даниела', type: 'nameday' },
    { date: `${year}-12-20`, name: 'Игнажден – Игнат, Огнян, Огняна, Пламен', type: 'nameday' },
    { date: `${year}-12-22`, name: 'Анастасия, Анастас, Стоян, Стояна, Стоянка', type: 'nameday' },
    { date: `${year}-12-25`, name: 'Коледа – Христо, Христина, Кристиян, Кристина, Божидар, Божана', type: 'nameday' },
    { date: `${year}-12-26`, name: 'Йосиф, Жозеф, Жозефина', type: 'nameday' },
    { date: `${year}-12-27`, name: 'Стефановден – Стефан, Стефка, Стефания', type: 'nameday' },
  );

  // Bulgarian folk feasts (Народни празници)
  holidays.push(
    { date: `${year}-01-01`, name: 'Сурва (Сурвакане)', type: 'folk' },
    { date: `${year}-01-06`, name: 'Йордановден (Водици) - народни обичаи', type: 'folk' },
    { date: `${year}-01-18`, name: 'Атанасовден - празник на зимата', type: 'folk' },
    { date: `${year}-01-20`, name: 'Ивановден - празник на семейството', type: 'folk' },
    { date: `${year}-01-21`, name: 'Бабинден', type: 'folk' },
    { date: `${year}-02-01`, name: 'Трифоновден - празник на лозарите', type: 'folk' },
    { date: `${year}-02-14`, name: 'Ден на виното и любовта', type: 'folk' },
    { date: `${year}-03-01`, name: 'Баба Марта', type: 'folk' },
    { date: `${year}-03-09`, name: 'Младенци - 40 мъченици', type: 'folk' },
    { date: `${year}-03-20`, name: 'Ден на пролетното равноденствие', type: 'folk' },
    { date: `${year}-03-25`, name: 'Благовещение - празник на майчинството', type: 'folk' },
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
    { date: `${year}-09-01`, name: 'Симеоновден - начало на есента', type: 'folk' },
    { date: `${year}-09-14`, name: 'Кръстовден - край на лятото', type: 'folk' },
    { date: `${year}-09-22`, name: 'Ден на есенното равноденствие', type: 'folk' },
    { date: `${year}-10-14`, name: 'Петковден - празник на жените', type: 'folk' },
    { date: `${year}-10-26`, name: 'Димитровден - край на земеделската година', type: 'folk' },
    { date: `${year}-11-08`, name: 'Архангеловден - празник на пастирите', type: 'folk' },
    { date: `${year}-11-11`, name: 'Мартиновден - празник на виното', type: 'folk' },
    { date: `${year}-11-21`, name: 'Въведение Богородично - Ден на християнското семейство', type: 'folk' },
    { date: `${year}-11-30`, name: 'Андреевден - мечкинден', type: 'folk' },
    { date: `${year}-12-04`, name: 'Варваринден - празник на ковачите', type: 'folk' },
    { date: `${year}-12-06`, name: 'Никулден - празник на моряците', type: 'folk' },
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
