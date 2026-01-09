import jsPDF from 'jspdf';
import { BULGARIAN_MONTHS, BULGARIAN_DAYS, getMonthRange, getAllHolidays } from '@/data/bulgarianHolidays';
import { loadDejaVuFont, loadDejaVuFontBold } from './fonts/dejaVuSans';

interface PDFExportOptions {
  year: number;
  month: number;
  activeFilters: string[];
}

const DAYS_OF_WEEK_BG = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

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

  // Day headers - use Bulgarian days
  pdf.setFontSize(10);
  pdf.setFont('DejaVuSans', 'bold');
  DAYS_OF_WEEK_BG.forEach((day, i) => {
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

        dayHolidays.slice(0, 3).forEach(holiday => {
          switch (holiday.type) {
            case 'national': pdf.setTextColor(180, 50, 80); break;
            case 'orthodox': pdf.setTextColor(180, 140, 40); break;
            case 'nameday': pdf.setTextColor(140, 70, 170); break;
            case 'folk': pdf.setTextColor(200, 110, 40); break;
            case 'fasting': pdf.setTextColor(120, 80, 160); break;
            default: pdf.setTextColor(100, 100, 100);
          }

          // Use original Bulgarian text (Cyrillic font is embedded)
          let text = holiday.name;
          const maxWidth = cellWidth - 4;
          while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
            text = text.slice(0, -4) + '...';
          }
          pdf.text(text, x + 2, textY);
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

function drawLegend(pdf: jsPDF, pageHeight: number) {
  const legendY = pageHeight - 12;
  const startX = 20;
  
  pdf.setFontSize(7);
  pdf.setFont('DejaVuSans', 'normal');
  
  // Bulgarian labels for legend - using filled rectangles for better compatibility
  const items = [
    { label: 'Национални', color: [180, 50, 80] as const },
    { label: 'Православни', color: [180, 140, 40] as const },
    { label: 'Имени дни', color: [140, 70, 170] as const },
    { label: 'Народни', color: [200, 110, 40] as const },
    { label: 'Пости', color: [120, 80, 160] as const },
  ];
  
  let x = startX;
  items.forEach(item => {
    // Use filled rectangle instead of circle for better PDF compatibility
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.rect(x - 1.5, legendY - 1.5, 3, 3, 'F');
    pdf.setTextColor(60, 60, 60);
    pdf.text(item.label, x + 4, legendY + 1);
    x += pdf.getTextWidth(item.label) + 15;
  });
  
  // "Today" indicator - outlined rectangle
  pdf.setDrawColor(180, 50, 80);
  pdf.setLineWidth(0.8);
  pdf.rect(x, legendY - 2, 4, 4, 'S');
  pdf.setLineWidth(0.2); // Reset line width
  pdf.setTextColor(60, 60, 60);
  pdf.text('Днес', x + 6, legendY + 1);
}

function addMonthPage(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title - use Bulgarian month name
  pdf.setFontSize(24);
  pdf.setFont('DejaVuSans', 'bold');
  pdf.setTextColor(0, 0, 0);
  const title = `${BULGARIAN_MONTHS[month]} ${year}`;
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
