import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProspectResearch {
  summary?: string;
  industry?: string;
  signals?: string[];
  pain_points?: string[];
  hooks?: string[];
  recommended_offer?: string;
  fit_score?: number;
  researched_at?: string;
}

export interface Prospect {
  id: string;
  company: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  region: string | null;
  trade: string | null;
  language: string;
  source: string;
  notes: string | null;
  research: ProspectResearch;
  fit_score: number;
  status: string;
  last_contacted_at: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
  linkedin_url: string | null;
  getsales_lead_id: string | null;
  getsales_synced_at: string | null;
  getsales_sync_status: string;
  getsales_sync_error: string | null;
  getsales_sync_attempts: number;
  getsales_last_attempt_at: string | null;
}

export interface OutreachMessage {
  id: string;
  prospect_id: string;
  step: number;
  subject: string;
  body: string;
  language: string;
  status: string;
  proposed_at: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  edited_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  test_mode: boolean;
  delivered_to: string | null;
  created_at: string;
}

export interface OutreachEvent {
  id: string;
  prospect_id: string | null;
  message_id: string | null;
  step: number | null;
  action: string;
  actor_type: string;
  actor_label: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface OutreachSettings {
  id: number;
  test_mode: boolean;
  test_inbox: string | null;
  simulate_visitors: boolean;
  follow_up_days_step2: number;
  follow_up_days_step3: number;
  getsales_enabled: boolean;
  getsales_base_url: string | null;
  getsales_list_id: string | null;
  getsales_sender_id: string | null;
  getsales_automation_id: string | null;
  updated_at: string;
}

export interface VisitorSignal {
  id: string;
  kind: string;
  page_path: string;
  form_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  language: string;
  payload: Record<string, unknown>;
  recovery_status: string;
  recovered_at: string | null;
  alerted_at: string | null;
  simulated: boolean;
  created_at: string;
}

// Generated Supabase types lag behind these tables, so the client is cast locally.
const client = supabase as unknown as { from: (table: string) => any };

export const prospectsTable = () => client.from('prospects');
export const outreachTable = () => client.from('outreach_messages');
export const visitorSignalsTable = () => client.from('visitor_signals');

export const useProspects = () =>
  useQuery({
    queryKey: ['prospects'],
    queryFn: async (): Promise<Prospect[]> => {
      const { data, error } = await client
        .from('prospects')
        .select('*')
        .order('fit_score', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Prospect[];
    },
  });

export const useOutreachMessages = () =>
  useQuery({
    queryKey: ['outreach-messages'],
    queryFn: async (): Promise<OutreachMessage[]> => {
      const { data, error } = await client
        .from('outreach_messages')
        .select('*')
        .order('prospect_id')
        .order('step');
      if (error) throw error;
      return (data ?? []) as OutreachMessage[];
    },
  });

export const useVisitorSignals = () =>
  useQuery({
    queryKey: ['visitor-signals'],
    queryFn: async (): Promise<VisitorSignal[]> => {
      const { data, error } = await client
        .from('visitor_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as VisitorSignal[];
    },
  });

export const useOutreachEvents = () =>
  useQuery({
    queryKey: ['outreach-events'],
    queryFn: async (): Promise<OutreachEvent[]> => {
      const { data, error } = await client
        .from('outreach_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as OutreachEvent[];
    },
  });

export const useOutreachSettings = () =>
  useQuery({
    queryKey: ['outreach-settings'],
    queryFn: async (): Promise<OutreachSettings | null> => {
      const { data, error } = await client.from('outreach_settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return (data ?? null) as OutreachSettings | null;
    },
  });

export const outreachSettingsTable = () => client.from('outreach_settings');
