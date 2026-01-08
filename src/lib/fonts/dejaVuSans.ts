// DejaVu Sans (Cyrillic) for jsPDF
// Kept local to avoid CDN issues and ensure consistent PDF rendering.

let fontCache: { normal?: string; bold?: string } = {};

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function loadFontAsBase64(url: URL): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load font: ${response.status}`);
  return arrayBufferToBase64(await response.arrayBuffer());
}

export async function loadDejaVuFont(): Promise<string> {
  if (fontCache.normal) return fontCache.normal;
  const url = new URL('../../assets/fonts/DejaVuSans.ttf', import.meta.url);
  fontCache.normal = await loadFontAsBase64(url);
  return fontCache.normal;
}

export async function loadDejaVuFontBold(): Promise<string> {
  if (fontCache.bold) return fontCache.bold;
  const url = new URL('../../assets/fonts/DejaVuSans-Bold.ttf', import.meta.url);
  fontCache.bold = await loadFontAsBase64(url);
  return fontCache.bold;
}
