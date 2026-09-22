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
}

export interface OutreachMessage {
  id: string;
  prospect_id: string;
  step: number;
  subject: string;
  body: string;
  language: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
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
