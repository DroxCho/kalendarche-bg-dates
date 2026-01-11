import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Holiday, BULGARIAN_DAYS_FULL, BULGARIAN_MONTHS } from '@/data/bulgarianHolidays';
import { cn } from '@/lib/utils';
import { Calendar, Cross, Flag, Star, Leaf, Flower2 } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { CalendarNote } from '@/hooks/useCalendarNotes';
import { ShareButtons } from './ShareButtons';

interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  holidays: Holiday[];
  notes: CalendarNote[];
  onAddNote?: (date: string, text: string) => void;
  onUpdateNote?: (date: string, noteId: string, text: string) => void;
  onDeleteNote?: (date: string, noteId: string) => void;
}

const holidayDescriptions: Record<string, string> = {
  // National holidays
  'Нова година': 'Празник за началото на новата година. Българите празнуват с фойерверки, шампанско и семейни събирания.',
  'Ден на Освобождението': 'Национален празник в чест на освобождението на България от османско владичество след Руско-турската война (1877-1878).',
  'Ден на труда': 'Международен ден на труда, празнуван в цял свят в чест на работническото движение.',
  'Гергьовден - Ден на храбростта': 'Ден на Българската армия и празник на Свети Георги - покровител на овчарите и стадата.',
  'Ден на славянската писменост': 'Празник в чест на светите братя Кирил и Методий, създатели на славянската азбука.',
  'Ден на Съединението': 'Празник на Съединението на Княжество България с Източна Румелия през 1885 г.',
  'Ден на Независимостта': 'Празник на обявяването на независимостта на България от Османската империя през 1908 г.',
  'Ден на народните будители': 'Празник в чест на българските просветители, книжовници и революционери.',
  'Бъдни вечер': 'Вечерта преди Коледа, когато семейството се събира на постна вечеря с нечетен брой ястия.',
  'Коледа': 'Рождество Христово - един от най-големите християнски празници.',
  'Коледа (втори ден)': 'Втори ден на Коледа, продължение на празничните чествания.',
  
  // Orthodox holidays
  'Богоявление (Йордановден)': 'Празник на кръщението на Исус Христос. Традиционно свещеникът хвърля кръст в ледените води.',
  'Ивановден': 'Имен ден на всички с имена Иван, Йоан, Йоана, Яна и производните им.',
  'Св. Трифон Зарезан': 'Празник на лозарите и виното. Започва ритуалното подрязване на лозите.',
  'Благовещение': 'Празник на благата вест - архангел Гавраил известява Дева Мария за раждането на Исус.',
  'Разпети петък': 'Ден на разпъването на Исус Христос на кръста. Ден за размисъл и пост.',
  'Велика събота': 'Денят преди Великден, когато се очаква възкресението на Христос.',
  'Великден': 'Възкресение Христово - най-големият християнски празник. Боядисват се яйца и се приготвя козунак.',
  'Великден (втори ден)': 'Светли понеделник - продължение на великденските празници.',
  'Св. Константин и Елена': 'Празник на свети равноапостолни цар Константин и майка му Елена.',
  'Еньовден': 'Празник на лятното слънцестоене. Нощта срещу Еньовден е магическа.',
  'Св. Марина': 'Имен ден на Марина. Народът вярва, че светицата има власт над змиите.',
  'Успение Богородично': 'Голяма Богородица - един от най-почитаните православни празници.',
  'Кръстовден': 'Въздвижение на Честния Кръст Господен. Край на лятото според народните вярвания.',
  'Петковден': 'Имен ден на Петка, Параскева. Много почитан празник в България.',
  'Димитровден': 'Празник на Свети Димитър Солунски - покровител на българската държава.',
  'Архангеловден': 'Празник на архангелите Михаил и Гавраил.',
  'Въведение Богородично': 'Въвеждане на Пресвета Богородица в храма.',
  'Никулден': 'Празник на Свети Николай Чудотворец - покровител на рибарите и моряците.',
  
  // Name days
  'Васильовден': 'Имен ден на Васил, Василка и производните. Традиционно се прави баница със сурвачка.',
  'Антоновден': 'Имен ден на Антон, Антония и производните им имена.',
  'Атанасовден': 'Имен ден на Атанас, Наско, Начо и производните.',
  'Сретение Господне': 'Празник на представянето на Младенеца Исус в Йерусалимския храм.',
  'Симеоновден': 'Имен ден на Симеон и производните.',
  'Тодоровден': 'Имен ден на Теодор, Тодор, Божидар. Празник на конете.',
  'Цветница': 'Връбница - Вход Господен в Йерусалим. Празник на имената на цветя.',
  'Спасовден': 'Възнесение Господне - 40 дни след Великден.',
  'Петдесетница': 'Слизане на Светия Дух - 50 дни след Великден.',
  'Духовден': 'Ден на Светия Дух - денят след Петдесетница.',
  'Илинден': 'Имен ден на Илия, Илияна. Празник на Свети пророк Илия.',
  'Преображение Господне': 'Празник на преображението на Исус на планината Тавор.',
  'Обезглавяване на Йоан Кръстител': 'Ден за размисъл. Този ден се спазва строг пост.',
  'Рождество Богородично': 'Малка Богородица - рождението на Дева Мария.',
  'Андреевден': 'Имен ден на Андрей, Андрея и производните.',
  'Варвара': 'Имен ден на Варвара. Ден за правене на варено жито.',
  'Сава': 'Имен ден на Сава и производните.',
  'Игнажден': 'Имен ден на Игнат. Начало на коледните празници.',
  'Стефановден': 'Имен ден на Стефан, Стефка и производните.',
  
  // Folk feasts
  'Сурва (Сурвакане)': 'Новогодишен обичай - деца ходят по къщите и благославят за здраве и берекет.',
  'Бабинден': 'Празник на бабите акушерки и родилките. Възрастните жени се събират на веселие.',
  'Сирни Заговезни': 'Последният ден преди Великия пост, когато се яде сирене и млечни продукти.',
  'Лазаровден': 'Съботата преди Цветница. Момичетата лазаруват и пеят песни.',
  'Гергьовден': 'Празник на Свети Георги - покровител на овчарите, войниците и пролетта.',
  'Русалска неделя': 'Седмица след Петдесетница. Според вярванията русалките излизат.',
  'Петровден': 'Празник на светите апостоли Петър и Павел. Край на Петровския пост.',
  'Св. Седмочисленици': 'Празник на светите седмочисленици - ученици на Кирил и Методий.',
  'Зимен Свети Никола': 'Зимен Никулден - почитане на Свети Николай Мирликийски.',
  'Коледуване': 'Традиционен обичай на коледарските дружини.',
  
  // Fasting periods
  'Начало на Великия пост': 'Начало на 40-дневния пост преди Великден.',
  'Край на Великия пост': 'Последен ден от Великия пост преди Великден.',
  'Начало на Петров пост': 'Пост преди Петровден - продължителността варира всяка година.',
  'Край на Петров пост': 'Край на Петровия пост на Петровден.',
  'Начало на Богородичен пост': 'Начало на двуседмичния пост преди Успение Богородично.',
  'Край на Богородичен пост': 'Край на Богородичния пост на Голяма Богородица.',
  'Начало на Коледен пост': 'Начало на 40-дневния пост преди Коледа.',
  'Край на Коледен пост': 'Край на Коледния пост на Бъдни вечер.',
};

function getHolidayIcon(type: Holiday['type']) {
  switch (type) {
    case 'national':
      return <Flag className="h-5 w-5" />;
    case 'orthodox':
      return <Cross className="h-5 w-5" />;
    case 'nameday':
      return <Star className="h-5 w-5" />;
    case 'folk':
      return <Flower2 className="h-5 w-5" />;
    case 'fasting':
      return <Leaf className="h-5 w-5" />;
    default:
      return <Calendar className="h-5 w-5" />;
  }
}

function getHolidayTypeName(type: Holiday['type']): string {
  switch (type) {
    case 'national':
      return 'Национален празник';
    case 'orthodox':
      return 'Православен празник';
    case 'nonworking':
      return 'Неработен ден';
    case 'nameday':
      return 'Имен ден';
    case 'folk':
      return 'Народен празник';
    case 'fasting':
      return 'Постен ден';
    default:
      return 'Празник';
  }
}

export function HolidayModal({ open, onOpenChange, date, holidays, notes, onAddNote, onUpdateNote, onDeleteNote }: HolidayModalProps) {
  if (!date) return null;

  const dayOfWeek = date.getDay();
  const dayName = BULGARIAN_DAYS_FULL[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
  const monthName = BULGARIAN_MONTHS[date.getMonth()];
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            {date.getDate()} {monthName} {date.getFullYear()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{dayName}</p>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {holidays.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Няма регистрирани празници за този ден.
            </p>
          ) : (
            holidays.map((holiday, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border",
                  holiday.type === 'national' && "border-primary/30 bg-primary/5",
                  holiday.type === 'orthodox' && "border-accent/30 bg-accent/5",
                  holiday.type === 'nonworking' && "border-destructive/30 bg-destructive/5",
                  holiday.type === 'nameday' && "border-secondary/30 bg-secondary/5",
                  holiday.type === 'folk' && "border-orange-500/30 bg-orange-500/5",
                  holiday.type === 'fasting' && "border-purple-500/30 bg-purple-500/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full shrink-0",
                    holiday.type === 'national' && "bg-primary/10 text-primary",
                    holiday.type === 'orthodox' && "bg-accent/10 text-accent",
                    holiday.type === 'nonworking' && "bg-destructive/10 text-destructive",
                    holiday.type === 'nameday' && "bg-secondary/80 text-secondary-foreground",
                    holiday.type === 'folk' && "bg-orange-500/10 text-orange-600",
                    holiday.type === 'fasting' && "bg-purple-500/10 text-purple-600"
                  )}>
                    {getHolidayIcon(holiday.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{holiday.name}</h3>
                    <span className={cn(
                      "inline-block text-xs px-2 py-0.5 rounded-full mt-1",
                      holiday.type === 'national' && "bg-primary/20 text-primary",
                      holiday.type === 'orthodox' && "bg-accent/20 text-accent",
                      holiday.type === 'nonworking' && "bg-destructive/20 text-destructive",
                      holiday.type === 'nameday' && "bg-secondary text-secondary-foreground",
                      holiday.type === 'folk' && "bg-orange-500/20 text-orange-700",
                      holiday.type === 'fasting' && "bg-purple-500/20 text-purple-700"
                    )}>
                      {getHolidayTypeName(holiday.type)}
                    </span>
                    {holidayDescriptions[holiday.name] && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {holidayDescriptions[holiday.name]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {onAddNote && onUpdateNote && onDeleteNote && (
          <NoteEditor
            date={dateString}
            notes={notes}
            onAdd={onAddNote}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
          />
        )}

        <ShareButtons date={date} holidays={holidays} />
      </DialogContent>
    </Dialog>
  );
}
