/** Fail closed when the shared objection list cannot be checked. */
export function suppressionGate(found: boolean, lookupFailed: boolean): { blocked: boolean; reason: string | null } {
  if (lookupFailed) return { blocked: true, reason: 'suppression_check_failed' };
  if (found) return { blocked: true, reason: 'globally_suppressed' };
  return { blocked: false, reason: null };
}