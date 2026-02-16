import jsPDF from 'jspdf';
import { BULGARIAN_MONTHS, BULGARIAN_DAYS, getMonthRange, getAllHolidays } from '@/data/bulgarianHolidays';
import { loadDejaVuFont, loadDejaVuFontBold } from './fonts/dejaVuSans';
import { translateHolidayName } from '@/data/holidayTranslations';
import i18n from '@/i18n';

interface PDFExportOptions {
  year: number;
  month: number;
  activeFilters: string[];
}

const DAYS_OF_WEEK_BG = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const DAYS_OF_WEEK_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function isEnglish() {
  return i18n.language === 'en';
}

function getLocalizedDays() {
  return isEnglish() ? DAYS_OF_WEEK_EN : DAYS_OF_WEEK_BG;
}

function getLocalizedMonth(month: number) {
  return isEnglish() ? ENGLISH_MONTHS[month] : BULGARIAN_MONTHS[month];
}

function localizeHolidayName(name: string) {
  return translateHolidayName(name, i18n.language);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// Initialize PDF with Cyrillic font support
async function initPdfWithCyrillicFont(): Promise<jsPDF> {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  try {
    const [normalFont, boldFont] = await Promise.all([
      loadDejaVuFont(),
      loadDejaVuFontBold()
    ]);
    
    pdf.addFileToVFS('DejaVuSans.ttf', normalFont);
    pdf.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    
    pdf.addFileToVFS('DejaVuSans-Bold.ttf', boldFont);
    pdf.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
    
    pdf.setFont('DejaVuSans');
  } catch (error) {
    console.warn('Failed to load Cyrillic font, falling back to helvetica:', error);
    pdf.setFont('helvetica');
  }
  
  return pdf;
}

function drawCalendarGrid(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 10;
  const marginTop = 25;
  const cellWidth = (pageWidth - marginLeft * 2) / 7;
  const cellHeight = 24;

  const daysOfWeek = getLocalizedDays();
  pdf.setFontSize(10);
  pdf.setFont('DejaVuSans', 'bold');
  daysOfWeek.forEach((day, i) => {
    const x = marginLeft + i * cellWidth;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(x, marginTop, cellWidth, 8, 'F');
    pdf.setDrawColor(220, 220, 220);
    pdf.rect(x, marginTop, cellWidth, 8, 'S');
    
    if (i === 5) pdf.setTextColor(50, 100, 200);
    else if (i === 6) pdf.setTextColor(200, 50, 50);
    else pdf.setTextColor(0, 0, 0);
    
    pdf.text(day, x + cellWidth / 2, marginTop + 5.5, { align: 'center' });
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const allHolidays = getAllHolidays();

  let currentDay = 1;
  let row = 0;

  while (currentDay <= daysInMonth) {
    for (let col = 0; col < 7 && currentDay <= daysInMonth; col++) {
      if (row === 0 && col < firstDay) continue;

      const x = marginLeft + col * cellWidth;
      const y = marginTop + 8 + row * cellHeight;
      const dayOfWeek = new Date(year, month, currentDay).getDay();
      
      // Background
      if (dayOfWeek === 6) pdf.setFillColor(235, 242, 255);
      else if (dayOfWeek === 0) pdf.setFillColor(255, 240, 240);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(x, y, cellWidth, cellHeight, 'F');

      // Today highlight
      if (isCurrentMonth && currentDay === today.getDate()) {
        pdf.setDrawColor(180, 50, 80);
        pdf.setLineWidth(1);
        pdf.rect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1, 'S');
        pdf.setLineWidth(0.2);
      }

      // Border
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(x, y, cellWidth, cellHeight, 'S');

      // Day number
      pdf.setFontSize(12);
      pdf.setFont('DejaVuSans', 'bold');
      if (dayOfWeek === 0) pdf.setTextColor(200, 50, 50);
      else if (dayOfWeek === 6) pdf.setTextColor(50, 100, 200);
      else pdf.setTextColor(50, 50, 50);
      pdf.text(String(currentDay), x + 3, y + 6);

      // Holidays
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      const dayHolidays = allHolidays.filter(h => h.date === dateStr && activeFilters.includes(h.type));

      if (dayHolidays.length > 0) {
        pdf.setFontSize(6);
        pdf.setFont('DejaVuSans', 'normal');
        let textY = y + 11;

        // Check if there's a fasting day and draw leaf icon in upper right corner
        const hasFasting = dayHolidays.some(h => h.type === 'fasting');
        if (hasFasting) {
          const fastingColor: [number, number, number] = [120, 80, 160];
          drawIcon(pdf, 'leaf', x + cellWidth - 4, y + 4, 3, fastingColor);
        }

        dayHolidays.slice(0, 3).forEach(holiday => {
          let textColor: [number, number, number];
          switch (holiday.type) {
            case 'national': textColor = [180, 50, 80]; break;
            case 'orthodox': textColor = [180, 140, 40]; break;
            case 'nameday': textColor = [140, 70, 170]; break;
            case 'folk': textColor = [200, 110, 40]; break;
            case 'fasting': textColor = [120, 80, 160]; break;
            default: textColor = [100, 100, 100];
          }
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

          // Draw icon for non-fasting holidays
          const iconType = getIconForHolidayType(holiday.type);
          const iconSize = 2.5;
          let textStartX = x + 2;
          
          if (iconType) {
            drawIcon(pdf, iconType, x + 3.5, textY - 1.2, iconSize, textColor);
            textStartX = x + 6;
          }

          // Translate holiday name if in English
          let text = localizeHolidayName(holiday.name);
          const maxWidth = cellWidth - (iconType ? 8 : 4);
          while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
            text = text.slice(0, -4) + '...';
          }
          pdf.text(text, textStartX, textY);
          textY += 4;
        });

        if (dayHolidays.length > 3) {
          pdf.setTextColor(100, 100, 100);
          pdf.text(`+${dayHolidays.length - 3}`, x + 2, textY);
        }
      }

      currentDay++;
    }
    row++;
  }
}

// Draw icon at given position (for legend markers)
function drawIcon(pdf: jsPDF, iconType: string, cx: number, cy: number, size: number, color?: [number, number, number]) {
  if (color) {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setFillColor(color[0], color[1], color[2]);
  } else {
    pdf.setDrawColor(255, 255, 255);
    pdf.setFillColor(255, 255, 255);
  }
  pdf.setLineWidth(0.4);
  
  const s = size * 0.5; // Scale factor for icon
  
  switch (iconType) {
    case 'flag':
      // Flag: pole + triangular flag
      const poleX = cx - s * 0.4;
      pdf.line(poleX, cy - s, poleX, cy + s); // Pole
      // Flag triangle
      pdf.triangle(
        poleX, cy - s,
        poleX + s * 1.2, cy - s * 0.4,
        poleX, cy + s * 0.2,
        'F'
      );
      break;
    
    case 'cross':
      // Orthodox cross (simple +)
      pdf.line(cx, cy - s, cx, cy + s); // Vertical
      pdf.line(cx - s * 0.7, cy, cx + s * 0.7, cy); // Horizontal
      break;
    
    case 'star':
      // 5-point star
      const points = 5;
      const outerR = s;
      const innerR = s * 0.4;
      const starPoints: [number, number][] = [];
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 2) + (i * Math.PI / points);
        starPoints.push([cx + r * Math.cos(angle), cy - r * Math.sin(angle)]);
      }
      // Draw star as filled polygon
      if (starPoints.length > 2) {
        pdf.setFillColor(255, 255, 255);
        for (let i = 0; i < starPoints.length; i++) {
          const next = starPoints[(i + 1) % starPoints.length];
          pdf.line(starPoints[i][0], starPoints[i][1], next[0], next[1]);
        }
      }
      break;
    
    case 'leaf':
      // Leaf shape: curved teardrop
      pdf.setLineWidth(0.35);
      const leafTop = cy - s;
      const leafBottom = cy + s * 0.6;
      const leafLeft = cx - s * 0.5;
      const leafRight = cx + s * 0.5;
      pdf.line(cx, leafTop, leafLeft, cy);
      pdf.line(leafLeft, cy, cx, leafBottom);
      pdf.line(cx, leafTop, leafRight, cy);
      pdf.line(leafRight, cy, cx, leafBottom);
      pdf.line(cx, leafTop + s * 0.3, cx, leafBottom - s * 0.2);
      break;
    
    case 'flower':
      // Simple flower: circle center with petals
      pdf.setLineWidth(0.3);
      const petalCount = 5;
      const petalR = s * 0.4;
      const centerR = s * 0.25;
      // Draw petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI) / petalCount - Math.PI / 2;
        const px = cx + Math.cos(angle) * petalR;
        const py = cy + Math.sin(angle) * petalR;
        pdf.circle(px, py, petalR * 0.5, 'S');
      }
      // Draw center
      pdf.circle(cx, cy, centerR, 'F');
      break;
  }
  
  pdf.setLineWidth(0.2);
}

// Get icon type for holiday type
function getIconForHolidayType(type: string): string | null {
  switch (type) {
    case 'national': return 'flag';
    case 'orthodox': return 'cross';
    case 'nameday': return 'star';
    case 'folk': return 'flower';
    case 'fasting': return null; // No icon for fasting
    default: return null;
  }
}

function drawLegend(pdf: jsPDF, pageHeight: number) {
  const legendY = pageHeight - 12;
  const startX = 20;
  const markerSize = 5;

  pdf.setFontSize(7);
  pdf.setFont('DejaVuSans', 'normal');

  // Legend items with icon types matching CalendarLegend.tsx
  const lang = i18n.language;
  const items = [
    { label: lang === 'en' ? 'National' : 'Национални', icon: 'flag', color: [180, 50, 80] as const },
    { label: lang === 'en' ? 'Orthodox' : 'Православни', icon: 'cross', color: [180, 140, 40] as const },
    { label: lang === 'en' ? 'Name days' : 'Имени дни', icon: 'star', color: [140, 70, 170] as const },
    { label: lang === 'en' ? 'Folk' : 'Народни', icon: 'flower', color: [200, 110, 40] as const },
    { label: lang === 'en' ? 'Fasting' : 'Пости', icon: 'leaf', color: [120, 80, 160] as const },
  ];

  let x = startX;
  items.forEach(item => {
    // Marker background
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.roundedRect(x, legendY - markerSize / 2, markerSize, markerSize, 0.8, 0.8, 'F');

    // Draw icon inside marker
    drawIcon(pdf, item.icon, x + markerSize / 2, legendY, markerSize);

    // Label
    pdf.setFont('DejaVuSans', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(60, 60, 60);
    pdf.text(item.label, x + markerSize + 2, legendY + 1);

    x += markerSize + 2 + pdf.getTextWidth(item.label) + 12;
  });

  // "Today" indicator - outlined rectangle
  pdf.setDrawColor(180, 50, 80);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(x, legendY - markerSize / 2, markerSize, markerSize, 0.8, 0.8, 'S');
  pdf.setLineWidth(0.2);
  pdf.setTextColor(60, 60, 60);
  pdf.text(isEnglish() ? 'Today' : 'Днес', x + markerSize + 2, legendY + 1);
}

function addMonthPage(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title
  pdf.setFontSize(24);
  pdf.setFont('DejaVuSans', 'bold');
  pdf.setTextColor(0, 0, 0);
  const title = `${getLocalizedMonth(month)} ${year}`;
  pdf.text(title, (pageWidth - pdf.getTextWidth(title)) / 2, 15);

  drawCalendarGrid(pdf, year, month, activeFilters);
  drawLegend(pdf, pageHeight);
}

export async function exportMonthToPDF({ year, month, activeFilters }: PDFExportOptions) {
  const pdf = await initPdfWithCyrillicFont();
  addMonthPage(pdf, year, month, activeFilters);
  pdf.save(`calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`);
}

export async function exportYearToPDF(year: number, activeFilters: string[]) {
  const pdf = await initPdfWithCyrillicFont();
  
  for (let month = 0; month < 12; month++) {
    if (month > 0) pdf.addPage();
    addMonthPage(pdf, year, month, activeFilters);
  }
  
  pdf.save(`calendar-${year}.pdf`);
}

export async function exportAllToPDF(activeFilters: string[]) {
  const pdf = await initPdfWithCyrillicFont();
  const months = getMonthRange();
  
  for (let i = 0; i < months.length; i++) {
    if (i > 0) pdf.addPage();
    addMonthPage(pdf, months[i].year, months[i].month, activeFilters);
  }
  
  pdf.save('bulgarian-calendar-all.pdf');
}
