import jsPDF from 'jspdf';
import { BULGARIAN_MONTHS, getMonthRange, getAllHolidays, Holiday } from '@/data/bulgarianHolidays';

const DAYS_OF_WEEK = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];
const DAYS_OF_WEEK_ASCII = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_ASCII = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface PDFExportOptions {
  year: number;
  month: number;
  activeFilters: string[];
}

function getFilteredHolidays(year: number, month: number, day: number, activeFilters: string[]): Holiday[] {
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const holidays = getAllHolidays().filter(h => h.date === dateString);
  return holidays.filter(h => activeFilters.includes(h.type));
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// Convert Cyrillic to ASCII-safe transliteration for PDF
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

// Draw colored square with symbol for legend
function drawLegendIcon(pdf: jsPDF, x: number, y: number, color: number[], symbol: string) {
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.rect(x, y, 4, 4, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(5);
  pdf.text(symbol, x + 2, y + 3, { align: 'center' });
}

export async function exportMonthToPDF({ year, month, activeFilters }: PDFExportOptions) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const title = `${MONTHS_ASCII[month]} ${year}`;
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 20);
  
  // Subtitle with Bulgarian month name (transliterated)
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const subtitle = `(${transliterate(BULGARIAN_MONTHS[month])})`;
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 27);
  pdf.setTextColor(0, 0, 0);
  
  // Calendar grid settings
  const marginLeft = 10;
  const marginTop = 35;
  const cellWidth = (pageWidth - marginLeft * 2) / 7;
  const cellHeight = 22;
  
  // Draw day headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  DAYS_OF_WEEK_ASCII.forEach((day, i) => {
    const x = marginLeft + i * cellWidth;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, marginTop, cellWidth, 8, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, marginTop, cellWidth, 8, 'S');
    pdf.text(day, x + cellWidth / 2, marginTop + 5.5, { align: 'center' });
  });
  
  // Draw calendar days
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  pdf.setFont('helvetica', 'normal');
  
  let currentDay = 1;
  let row = 0;
  
  while (currentDay <= daysInMonth) {
    for (let col = 0; col < 7 && currentDay <= daysInMonth; col++) {
      if (row === 0 && col < firstDay) continue;
      
      const x = marginLeft + col * cellWidth;
      const y = marginTop + 8 + row * cellHeight;
      
      // Cell background
      const dayOfWeek = new Date(year, month, currentDay).getDay();
      if (dayOfWeek === 6) {
        pdf.setFillColor(230, 240, 255);
      } else if (dayOfWeek === 0) {
        pdf.setFillColor(255, 235, 235);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect(x, y, cellWidth, cellHeight, 'F');
      
      // Today highlight
      if (isCurrentMonth && currentDay === today.getDate()) {
        pdf.setDrawColor(180, 50, 80);
        pdf.setLineWidth(0.8);
        pdf.rect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1, 'S');
        pdf.setLineWidth(0.2);
      }
      
      // Cell border
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, y, cellWidth, cellHeight, 'S');
      
      // Day number
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      if (dayOfWeek === 0) {
        pdf.setTextColor(200, 50, 50);
      } else if (dayOfWeek === 6) {
        pdf.setTextColor(50, 100, 200);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(String(currentDay), x + 3, y + 5);
      
      // Holidays
      const holidays = getFilteredHolidays(year, month, currentDay, activeFilters);
      if (holidays.length > 0) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        let textY = y + 9;
        
        holidays.slice(0, 3).forEach(holiday => {
          // Set color based on type
          switch (holiday.type) {
            case 'national':
              pdf.setTextColor(180, 50, 80);
              break;
            case 'orthodox':
              pdf.setTextColor(200, 150, 50);
              break;
            case 'nameday':
              pdf.setTextColor(150, 80, 180);
              break;
            case 'folk':
              pdf.setTextColor(220, 120, 50);
              break;
            case 'fasting':
              pdf.setTextColor(130, 90, 180);
              break;
            default:
              pdf.setTextColor(100, 100, 100);
          }
          
          // Transliterate and truncate text if too long
          let text = transliterate(holiday.name);
          const maxWidth = cellWidth - 4;
          while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
            text = text.slice(0, -4) + '...';
          }
          
          pdf.text(text, x + 2, textY);
          textY += 4;
        });
        
        if (holidays.length > 3) {
          pdf.setTextColor(100, 100, 100);
          pdf.text(`+${holidays.length - 3} more`, x + 2, textY);
        }
      }
      
      pdf.setTextColor(0, 0, 0);
      currentDay++;
    }
    row++;
  }
  
  // Add legend
  const legendY = marginTop + 8 + (row + 1) * cellHeight + 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  const legendItems = [
    { label: 'National', color: [180, 50, 80], symbol: 'N' },
    { label: 'Orthodox', color: [200, 150, 50], symbol: '+' },
    { label: 'Nameday', color: [150, 80, 180], symbol: '*' },
    { label: 'Folk', color: [220, 120, 50], symbol: 'F' },
    { label: 'Fasting', color: [130, 90, 180], symbol: 'L' },
  ];
  
  let legendX = marginLeft;
  legendItems.forEach(item => {
    drawLegendIcon(pdf, legendX, legendY, item.color, item.symbol);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, legendX + 6, legendY + 3);
    legendX += pdf.getTextWidth(item.label) + 15;
  });
  
  // Add "Today" indicator
  pdf.setDrawColor(180, 50, 80);
  pdf.setLineWidth(0.8);
  pdf.rect(legendX, legendY, 4, 4, 'S');
  pdf.setLineWidth(0.2);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Today', legendX + 6, legendY + 3);
  
  pdf.save(`calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`);
}

export async function exportYearToPDF(year: number, activeFilters: string[]) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  for (let month = 0; month < 12; month++) {
    if (month > 0) pdf.addPage();
    await addMonthToPDF(pdf, year, month, activeFilters);
  }
  
  pdf.save(`calendar-${year}.pdf`);
}

export async function exportAllToPDF(activeFilters: string[]) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const months = getMonthRange();
  
  for (let i = 0; i < months.length; i++) {
    if (i > 0) pdf.addPage();
    await addMonthToPDF(pdf, months[i].year, months[i].month, activeFilters);
  }
  
  pdf.save('bulgarian-calendar-all.pdf');
}

async function addMonthToPDF(pdf: jsPDF, year: number, month: number, activeFilters: string[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  const title = `${MONTHS_ASCII[month]} ${year}`;
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 20);
  
  // Subtitle with Bulgarian month name (transliterated)
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const subtitle = `(${transliterate(BULGARIAN_MONTHS[month])})`;
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 27);
  pdf.setTextColor(0, 0, 0);
  
  // Calendar grid settings
  const marginLeft = 10;
  const marginTop = 35;
  const cellWidth = (pageWidth - marginLeft * 2) / 7;
  const cellHeight = 22;
  
  // Draw day headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  DAYS_OF_WEEK_ASCII.forEach((day, i) => {
    const x = marginLeft + i * cellWidth;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, marginTop, cellWidth, 8, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, marginTop, cellWidth, 8, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.text(day, x + cellWidth / 2, marginTop + 5.5, { align: 'center' });
  });
  
  // Draw calendar days
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  pdf.setFont('helvetica', 'normal');
  
  let currentDay = 1;
  let row = 0;
  
  while (currentDay <= daysInMonth) {
    for (let col = 0; col < 7 && currentDay <= daysInMonth; col++) {
      if (row === 0 && col < firstDay) continue;
      
      const x = marginLeft + col * cellWidth;
      const y = marginTop + 8 + row * cellHeight;
      
      // Cell background
      const dayOfWeek = new Date(year, month, currentDay).getDay();
      if (dayOfWeek === 6) {
        pdf.setFillColor(230, 240, 255);
      } else if (dayOfWeek === 0) {
        pdf.setFillColor(255, 235, 235);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect(x, y, cellWidth, cellHeight, 'F');
      
      // Today highlight
      if (isCurrentMonth && currentDay === today.getDate()) {
        pdf.setDrawColor(180, 50, 80);
        pdf.setLineWidth(0.8);
        pdf.rect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1, 'S');
        pdf.setLineWidth(0.2);
      }
      
      // Cell border
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, y, cellWidth, cellHeight, 'S');
      
      // Day number
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      if (dayOfWeek === 0) {
        pdf.setTextColor(200, 50, 50);
      } else if (dayOfWeek === 6) {
        pdf.setTextColor(50, 100, 200);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(String(currentDay), x + 3, y + 5);
      
      // Holidays
      const holidays = getFilteredHolidays(year, month, currentDay, activeFilters);
      if (holidays.length > 0) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        let textY = y + 9;
        
        holidays.slice(0, 3).forEach(holiday => {
          switch (holiday.type) {
            case 'national':
              pdf.setTextColor(180, 50, 80);
              break;
            case 'orthodox':
              pdf.setTextColor(200, 150, 50);
              break;
            case 'nameday':
              pdf.setTextColor(150, 80, 180);
              break;
            case 'folk':
              pdf.setTextColor(220, 120, 50);
              break;
            case 'fasting':
              pdf.setTextColor(130, 90, 180);
              break;
            default:
              pdf.setTextColor(100, 100, 100);
          }
          
          let text = transliterate(holiday.name);
          const maxWidth = cellWidth - 4;
          while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
            text = text.slice(0, -4) + '...';
          }
          
          pdf.text(text, x + 2, textY);
          textY += 4;
        });
        
        if (holidays.length > 3) {
          pdf.setTextColor(100, 100, 100);
          pdf.text(`+${holidays.length - 3} more`, x + 2, textY);
        }
      }
      
      pdf.setTextColor(0, 0, 0);
      currentDay++;
    }
    row++;
  }
  
  // Add legend at bottom
  const legendY = marginTop + 8 + (row + 1) * cellHeight + 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  const legendItems = [
    { label: 'National', color: [180, 50, 80], symbol: 'N' },
    { label: 'Orthodox', color: [200, 150, 50], symbol: '+' },
    { label: 'Nameday', color: [150, 80, 180], symbol: '*' },
    { label: 'Folk', color: [220, 120, 50], symbol: 'F' },
    { label: 'Fasting', color: [130, 90, 180], symbol: 'L' },
  ];
  
  let legendX = marginLeft;
  legendItems.forEach(item => {
    drawLegendIcon(pdf, legendX, legendY, item.color, item.symbol);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, legendX + 6, legendY + 3);
    legendX += pdf.getTextWidth(item.label) + 15;
  });
  
  // Add "Today" indicator
  pdf.setDrawColor(180, 50, 80);
  pdf.setLineWidth(0.8);
  pdf.rect(legendX, legendY, 4, 4, 'S');
  pdf.setLineWidth(0.2);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Today', legendX + 6, legendY + 3);
}
