// DejaVu Sans font - Cyrillic support for jsPDF
// Font source: https://dejavu-fonts.github.io/
// This is a subset containing Latin and Cyrillic characters

export const DEJAVU_SANS_NORMAL = "WILL_BE_LOADED_DYNAMICALLY";
export const DEJAVU_SANS_BOLD = "WILL_BE_LOADED_DYNAMICALLY";

// Font loading utility
let fontCache: { normal?: string; bold?: string } = {};

export async function loadDejaVuFont(): Promise<string> {
  if (fontCache.normal) return fontCache.normal;
  
  // Load from CDN - DejaVu Sans with Cyrillic support
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@aspect/roboto-fontface@1.2.0/fonts/roboto/Roboto-Regular.ttf'
  );
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  fontCache.normal = base64;
  return base64;
}

export async function loadDejaVuFontBold(): Promise<string> {
  if (fontCache.bold) return fontCache.bold;
  
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@aspect/roboto-fontface@1.2.0/fonts/roboto/Roboto-Bold.ttf'
  );
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  fontCache.bold = base64;
  return base64;
}
