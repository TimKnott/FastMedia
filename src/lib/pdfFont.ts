import type jsPDF from 'jspdf';

/**
 * jsPDF's built-in Helvetica is WinAnsi-encoded and cannot draw Czech letters
 * (ř, š, č, ž, ě, ů). We lazily fetch a small Noto Sans subset (Latin +
 * Latin Extended-A) and register it so generated PDFs render Czech correctly.
 */
const FONT_FAMILY = 'NotoSans';
const FILES: Array<{ style: 'normal' | 'bold'; file: string; url: string }> = [
  { style: 'normal', file: 'NotoSans-Regular.ttf', url: '/fonts/NotoSans-Regular.ttf' },
  { style: 'bold', file: 'NotoSans-Bold.ttf', url: '/fonts/NotoSans-Bold.ttf' },
];

const cache = new Map<string, string>();

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

/**
 * Registers the Unicode font on the document.
 * Returns the font family to use — falls back to 'helvetica' if the font
 * files cannot be loaded, so a PDF is always produced.
 */
export const useUnicodeFont = async (doc: jsPDF): Promise<'NotoSans' | 'helvetica'> => {
  try {
    for (const { style, file, url } of FILES) {
      let base64 = cache.get(file);
      if (!base64) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Font ${file} unavailable (${res.status})`);
        base64 = toBase64(await res.arrayBuffer());
        cache.set(file, base64);
      }
      doc.addFileToVFS(file, base64);
      doc.addFont(file, FONT_FAMILY, style);
    }
    doc.setFont(FONT_FAMILY, 'normal');
    return FONT_FAMILY;
  } catch (e) {
    console.error('Unicode PDF font could not be loaded, falling back to Helvetica:', e);
    return 'helvetica';
  }
};
