import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  adminMessageUrl,
  findProbeRow,
  resolveProbeOutcome,
  type SendLogRow,
} from '../_shared/deliverability.ts';

const PROBE_ID = 'probe-message-id-0001';

/** Unrelated traffic that is NEWER than the probe rows — must never leak in. */
const noise: SendLogRow[] = [
  { message_id: 'other-aaa', status: 'sent', created_at: '2026-09-03T12:00:00Z' },
  { message_id: 'other-bbb', status: 'dlq', error_message: '550 mailbox unavailable', created_at: '2026-09-03T12:30:00Z' },
  { message_id: 'other-ccc', status: 'bounced', error_message: '554 relay access denied', created_at: '2026-09-03T13:00:00Z' },
  { message_id: null, status: 'sent', created_at: '2026-09-03T13:05:00Z' },
];

Deno.test('unrelated rows alone yield PENDING / UNKNOWN, never PASS', () => {
  const outcome = resolveProbeOutcome(noise, PROBE_ID);
  assertEquals(outcome.matched, false);
  assertEquals(outcome.status, 'unknown');
  assertEquals(outcome.badge, 'PENDING');
  assertEquals(outcome.badgeLabel, 'PENDING / UNKNOWN');
});

Deno.test('only the probe own sent row produces PASS', () => {
  const rows = [
    ...noise,
    { message_id: PROBE_ID, status: 'pending', created_at: '2026-09-03T11:00:00Z' },
    { message_id: PROBE_ID, status: 'sent', created_at: '2026-09-03T11:00:30Z' },
  ];
  const outcome = resolveProbeOutcome(rows, PROBE_ID);
  assertEquals(outcome.matched, true);
  assertEquals(outcome.status, 'sent');
  assertEquals(outcome.badge, 'PASS');
});

Deno.test('probe own failure produces FAIL even when newer unrelated sends succeeded', () => {
  const rows = [
    ...noise,
    { message_id: PROBE_ID, status: 'dlq', error_message: '421 temporary failure', created_at: '2026-09-03T11:10:00Z' },
  ];
  const outcome = resolveProbeOutcome(rows, PROBE_ID);
  assertEquals(outcome.badge, 'FAIL');
  assertEquals(outcome.status, 'dlq');
  assertEquals(outcome.errorMessage, '421 temporary failure');
});

Deno.test('suppression of the probe address is a FAIL', () => {
  const rows = [{ message_id: PROBE_ID, status: 'suppressed', created_at: '2026-09-03T11:00:00Z' }];
  assertEquals(resolveProbeOutcome(rows, PROBE_ID).badge, 'FAIL');
});

Deno.test('non-terminal probe rows do not count as a result', () => {
  const rows = [...noise, { message_id: PROBE_ID, status: 'pending', created_at: '2026-09-03T11:00:00Z' }];
  assertEquals(findProbeRow(rows, PROBE_ID), null);
  assertEquals(resolveProbeOutcome(rows, PROBE_ID).badge, 'PENDING');
});

Deno.test('latest matching terminal row wins', () => {
  const rows = [
    { message_id: PROBE_ID, status: 'failed', error_message: 'first attempt', created_at: '2026-09-03T11:00:00Z' },
    { message_id: PROBE_ID, status: 'sent', created_at: '2026-09-03T11:05:00Z' },
  ];
  assertEquals(resolveProbeOutcome(rows, PROBE_ID).badge, 'PASS');
});

Deno.test('a missing probe message id can never PASS', () => {
  assertEquals(resolveProbeOutcome(noise, null).badge, 'PENDING');
});

Deno.test('admin evidence link targets the exact message', () => {
  assertEquals(
    adminMessageUrl(PROBE_ID),
    'https://www.fastmedia.pro/admin/email-deliverability?message_id=probe-message-id-0001',
  );
});
