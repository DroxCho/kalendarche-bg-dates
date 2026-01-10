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

// Draw icon inside marker at given position
function drawLegendIcon(pdf: jsPDF, iconType: string, cx: number, cy: number, size: number) {
  pdf.setDrawColor(255, 255, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.setLineWidth(0.4);
  
  const s = size * 0.5; // Scale factor for icon inside marker
  
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
        const first = starPoints[0];
        let pathData = `M ${first[0]} ${first[1]}`;
        for (let i = 1; i < starPoints.length; i++) {
          pathData += ` L ${starPoints[i][0]} ${starPoints[i][1]}`;
        }
        pathData += ' Z';
        // Use lines to approximate star
        for (let i = 0; i < starPoints.length; i++) {
          const next = starPoints[(i + 1) % starPoints.length];
          pdf.line(starPoints[i][0], starPoints[i][1], next[0], next[1]);
        }
      }
      break;
    
    case 'leaf':
      // Leaf shape: curved teardrop
      pdf.setLineWidth(0.35);
      // Draw leaf outline as lines approximating a leaf
      const leafTop = cy - s;
      const leafBottom = cy + s * 0.6;
      const leafLeft = cx - s * 0.5;
      const leafRight = cx + s * 0.5;
      // Simple leaf: two curved lines meeting at top and bottom
      pdf.line(cx, leafTop, leafLeft, cy); // Left edge top
      pdf.line(leafLeft, cy, cx, leafBottom); // Left edge bottom
      pdf.line(cx, leafTop, leafRight, cy); // Right edge top
      pdf.line(leafRight, cy, cx, leafBottom); // Right edge bottom
      // Center vein
      pdf.line(cx, leafTop + s * 0.3, cx, leafBottom - s * 0.2);
      break;
  }
  
  pdf.setLineWidth(0.2);
}

function drawLegend(pdf: jsPDF, pageHeight: number) {
  const legendY = pageHeight - 12;
  const startX = 20;
  const markerSize = 5;

  pdf.setFontSize(7);
  pdf.setFont('DejaVuSans', 'normal');

  // Legend items with icon types matching CalendarLegend.tsx
  const items = [
    { label: 'Национални', icon: 'flag', color: [180, 50, 80] as const },
    { label: 'Православни', icon: 'cross', color: [180, 140, 40] as const },
    { label: 'Имени дни', icon: 'star', color: [140, 70, 170] as const },
    { label: 'Народни', icon: 'flag', color: [200, 110, 40] as const },
    { label: 'Пости', icon: 'leaf', color: [120, 80, 160] as const },
  ];

  let x = startX;
  items.forEach(item => {
    // Marker background
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.roundedRect(x, legendY - markerSize / 2, markerSize, markerSize, 0.8, 0.8, 'F');

    // Draw icon inside marker
    drawLegendIcon(pdf, item.icon, x + markerSize / 2, legendY, markerSize);

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
  pdf.text('Днес', x + markerSize + 2, legendY + 1);
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
