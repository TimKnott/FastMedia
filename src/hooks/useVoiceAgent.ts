import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceSettings {
  id: number;
  enabled: boolean;
  twilio_number: string | null;
  forward_to_number: string | null;
  monthly_minute_cap: number;
  minutes_used: number;
  usage_month: string;
  elevenlabs_voice_id: string | null;
  flowlu_enabled: boolean;
  updated_at: string;
}

export interface VoiceCall {
  id: string;
  direction: 'inbound' | 'outbound';
  from_number: string | null;
  to_number: string | null;
  status: string;
  language: string | null;
  summary: string | null;
  outcome: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  forwarded: boolean;
  flowlu_synced: boolean;
  started_at: string;
  ended_at: string | null;
  campaign_id: string | null;
}

export interface VoiceCallTurn {
  id: string;
  call_id: string;
  role: 'caller' | 'agent';
  text: string;
  created_at: string;
}

export interface VoiceCampaign {
  id: string;
  name: string;
  script: string;
  status: string;
  created_at: string;
  approved_at: string | null;
}

export interface VoiceScanReport {
  id: string;
  ran_at: string;
  pages_checked: number;
  issues: { path: string; problem: string }[];
  summary: string | null;
  emailed: boolean;
}

export function useVoiceSettings() {
  return useQuery({
    queryKey: ['voice_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data as VoiceSettings | null;
    },
  });
}

export function useUpdateVoiceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<VoiceSettings>) => {
      const { error } = await supabase.from('voice_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['voice_settings'] }),
  });
}

export function useVoiceCalls() {
  return useQuery({
    queryKey: ['voice_calls'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_calls').select('*').order('started_at', { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as VoiceCall[];
    },
  });
}

export function useVoiceCallTurns(callId: string | null) {
  return useQuery({
    queryKey: ['voice_call_turns', callId],
    enabled: !!callId,
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_call_turns').select('*').eq('call_id', callId!).order('created_at');
      if (error) throw error;
      return (data ?? []) as VoiceCallTurn[];
    },
  });
}

export function useVoiceCampaigns() {
  return useQuery({
    queryKey: ['voice_campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_campaigns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as VoiceCampaign[];
    },
  });
}

export function useSaveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: { id?: string; name: string; script: string; status?: string }) => {
      if (campaign.id) {
        const { error } = await supabase.from('voice_campaigns').update({ name: campaign.name, script: campaign.script, status: campaign.status }).eq('id', campaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('voice_campaigns').insert({ name: campaign.name, script: campaign.script, status: campaign.status ?? 'draft' });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['voice_campaigns'] }),
  });
}

export function useApproveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('voice_campaigns').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['voice_campaigns'] }),
  });
}

export function useVoiceScanReports() {
  return useQuery({
    queryKey: ['voice_scan_reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_scan_reports').select('*').order('ran_at', { ascending: false }).limit(60);
      if (error) throw error;
      return (data ?? []) as VoiceScanReport[];
    },
  });
}
