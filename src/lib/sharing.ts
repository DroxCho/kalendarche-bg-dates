import { Holiday, BULGARIAN_MONTHS } from '@/data/bulgarianHolidays';

export function getShareableUrl(date: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?date=${date}`;
}

export function formatShareText(date: Date, holidays: Holiday[]): string {
  const monthName = BULGARIAN_MONTHS[date.getMonth()];
  const dateStr = `${date.getDate()} ${monthName} ${date.getFullYear()}`;
  
  if (holidays.length === 0) {
    return `Български календар - ${dateStr}`;
  }
  
  const holidayNames = holidays.map(h => h.name).join(', ');
  return `${holidayNames} - ${dateStr} | Български календар`;
}

export function shareToFacebook(url: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

export function shareToTwitter(url: string, text: string): void {
  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

export function shareToViber(url: string, text: string): void {
  const shareUrl = `viber://forward?text=${encodeURIComponent(text + ' ' + url)}`;
  window.location.href = shareUrl;
}

export function shareToWhatsApp(url: string, text: string): void {
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(shareUrl, '_blank');
}

export async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export async function shareNative(url: string, title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ url, title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function parseUrlDate(): string | null {
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  return null;
}
