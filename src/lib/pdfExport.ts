import jsPDF from 'jspdf';
import { BULGARIAN_MONTHS, getMonthRange, getAllHolidays } from '@/data/bulgarianHolidays';

interface PDFExportOptions {
  year: number;
  month: number;
  activeFilters: string[];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// Transliterate Bulgarian to Latin for PDF
function transliterate(text: string): string {
  const map: Record<string, string> = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
    'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': '', 'ю': 'yu', 'я': 'ya'
  };
  return text.split('').map(char => map[char] || char).join('');
}

function transliterateMonth(month: number): string {
  const months = [
    'Yanuari', 'Fevruari', 'Mart', 'April', 'May', 'Yuni',
    'Yuli', 'Avgust', 'Septemvri', 'Oktomvri', 'Noemvri', 'Dekemvri'
  ];
  return months[month];
}

function drawCalendarGrid(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 10;
  const marginTop = 25;
  const cellWidth = (pageWidth - marginLeft * 2) / 7;
  const cellHeight = 24;

  // Day headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  DAYS_OF_WEEK.forEach((day, i) => {
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
      pdf.setFont('helvetica', 'bold');
      if (dayOfWeek === 0) pdf.setTextColor(200, 50, 50);
      else if (dayOfWeek === 6) pdf.setTextColor(50, 100, 200);
      else pdf.setTextColor(50, 50, 50);
      pdf.text(String(currentDay), x + 3, y + 6);

      // Holidays
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      const dayHolidays = allHolidays.filter(h => h.date === dateStr && activeFilters.includes(h.type));

      if (dayHolidays.length > 0) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
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

          let text = transliterate(holiday.name);
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
  pdf.setFont('helvetica', 'normal');
  
  const items = [
    { label: 'National', color: [180, 50, 80] as const },
    { label: 'Orthodox', color: [180, 140, 40] as const },
    { label: 'Nameday', color: [140, 70, 170] as const },
    { label: 'Folk', color: [200, 110, 40] as const },
    { label: 'Fasting', color: [120, 80, 160] as const },
  ];
  
  let x = startX;
  items.forEach(item => {
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.circle(x, legendY, 2, 'F');
    pdf.setTextColor(60, 60, 60);
    pdf.text(item.label, x + 4, legendY + 1);
    x += pdf.getTextWidth(item.label) + 15;
  });
  
  pdf.setDrawColor(180, 50, 80);
  pdf.setLineWidth(0.8);
  pdf.rect(x, legendY - 2, 4, 4, 'S');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Today', x + 6, legendY + 1);
}

function addMonthPage(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  const title = `${transliterateMonth(month)} ${year}`;
  pdf.text(title, (pageWidth - pdf.getTextWidth(title)) / 2, 15);

  drawCalendarGrid(pdf, year, month, activeFilters);
  drawLegend(pdf, pageHeight);
}

export function exportMonthToPDF({ year, month, activeFilters }: PDFExportOptions) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  addMonthPage(pdf, year, month, activeFilters);
  pdf.save(`calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`);
}

export function exportYearToPDF(year: number, activeFilters: string[]) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  for (let month = 0; month < 12; month++) {
    if (month > 0) pdf.addPage();
    addMonthPage(pdf, year, month, activeFilters);
  }
  
  pdf.save(`calendar-${year}.pdf`);
}

export function exportAllToPDF(activeFilters: string[]) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const months = getMonthRange();
  
  for (let i = 0; i < months.length; i++) {
    if (i > 0) pdf.addPage();
    addMonthPage(pdf, months[i].year, months[i].month, activeFilters);
  }
  
  pdf.save('bulgarian-calendar-all.pdf');
}
