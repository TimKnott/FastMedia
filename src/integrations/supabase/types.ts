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
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
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
      blog_generation_log: {
        Row: {
          completed_at: string | null
          error: string | null
          id: string
          keyword: string | null
          model: string | null
          notes: string | null
          post_id: string | null
          status: string
          topic: string | null
          triggered_at: string
        }
        Insert: {
          completed_at?: string | null
          error?: string | null
          id?: string
          keyword?: string | null
          model?: string | null
          notes?: string | null
          post_id?: string | null
          status?: string
          topic?: string | null
          triggered_at?: string
        }
        Update: {
          completed_at?: string | null
          error?: string | null
          id?: string
          keyword?: string | null
          model?: string | null
          notes?: string | null
          post_id?: string | null
          status?: string
          topic?: string | null
          triggered_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          ai_generated: boolean
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          audio_generated_at: string | null
          audio_url: string | null
          author: string
          auto_generated: boolean
          category: string
          content: Json
          created_at: string
          created_by: string | null
          excerpt: Json
          faq_schema: Json | null
          generation_metadata: Json | null
          hero_image_url: string | null
          howto_schema: Json | null
          id: string
          published_at: string | null
          read_time_minutes: number
          rejection_reason: string | null
          scheduled_publish_at: string | null
          seo_keywords: Json
          slug: string
          status: string
          tags: Json
          title: Json
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          audio_generated_at?: string | null
          audio_url?: string | null
          author?: string
          auto_generated?: boolean
          category?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: Json
          faq_schema?: Json | null
          generation_metadata?: Json | null
          hero_image_url?: string | null
          howto_schema?: Json | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number
          rejection_reason?: string | null
          scheduled_publish_at?: string | null
          seo_keywords?: Json
          slug: string
          status?: string
          tags?: Json
          title?: Json
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          audio_generated_at?: string | null
          audio_url?: string | null
          author?: string
          auto_generated?: boolean
          category?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: Json
          faq_schema?: Json | null
          generation_metadata?: Json | null
          hero_image_url?: string | null
          howto_schema?: Json | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number
          rejection_reason?: string | null
          scheduled_publish_at?: string | null
          seo_keywords?: Json
          slug?: string
          status?: string
          tags?: Json
          title?: Json
          updated_at?: string
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
      client_projects: {
        Row: {
          agreement_ack_ip: string | null
          agreement_ack_user_agent: string | null
          agreement_acknowledged_at: string | null
          agreement_signed_off: boolean
          agreement_signed_off_at: string | null
          agreement_signed_off_by: string | null
          agreement_template: string | null
          agreement_terms: Json
          ai_cost_per_unit: number
          ai_token_ratio: number
          ai_units_per_user: number
          brand_color: string | null
          brand_color_secondary: string | null
          brand_notes: string | null
          client_email: string
          client_name: string
          created_at: string
          created_by: string | null
          currency: string
          deposit_paid_amount: number | null
          deposit_paid_at: string | null
          deposit_pct: number
          dev_fee: number
          draft_emailed_at: string | null
          existing_website_url: string | null
          fee_line_items: Json
          hosting_fee_yearly: number
          id: string
          late_penalty_pct_per_day: number
          logo_url: string | null
          name: string
          slug: string | null
          staging_url: string
          status: string
          updated_at: string
        }
        Insert: {
          agreement_ack_ip?: string | null
          agreement_ack_user_agent?: string | null
          agreement_acknowledged_at?: string | null
          agreement_signed_off?: boolean
          agreement_signed_off_at?: string | null
          agreement_signed_off_by?: string | null
          agreement_template?: string | null
          agreement_terms?: Json
          ai_cost_per_unit?: number
          ai_token_ratio?: number
          ai_units_per_user?: number
          brand_color?: string | null
          brand_color_secondary?: string | null
          brand_notes?: string | null
          client_email: string
          client_name: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deposit_paid_amount?: number | null
          deposit_paid_at?: string | null
          deposit_pct?: number
          dev_fee?: number
          draft_emailed_at?: string | null
          existing_website_url?: string | null
          fee_line_items?: Json
          hosting_fee_yearly?: number
          id?: string
          late_penalty_pct_per_day?: number
          logo_url?: string | null
          name: string
          slug?: string | null
          staging_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          agreement_ack_ip?: string | null
          agreement_ack_user_agent?: string | null
          agreement_acknowledged_at?: string | null
          agreement_signed_off?: boolean
          agreement_signed_off_at?: string | null
          agreement_signed_off_by?: string | null
          agreement_template?: string | null
          agreement_terms?: Json
          ai_cost_per_unit?: number
          ai_token_ratio?: number
          ai_units_per_user?: number
          brand_color?: string | null
          brand_color_secondary?: string | null
          brand_notes?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deposit_paid_amount?: number | null
          deposit_paid_at?: string | null
          deposit_pct?: number
          dev_fee?: number
          draft_emailed_at?: string | null
          existing_website_url?: string | null
          fee_line_items?: Json
          hosting_fee_yearly?: number
          id?: string
          late_penalty_pct_per_day?: number
          logo_url?: string | null
          name?: string
          slug?: string | null
          staging_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          currency: string
          discount_amount: number
          email: string | null
          final_amount: number
          id: string
          lead_id: string | null
          metadata: Json | null
          original_amount: number
        }
        Insert: {
          coupon_id: string
          created_at?: string
          currency?: string
          discount_amount?: number
          email?: string | null
          final_amount?: number
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          original_amount?: number
        }
        Update: {
          coupon_id?: string
          created_at?: string
          currency?: string
          discount_amount?: number
          email?: string | null
          final_amount?: number
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          original_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applies_to: string
          campaign_name: string | null
          code: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_amount: number
          updated_at: string
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to?: string
          campaign_name?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to?: string
          campaign_name?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      custom_demos: {
        Row: {
          calculator_prompts: Json
          created_at: string
          created_by: string | null
          description: Json
          display_order: number
          faqs: Json
          gallery_images: Json
          gradient: string
          hero_image_url: string | null
          icon: string
          id: string
          is_active: boolean
          name: Json
          services: Json
          tagline: Json
          trade_id: string
          updated_at: string
        }
        Insert: {
          calculator_prompts?: Json
          created_at?: string
          created_by?: string | null
          description?: Json
          display_order?: number
          faqs?: Json
          gallery_images?: Json
          gradient?: string
          hero_image_url?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: Json
          services?: Json
          tagline?: Json
          trade_id: string
          updated_at?: string
        }
        Update: {
          calculator_prompts?: Json
          created_at?: string
          created_by?: string | null
          description?: Json
          display_order?: number
          faqs?: Json
          gallery_images?: Json
          gradient?: string
          hero_image_url?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: Json
          services?: Json
          tagline?: Json
          trade_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      eat_audits: {
        Row: {
          authority_score: number | null
          expertise_score: number | null
          id: string
          overall_score: number
          property_id: string
          run_at: string
          signals: Json
          trust_score: number | null
        }
        Insert: {
          authority_score?: number | null
          expertise_score?: number | null
          id?: string
          overall_score?: number
          property_id: string
          run_at?: string
          signals?: Json
          trust_score?: number | null
        }
        Update: {
          authority_score?: number | null
          expertise_score?: number | null
          id?: string
          overall_score?: number
          property_id?: string
          run_at?: string
          signals?: Json
          trust_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eat_audits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      embed_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          placement: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          placement?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          placement?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          hire_date: string
          id: string
          notes: string | null
          phone: string | null
          position: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          hire_date?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          hire_date?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          ai_reply: string | null
          body_html: string | null
          body_plain: string | null
          created_at: string
          error_message: string | null
          from_address: string
          id: string
          mailgun_event_id: string | null
          processed_at: string | null
          status: string
          subject: string | null
          to_address: string
        }
        Insert: {
          ai_reply?: string | null
          body_html?: string | null
          body_plain?: string | null
          created_at?: string
          error_message?: string | null
          from_address: string
          id?: string
          mailgun_event_id?: string | null
          processed_at?: string | null
          status?: string
          subject?: string | null
          to_address: string
        }
        Update: {
          ai_reply?: string | null
          body_html?: string | null
          body_plain?: string | null
          created_at?: string
          error_message?: string | null
          from_address?: string
          id?: string
          mailgun_event_id?: string | null
          processed_at?: string | null
          status?: string
          subject?: string | null
          to_address?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          due_at: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          items: Json
          lead_id: string | null
          notes: string | null
          paid_at: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          due_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          items?: Json
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          due_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          items?: Json
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
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
          budget_range: string | null
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
          budget_range?: string | null
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
          budget_range?: string | null
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
      legal_documents: {
        Row: {
          content: string
          created_at: string
          effective_date: string
          id: string
          published: boolean
          region: string
          slug: string
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          effective_date?: string
          id?: string
          published?: boolean
          region?: string
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          published?: boolean
          region?: string
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string
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
      page_seo: {
        Row: {
          description: string | null
          id: string
          language: string
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_path: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          language?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_path: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          language?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_path?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount_total: number
          cart: Json | null
          created_at: string | null
          currency: string
          customer_email: string | null
          environment: string
          id: string
          metadata: Json | null
          price_id: string | null
          product_id: string | null
          source: string
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_total?: number
          cart?: Json | null
          created_at?: string | null
          currency?: string
          customer_email?: string | null
          environment?: string
          id?: string
          metadata?: Json | null
          price_id?: string | null
          product_id?: string | null
          source?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number
          cart?: Json | null
          created_at?: string | null
          currency?: string
          customer_email?: string | null
          environment?: string
          id?: string
          metadata?: Json | null
          price_id?: string | null
          product_id?: string | null
          source?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_access_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          email_code_expires_at: string | null
          email_code_hash: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          project_id: string
          require_email_code: boolean
          revoked_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          email_code_expires_at?: string | null
          email_code_hash?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          project_id: string
          require_email_code?: boolean
          revoked_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          email_code_expires_at?: string | null
          email_code_hash?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          project_id?: string
          require_email_code?: boolean
          revoked_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_access_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_audit_log: {
        Row: {
          action: string
          actor_label: string | null
          actor_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          project_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_label?: string | null
          actor_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          project_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_label?: string | null
          actor_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          project_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_audit_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          author_email: string | null
          author_name: string | null
          author_type: string
          color: string
          created_at: string
          id: string
          message: string
          page_path: string
          project_id: string
          resolved_at: string | null
          selector: string | null
          status: string
          updated_at: string
          viewport_h: number | null
          viewport_w: number | null
          x_pct: number | null
          y_pct: number | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          author_type?: string
          color?: string
          created_at?: string
          id?: string
          message: string
          page_path?: string
          project_id: string
          resolved_at?: string | null
          selector?: string | null
          status?: string
          updated_at?: string
          viewport_h?: number | null
          viewport_w?: number | null
          x_pct?: number | null
          y_pct?: number | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          author_type?: string
          color?: string
          created_at?: string
          id?: string
          message?: string
          page_path?: string
          project_id?: string
          resolved_at?: string | null
          selector?: string | null
          status?: string
          updated_at?: string
          viewport_h?: number | null
          viewport_w?: number | null
          x_pct?: number | null
          y_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          notes: string | null
          project_id: string
          screenshot_url: string | null
          staging_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          notes?: string | null
          project_id: string
          screenshot_url?: string | null
          staging_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          notes?: string | null
          project_id?: string
          screenshot_url?: string | null
          staging_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          frequency: string
          id: string
          is_active: boolean
          items: Json
          last_invoiced_at: string | null
          next_invoice_at: string
          notes: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          frequency?: string
          id?: string
          is_active?: boolean
          items?: Json
          last_invoiced_at?: string | null
          next_invoice_at?: string
          notes?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          frequency?: string
          id?: string
          is_active?: boolean
          items?: Json
          last_invoiced_at?: string | null
          next_invoice_at?: string
          notes?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      seo_alerts_log: {
        Row: {
          alert_type: string
          body: string | null
          id: string
          metadata: Json | null
          property_id: string | null
          recipient: string | null
          sent_at: string
          severity: string
          status: string
          subject: string
        }
        Insert: {
          alert_type: string
          body?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
          recipient?: string | null
          sent_at?: string
          severity?: string
          status?: string
          subject: string
        }
        Update: {
          alert_type?: string
          body?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
          recipient?: string | null
          sent_at?: string
          severity?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      seo_audit_findings: {
        Row: {
          check_id: string
          created_at: string
          current_value: string | null
          expected_value: string | null
          first_seen_at: string
          id: string
          ignored_at: string | null
          ignored_by: string | null
          ignored_reason: string | null
          last_seen_at: string
          message: string | null
          resolved_at: string | null
          run_id: string | null
          severity: string
          updated_at: string
          url: string
        }
        Insert: {
          check_id: string
          created_at?: string
          current_value?: string | null
          expected_value?: string | null
          first_seen_at?: string
          id?: string
          ignored_at?: string | null
          ignored_by?: string | null
          ignored_reason?: string | null
          last_seen_at?: string
          message?: string | null
          resolved_at?: string | null
          run_id?: string | null
          severity?: string
          updated_at?: string
          url: string
        }
        Update: {
          check_id?: string
          created_at?: string
          current_value?: string | null
          expected_value?: string | null
          first_seen_at?: string
          id?: string
          ignored_at?: string | null
          ignored_by?: string | null
          ignored_reason?: string | null
          last_seen_at?: string
          message?: string | null
          resolved_at?: string | null
          run_id?: string | null
          severity?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_audit_findings_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "seo_audit_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_audit_runs: {
        Row: {
          finished_at: string | null
          health_score: number | null
          id: string
          issues_found: number
          notes: string | null
          started_at: string
          triggered_by: string
          urls_checked: number
        }
        Insert: {
          finished_at?: string | null
          health_score?: number | null
          id?: string
          issues_found?: number
          notes?: string | null
          started_at?: string
          triggered_by?: string
          urls_checked?: number
        }
        Update: {
          finished_at?: string | null
          health_score?: number | null
          id?: string
          issues_found?: number
          notes?: string | null
          started_at?: string
          triggered_by?: string
          urls_checked?: number
        }
        Relationships: []
      }
      seo_backlinks: {
        Row: {
          authority_score: number | null
          follow_ratio: number | null
          id: string
          lost_links: number | null
          new_links: number | null
          property_id: string
          referring_domains: number | null
          snapshot_at: string
          spam_score: number | null
          top_anchors: Json | null
          top_referring: Json | null
          total_backlinks: number | null
        }
        Insert: {
          authority_score?: number | null
          follow_ratio?: number | null
          id?: string
          lost_links?: number | null
          new_links?: number | null
          property_id: string
          referring_domains?: number | null
          snapshot_at?: string
          spam_score?: number | null
          top_anchors?: Json | null
          top_referring?: Json | null
          total_backlinks?: number | null
        }
        Update: {
          authority_score?: number | null
          follow_ratio?: number | null
          id?: string
          lost_links?: number | null
          new_links?: number | null
          property_id?: string
          referring_domains?: number | null
          snapshot_at?: string
          spam_score?: number | null
          top_anchors?: Json | null
          top_referring?: Json | null
          total_backlinks?: number | null
        }
        Relationships: []
      }
      seo_broken_links: {
        Row: {
          error: string | null
          first_seen: string
          id: string
          last_seen: string
          property_id: string
          resolved_at: string | null
          source_url: string
          status_code: number | null
          target_url: string
        }
        Insert: {
          error?: string | null
          first_seen?: string
          id?: string
          last_seen?: string
          property_id: string
          resolved_at?: string | null
          source_url: string
          status_code?: number | null
          target_url: string
        }
        Update: {
          error?: string | null
          first_seen?: string
          id?: string
          last_seen?: string
          property_id?: string
          resolved_at?: string | null
          source_url?: string
          status_code?: number | null
          target_url?: string
        }
        Relationships: []
      }
      seo_competitors: {
        Row: {
          competitor_domain: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          metrics: Json | null
          property_id: string
          source: string | null
        }
        Insert: {
          competitor_domain: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          metrics?: Json | null
          property_id: string
          source?: string | null
        }
        Update: {
          competitor_domain?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          metrics?: Json | null
          property_id?: string
          source?: string | null
        }
        Relationships: []
      }
      seo_content_freshness: {
        Row: {
          checked_at: string
          clicks_28d: number | null
          days_since_update: number | null
          id: string
          impressions_28d: number | null
          last_modified: string | null
          property_id: string
          recommendation: string | null
          trend: string | null
          url: string
          word_count: number | null
        }
        Insert: {
          checked_at?: string
          clicks_28d?: number | null
          days_since_update?: number | null
          id?: string
          impressions_28d?: number | null
          last_modified?: string | null
          property_id: string
          recommendation?: string | null
          trend?: string | null
          url: string
          word_count?: number | null
        }
        Update: {
          checked_at?: string
          clicks_28d?: number | null
          days_since_update?: number | null
          id?: string
          impressions_28d?: number | null
          last_modified?: string | null
          property_id?: string
          recommendation?: string | null
          trend?: string | null
          url?: string
          word_count?: number | null
        }
        Relationships: []
      }
      seo_ga4_snapshots: {
        Row: {
          created_at: string
          high_exit_pages: Json | null
          id: string
          metrics: Json
          property_id: string
          top_pages: Json | null
          week_start: string
        }
        Insert: {
          created_at?: string
          high_exit_pages?: Json | null
          id?: string
          metrics?: Json
          property_id: string
          top_pages?: Json | null
          week_start: string
        }
        Update: {
          created_at?: string
          high_exit_pages?: Json | null
          id?: string
          metrics?: Json
          property_id?: string
          top_pages?: Json | null
          week_start?: string
        }
        Relationships: []
      }
      seo_index_status: {
        Row: {
          checked_at: string
          coverage_state: string | null
          id: string
          indexed: boolean | null
          last_crawl_time: string | null
          page_fetch_state: string | null
          property_id: string
          raw: Json | null
          robots_txt_state: string | null
          url: string
        }
        Insert: {
          checked_at?: string
          coverage_state?: string | null
          id?: string
          indexed?: boolean | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          property_id: string
          raw?: Json | null
          robots_txt_state?: string | null
          url: string
        }
        Update: {
          checked_at?: string
          coverage_state?: string | null
          id?: string
          indexed?: boolean | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          property_id?: string
          raw?: Json | null
          robots_txt_state?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_index_status_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_issues: {
        Row: {
          category: string
          created_at: string
          detail: string | null
          id: string
          metadata: Json | null
          property_id: string
          resolved_at: string | null
          severity: string
          snoozed_until: string | null
          status: string
          suggested_fix: string | null
          title: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          detail?: string | null
          id?: string
          metadata?: Json | null
          property_id: string
          resolved_at?: string | null
          severity: string
          snoozed_until?: string | null
          status?: string
          suggested_fix?: string | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          detail?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string
          resolved_at?: string | null
          severity?: string
          snoozed_until?: string | null
          status?: string
          suggested_fix?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keyword_gaps: {
        Row: {
          competitor_domain: string | null
          competitor_position: number | null
          cpc: number | null
          discovered_at: string
          id: string
          kdi: number | null
          keyword: string
          our_position: number | null
          property_id: string
          volume: number | null
        }
        Insert: {
          competitor_domain?: string | null
          competitor_position?: number | null
          cpc?: number | null
          discovered_at?: string
          id?: string
          kdi?: number | null
          keyword: string
          our_position?: number | null
          property_id: string
          volume?: number | null
        }
        Update: {
          competitor_domain?: string | null
          competitor_position?: number | null
          cpc?: number | null
          discovered_at?: string
          id?: string
          kdi?: number | null
          keyword?: string
          our_position?: number | null
          property_id?: string
          volume?: number | null
        }
        Relationships: []
      }
      seo_pagespeed: {
        Row: {
          accessibility: number | null
          audited_at: string
          best_practices: number | null
          cls: number | null
          fcp_ms: number | null
          id: string
          inp_ms: number | null
          lcp_ms: number | null
          performance: number | null
          property_id: string
          raw: Json | null
          seo: number | null
          strategy: string
          ttfb_ms: number | null
          url: string
        }
        Insert: {
          accessibility?: number | null
          audited_at?: string
          best_practices?: number | null
          cls?: number | null
          fcp_ms?: number | null
          id?: string
          inp_ms?: number | null
          lcp_ms?: number | null
          performance?: number | null
          property_id: string
          raw?: Json | null
          seo?: number | null
          strategy?: string
          ttfb_ms?: number | null
          url: string
        }
        Update: {
          accessibility?: number | null
          audited_at?: string
          best_practices?: number | null
          cls?: number | null
          fcp_ms?: number | null
          id?: string
          inp_ms?: number | null
          lcp_ms?: number | null
          performance?: number | null
          property_id?: string
          raw?: Json | null
          seo?: number | null
          strategy?: string
          ttfb_ms?: number | null
          url?: string
        }
        Relationships: []
      }
      seo_properties: {
        Row: {
          alert_email: string | null
          created_at: string
          created_by: string | null
          display_name: string
          ga4_property_id: string | null
          id: string
          is_active: boolean
          last_backlinks_at: string | null
          last_brokenlinks_at: string | null
          last_eat_audit_at: string | null
          last_freshness_at: string | null
          last_ga4_at: string | null
          last_pagespeed_at: string | null
          last_synced_at: string | null
          pagespeed_urls: Json
          site_url: string
          updated_at: string
        }
        Insert: {
          alert_email?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          ga4_property_id?: string | null
          id?: string
          is_active?: boolean
          last_backlinks_at?: string | null
          last_brokenlinks_at?: string | null
          last_eat_audit_at?: string | null
          last_freshness_at?: string | null
          last_ga4_at?: string | null
          last_pagespeed_at?: string | null
          last_synced_at?: string | null
          pagespeed_urls?: Json
          site_url: string
          updated_at?: string
        }
        Update: {
          alert_email?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          ga4_property_id?: string | null
          id?: string
          is_active?: boolean
          last_backlinks_at?: string | null
          last_brokenlinks_at?: string | null
          last_eat_audit_at?: string | null
          last_freshness_at?: string | null
          last_ga4_at?: string | null
          last_pagespeed_at?: string | null
          last_synced_at?: string | null
          pagespeed_urls?: Json
          site_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_schema_audits: {
        Row: {
          audited_at: string
          errors: Json | null
          id: string
          is_blog: boolean | null
          page_type: string | null
          property_id: string
          recommendation: string | null
          schemas_found: Json | null
          url: string
          warnings: Json | null
        }
        Insert: {
          audited_at?: string
          errors?: Json | null
          id?: string
          is_blog?: boolean | null
          page_type?: string | null
          property_id: string
          recommendation?: string | null
          schemas_found?: Json | null
          url: string
          warnings?: Json | null
        }
        Update: {
          audited_at?: string
          errors?: Json | null
          id?: string
          is_blog?: boolean | null
          page_type?: string | null
          property_id?: string
          recommendation?: string | null
          schemas_found?: Json | null
          url?: string
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_schema_audits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_sitemaps: {
        Row: {
          checked_at: string
          contents: Json | null
          errors: number | null
          id: string
          is_pending: boolean | null
          last_downloaded: string | null
          last_submitted: string | null
          property_id: string
          sitemap_url: string
          warnings: number | null
        }
        Insert: {
          checked_at?: string
          contents?: Json | null
          errors?: number | null
          id?: string
          is_pending?: boolean | null
          last_downloaded?: string | null
          last_submitted?: string | null
          property_id: string
          sitemap_url: string
          warnings?: number | null
        }
        Update: {
          checked_at?: string
          contents?: Json | null
          errors?: number | null
          id?: string
          is_pending?: boolean | null
          last_downloaded?: string | null
          last_submitted?: string | null
          property_id?: string
          sitemap_url?: string
          warnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_sitemaps_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_snapshots: {
        Row: {
          created_at: string
          dimension: string
          id: string
          metrics: Json
          property_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          dimension: string
          id?: string
          metrics?: Json
          property_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          dimension?: string
          id?: string
          metrics?: Json
          property_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_snapshots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "seo_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_voice_queries: {
        Row: {
          clicks: number | null
          detected_at: string
          id: string
          impressions: number | null
          is_question: boolean | null
          page: string | null
          position: number | null
          property_id: string
          query: string
        }
        Insert: {
          clicks?: number | null
          detected_at?: string
          id?: string
          impressions?: number | null
          is_question?: boolean | null
          page?: string | null
          position?: number | null
          property_id: string
          query: string
        }
        Update: {
          clicks?: number | null
          detected_at?: string
          id?: string
          impressions?: number | null
          is_question?: boolean | null
          page?: string | null
          position?: number | null
          property_id?: string
          query?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          shift_type?: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_projects: {
        Row: {
          access_token: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          lovable_url: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          lovable_url: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          lovable_url?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          id: string
          language: string
          status: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          content_key: string
          id?: string
          language?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          content_key?: string
          id?: string
          language?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      site_content_versions: {
        Row: {
          change_type: string
          changed_by: string | null
          content_key: string
          created_at: string
          id: string
          language: string
          status: string
          value: string
        }
        Insert: {
          change_type?: string
          changed_by?: string | null
          content_key: string
          created_at?: string
          id?: string
          language?: string
          status?: string
          value: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          content_key?: string
          created_at?: string
          id?: string
          language?: string
          status?: string
          value?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      super_admin_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_admin_role: { Args: never; Returns: string }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      publish_scheduled_blog_posts: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin" | "editor"
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
      app_role: ["admin", "moderator", "user", "super_admin", "editor"],
      lead_classification: ["cold", "warm", "hot", "high_priority"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
    },
  },
} as const
