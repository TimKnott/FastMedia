/**
 * Quote a value for CSV and neutralise spreadsheet formulas: cells starting
 * with = + - @ tab or carriage return are prefixed with an apostrophe so
 * Excel/Sheets treat them as text instead of executing them.
 */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
