export type BookingStatus = 'neu' | 'kontaktiert' | 'angebot_gesendet' | 'in_bearbeitung' | 'abgeschlossen' | 'storniert';
export type BookingPriority = 'niedrig' | 'mittel' | 'hoch' | 'dringend';
export type BookingSource = 'website' | 'telefon' | 'empfehlung' | 'google' | 'social_media';

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  status: BookingStatus;
  priority: BookingPriority;
  source: BookingSource;
  requestedDate: string;
  createdAt: string;
  estimatedValue: string;
  notes: string;
  assignedTo: string;
}

export const statusConfig: Record<BookingStatus, { label: string; variant: string; dot: string }> = {
  neu: { label: 'Neu', variant: 'default', dot: 'bg-primary' },
  kontaktiert: { label: 'Kontaktiert', variant: 'secondary', dot: 'bg-accent' },
  angebot_gesendet: { label: 'Angebot gesendet', variant: 'outline', dot: 'bg-muted-foreground' },
  in_bearbeitung: { label: 'In Bearbeitung', variant: 'secondary', dot: 'bg-accent' },
  abgeschlossen: { label: 'Abgeschlossen', variant: 'outline', dot: 'bg-primary' },
  storniert: { label: 'Storniert', variant: 'destructive', dot: 'bg-destructive' },
};

export const priorityConfig: Record<BookingPriority, { label: string; variant: string }> = {
  niedrig: { label: 'Niedrig', variant: 'outline' },
  mittel: { label: 'Mittel', variant: 'secondary' },
  hoch: { label: 'Hoch', variant: 'default' },
  dringend: { label: 'Dringend', variant: 'destructive' },
};

export const sourceLabel: Record<BookingSource, string> = {
  website: 'Website',
  telefon: 'Telefon',
  empfehlung: 'Empfehlung',
  google: 'Google',
  social_media: 'Social Media',
};

export const pipelineStages: { key: BookingStatus; label: string }[] = [
  { key: 'neu', label: 'Neu' },
  { key: 'kontaktiert', label: 'Kontaktiert' },
  { key: 'angebot_gesendet', label: 'Angebot' },
  { key: 'in_bearbeitung', label: 'In Arbeit' },
  { key: 'abgeschlossen', label: 'Fertig' },
];
