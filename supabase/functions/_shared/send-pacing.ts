// Pure pacing rules for outbound prospect emails (no Deno/browser APIs, so it is unit-tested).
// Emails drip out one at a time, inside Prague business hours, under daily and hourly caps,
// with a random gap between sends so the mailbox never looks like a bulk blaster.

export interface PacingSettings {
  dailyCap: number
  hourlyCap: number
  minGapMinutes: number
  maxGapMinutes: number
  windowStartMinute: number // minutes after local midnight (Europe/Prague)
  windowEndMinute: number
  weekdaysOnly: boolean
}

export const DEFAULT_PACING: PacingSettings = {
  dailyCap: 25,
  hourlyCap: 8,
  minGapMinutes: 4,
  maxGapMinutes: 7,
  windowStartMinute: 9 * 60,
  windowEndMinute: 16 * 60 + 30,
  weekdaysOnly: true,
}

/** Hard ceilings regardless of what is saved in settings. */
export const MAX_DAILY_CAP = 100
export const MAX_HOURLY_CAP = 15
export const MIN_GAP_FLOOR = 2

export function clampPacing(p: Partial<PacingSettings>): PacingSettings {
  const n = (v: unknown, d: number) => (Number.isFinite(Number(v)) ? Number(v) : d)
  const dailyCap = Math.min(MAX_DAILY_CAP, Math.max(1, Math.round(n(p.dailyCap, DEFAULT_PACING.dailyCap))))
  const hourlyCap = Math.min(MAX_HOURLY_CAP, Math.max(1, Math.round(n(p.hourlyCap, DEFAULT_PACING.hourlyCap))))
  const minGap = Math.max(MIN_GAP_FLOOR, Math.round(n(p.minGapMinutes, DEFAULT_PACING.minGapMinutes)))
  const maxGap = Math.max(minGap, Math.round(n(p.maxGapMinutes, DEFAULT_PACING.maxGapMinutes)))
  let start = Math.min(1439, Math.max(0, Math.round(n(p.windowStartMinute, DEFAULT_PACING.windowStartMinute))))
  let end = Math.min(1440, Math.max(0, Math.round(n(p.windowEndMinute, DEFAULT_PACING.windowEndMinute))))
  if (end <= start) {
    start = DEFAULT_PACING.windowStartMinute
    end = DEFAULT_PACING.windowEndMinute
  }
  return {
    dailyCap,
    hourlyCap,
    minGapMinutes: minGap,
    maxGapMinutes: maxGap,
    windowStartMinute: start,
    windowEndMinute: end,
    weekdaysOnly: p.weekdaysOnly !== false,
  }
}

/** Local Prague clock parts for a given instant. */
export function pragueParts(date: Date): { weekday: number; minute: number; dayKey: string } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Prague',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]))
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    weekday: days[parts.weekday] ?? 0,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
    dayKey: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

export function inSendWindow(now: Date, p: PacingSettings): boolean {
  const { weekday, minute } = pragueParts(now)
  if (p.weekdaysOnly && (weekday === 0 || weekday === 6)) return false
  return minute >= p.windowStartMinute && minute < p.windowEndMinute
}

export type PacingDecision =
  | { send: true }
  | { send: false; reason: 'outside_window' | 'daily_cap' | 'hourly_cap' | 'gap' }

/**
 * Decide whether one more email may go out right now.
 * sentToday / sentLastHour are counts of real (non-test) sends; nextSendAt is the earliest
 * time the next email may leave (set from the random gap after the previous send).
 */
export function canSendNow(
  now: Date,
  p: PacingSettings,
  counts: { sentToday: number; sentLastHour: number },
  nextSendAt: Date | null,
): PacingDecision {
  if (!inSendWindow(now, p)) return { send: false, reason: 'outside_window' }
  if (counts.sentToday >= p.dailyCap) return { send: false, reason: 'daily_cap' }
  if (counts.sentLastHour >= p.hourlyCap) return { send: false, reason: 'hourly_cap' }
  if (nextSendAt && nextSendAt.getTime() > now.getTime()) return { send: false, reason: 'gap' }
  return { send: true }
}

/** Random gap (whole minutes, inclusive) before the next send. rand defaults to Math.random. */
export function nextGapMinutes(p: PacingSettings, rand: () => number = Math.random): number {
  const span = p.maxGapMinutes - p.minGapMinutes
  return p.minGapMinutes + Math.floor(rand() * (span + 1))
}
