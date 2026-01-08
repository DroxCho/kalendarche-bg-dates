// Cyrillic font support for jsPDF
// Using Noto Sans which has proper unicode cmap tables

let fontCache: { normal?: string; bold?: string } = {};

export async function loadDejaVuFont(): Promise<string> {
  if (fontCache.normal) return fontCache.normal;
  
  // Use Noto Sans from Google Fonts with proper Cyrillic support
  const response = await fetch(
    'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d41P6zHtY.ttf'
  );
  
  if (!response.ok) {
    throw new Error('Failed to load font');
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  fontCache.normal = base64;
  return base64;
}

export async function loadDejaVuFontBold(): Promise<string> {
  if (fontCache.bold) return fontCache.bold;
  
  // Use Noto Sans Bold from Google Fonts
  const response = await fetch(
    'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAaAu9d41P6zHtY.ttf'
  );
  
  if (!response.ok) {
    throw new Error('Failed to load bold font');
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  fontCache.bold = base64;
  return base64;
}
