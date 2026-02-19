export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_email: string
          customer_name: string
          duration_minutes: number
          id: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          scheduled_at: string
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          duration_minutes?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          scheduled_at: string
          service: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          duration_minutes?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          scheduled_at?: string
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          lead_id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          lead_id: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_emails: {
        Row: {
          email_type: string
          id: string
          lead_id: string
          metadata: Json | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          email_type: string
          id?: string
          lead_id: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          email_type?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_score_history: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          new_classification: Database["public"]["Enums"]["lead_classification"]
          new_score: number
          old_classification:
            | Database["public"]["Enums"]["lead_classification"]
            | null
          old_score: number
          reason: string | null
          scored_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          new_classification: Database["public"]["Enums"]["lead_classification"]
          new_score: number
          old_classification?:
            | Database["public"]["Enums"]["lead_classification"]
            | null
          old_score?: number
          reason?: string | null
          scored_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          new_classification?: Database["public"]["Enums"]["lead_classification"]
          new_score?: number
          old_classification?:
            | Database["public"]["Enums"]["lead_classification"]
            | null
          old_score?: number
          reason?: string | null
          scored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_analysis: Json | null
          assigned_to: string | null
          classification: Database["public"]["Enums"]["lead_classification"]
          consent_timestamp: string | null
          created_at: string
          email: string
          gdpr_consent: boolean
          id: string
          ip_address: string | null
          labor_hours: number
          language: string
          name: string
          phone: string | null
          quote_monthly: number
          quote_one_time: number
          score: number
          selected_features: Json
          source: string
          special_request: string | null
          status: Database["public"]["Enums"]["lead_status"]
          trade: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          assigned_to?: string | null
          classification?: Database["public"]["Enums"]["lead_classification"]
          consent_timestamp?: string | null
          created_at?: string
          email: string
          gdpr_consent?: boolean
          id?: string
          ip_address?: string | null
          labor_hours?: number
          language?: string
          name: string
          phone?: string | null
          quote_monthly?: number
          quote_one_time?: number
          score?: number
          selected_features?: Json
          source?: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          assigned_to?: string | null
          classification?: Database["public"]["Enums"]["lead_classification"]
          consent_timestamp?: string | null
          created_at?: string
          email?: string
          gdpr_consent?: boolean
          id?: string
          ip_address?: string | null
          labor_hours?: number
          language?: string
          name?: string
          phone?: string | null
          quote_monthly?: number
          quote_one_time?: number
          score?: number
          selected_features?: Json
          source?: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      scoring_rules: {
        Row: {
          condition: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          points: number
          rule_category: string
          rule_name: string
          updated_at: string
        }
        Insert: {
          condition: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          points?: number
          rule_category: string
          rule_name: string
          updated_at?: string
        }
        Update: {
          condition?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          points?: number
          rule_category?: string
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      lead_classification: "cold" | "warm" | "hot" | "high_priority"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      lead_classification: ["cold", "warm", "hot", "high_priority"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
    },
  },
} as const
