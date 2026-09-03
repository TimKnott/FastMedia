// Shared deliverability result logic.
// The probe badge must ONLY ever reflect rows whose message_id exactly matches
// the ID returned when the probe was queued. Unrelated (even newer) rows in
// email_send_log must never influence the outcome.

export type ProbeBadge = 'PASS' | 'FAIL' | 'PENDING';

export const TERMINAL_STATUSES = [
  'sent',
  'failed',
  'dlq',
  'suppressed',
  'bounced',
  'complained',
] as const;

export const FAILURE_STATUSES = ['failed', 'dlq', 'bounced', 'complained', 'suppressed'] as const;

export interface SendLogRow {
  message_id?: string | null;
  status?: string | null;
  error_message?: string | null;
  created_at?: string | null;
}

export interface ProbeOutcome {
  /** Terminal status of the probe's own row, or 'unknown' when none was found. */
  status: string;
  badge: ProbeBadge;
  badgeLabel: string;
  errorMessage: string | null;
  matched: boolean;
}

export function isTerminalStatus(status?: string | null): boolean {
  return !!status && (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function isFailureStatus(status?: string | null): boolean {
  return !!status && (FAILURE_STATUSES as readonly string[]).includes(status);
}

/** Latest row (by created_at) whose message_id matches exactly. */
export function findProbeRow(rows: SendLogRow[], probeMessageId: string | null): SendLogRow | null {
  if (!probeMessageId) return null;
  const matches = rows.filter((r) => r.message_id === probeMessageId && isTerminalStatus(r.status));
  if (matches.length === 0) return null;
  return matches
    .slice()
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];
}

export function badgeForStatus(status: string): ProbeBadge {
  if (status === 'sent') return 'PASS';
  if (isFailureStatus(status)) return 'FAIL';
  return 'PENDING';
}

export function badgeLabel(badge: ProbeBadge): string {
  return badge === 'PENDING' ? 'PENDING / UNKNOWN' : badge;
}

/**
 * Resolve the probe outcome from raw log rows.
 * No matching terminal row => 'unknown' (never inherits unrelated data).
 */
export function resolveProbeOutcome(
  rows: SendLogRow[],
  probeMessageId: string | null,
  fallbackError: string | null = null,
): ProbeOutcome {
  const row = findProbeRow(rows, probeMessageId);
  if (!row) {
    return {
      status: 'unknown',
      badge: 'PENDING',
      badgeLabel: badgeLabel('PENDING'),
      errorMessage:
        fallbackError ??
        'No email_send_log row matching this probe message_id reached a terminal state within the polling window.',
      matched: false,
    };
  }
  const status = row.status as string;
  const badge = badgeForStatus(status);
  return {
    status,
    badge,
    badgeLabel: badgeLabel(badge),
    errorMessage: fallbackError ?? row.error_message ?? null,
    matched: true,
  };
}

export function adminMessageUrl(messageId: string | null, base = 'https://www.fastmedia.pro'): string {
  const path = '/admin/email-deliverability';
  if (!messageId) return `${base}${path}`;
  return `${base}${path}?message_id=${encodeURIComponent(messageId)}`;
}
