// Detects ElevenLabs free-tier / unusual-activity lockouts surfaced by the blog-tts edge function.
export const ELEVENLABS_UPGRADE_MESSAGE =
  'ElevenLabs free tier is disabled for this account. Upgrade your ElevenLabs plan to enable audio playback.';

export function isElevenLabsUpgradeError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : typeof err === 'string' ? err : '') || '';
  const m = msg.toLowerCase();
  return (
    m.includes('detected_unusual_activity') ||
    m.includes('free tier usage disabled') ||
    (m.includes('elevenlabs') && m.includes('401'))
  );
}

export function friendlyTtsError(err: unknown): string {
  if (isElevenLabsUpgradeError(err)) return ELEVENLABS_UPGRADE_MESSAGE;
  return err instanceof Error ? err.message : 'Audio generation failed';
}
