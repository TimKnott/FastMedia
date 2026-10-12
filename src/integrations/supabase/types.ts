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
      ad_campaigns: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          kind: string
          name: string
          priority: number
          starts_at: string | null
          target_domains: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          name: string
          priority?: number
          starts_at?: string | null
          target_domains?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          name?: string
          priority?: number
          starts_at?: string | null
          target_domains?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_creatives: {
        Row: {
          active: boolean
          alt_text: string | null
          campaign_id: string
          click_url: string | null
          created_at: string
          html: string | null
          id: string
          image_url: string | null
          type: string
          zone_id: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          campaign_id: string
          click_url?: string | null
          created_at?: string
          html?: string | null
          id?: string
          image_url?: string | null
          type?: string
          zone_id: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          campaign_id?: string
          click_url?: string | null
          created_at?: string
          html?: string | null
          id?: string
          image_url?: string | null
          type?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "ad_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_events: {
        Row: {
          created_at: string
          creative_id: string | null
          domain: string | null
          event: string
          id: number
          zone_slug: string | null
        }
        Insert: {
          created_at?: string
          creative_id?: string | null
          domain?: string | null
          event: string
          id?: number
          zone_slug?: string | null
        }
        Update: {
          created_at?: string
          creative_id?: string | null
          domain?: string | null
          event?: string
          id?: number
          zone_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_events_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_zones: {
        Row: {
          active: boolean
          created_at: string
          height: number | null
          id: string
          name: string
          slug: string
          width: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          height?: number | null
          id?: string
          name: string
          slug: string
          width?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string
          height?: number | null
          id?: string
          name?: string
          slug?: string
          width?: number | null
        }
        Relationships: []
      }
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
      backlink_checks: {
        Row: {
          checked_at: string
          found: boolean
          id: string
          nofollow: boolean
          opportunity_id: string
          result: string | null
        }
        Insert: {
          checked_at?: string
          found: boolean
          id?: string
          nofollow?: boolean
          opportunity_id: string
          result?: string | null
        }
        Update: {
          checked_at?: string
          found?: boolean
          id?: string
          nofollow?: boolean
          opportunity_id?: string
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_checks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "backlink_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      backlink_opportunities: {
        Row: {
          category: string
          created_at: string
          id: string
          is_own_site: boolean
          last_check_at: string | null
          last_check_result: string | null
          link_ok: boolean | null
          live_at: string | null
          live_url: string | null
          long_cs: string | null
          long_en: string | null
          notes: string | null
          short_cs: string | null
          short_en: string | null
          site_name: string
          site_url: string
          sort_order: number
          status: string
          submit_url: string | null
          submitted_at: string | null
          target_url: string
          title_cs: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_own_site?: boolean
          last_check_at?: string | null
          last_check_result?: string | null
          link_ok?: boolean | null
          live_at?: string | null
          live_url?: string | null
          long_cs?: string | null
          long_en?: string | null
          notes?: string | null
          short_cs?: string | null
          short_en?: string | null
          site_name: string
          site_url: string
          sort_order?: number
          status?: string
          submit_url?: string | null
          submitted_at?: string | null
          target_url?: string
          title_cs?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_own_site?: boolean
          last_check_at?: string | null
          last_check_result?: string | null
          link_ok?: boolean | null
          live_at?: string | null
          live_url?: string | null
          long_cs?: string | null
          long_en?: string | null
          notes?: string | null
          short_cs?: string | null
          short_en?: string | null
          site_name?: string
          site_url?: string
          sort_order?: number
          status?: string
          submit_url?: string | null
          submitted_at?: string | null
          target_url?: string
          title_cs?: string | null
          title_en?: string | null
          updated_at?: string
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
      business_sites: {
        Row: {
          created_at: string
          default_location: string
          default_radius_km: number
          description: string
          id: string
          lead_brief: string
          modes: Json
          name: string
          sheet_url: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          default_location?: string
          default_radius_km?: number
          description?: string
          id?: string
          lead_brief?: string
          modes?: Json
          name: string
          sheet_url?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          default_location?: string
          default_radius_km?: number
          description?: string
          id?: string
          lead_brief?: string
          modes?: Json
          name?: string
          sheet_url?: string | null
          url?: string | null
        }
        Relationships: []
      }
      calculator_modules: {
        Row: {
          active: boolean
          allow_multiple: boolean
          category: string
          created_at: string
          desc_cs: string
          desc_en: string
          icon: string
          id: string
          labor_hours: number
          monthly_price: number
          name_cs: string
          name_en: string
          one_time_price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_multiple?: boolean
          category?: string
          created_at?: string
          desc_cs?: string
          desc_en?: string
          icon?: string
          id: string
          labor_hours?: number
          monthly_price?: number
          name_cs?: string
          name_en: string
          one_time_price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_multiple?: boolean
          category?: string
          created_at?: string
          desc_cs?: string
          desc_en?: string
          icon?: string
          id?: string
          labor_hours?: number
          monthly_price?: number
          name_cs?: string
          name_en?: string
          one_time_price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      calculator_packages: {
        Row: {
          module_ids: string[]
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          module_ids?: string[]
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          module_ids?: string[]
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          body_cs: string
          body_en: string
          brand: string
          created_at: string
          created_by: string | null
          gallery_images: Json
          id: string
          is_published: boolean
          pdf_path: string | null
          pdf_url: string | null
          slug: string
          sort_order: number
          stats: Json
          summary_cs: string
          summary_en: string
          tag_cs: string
          tag_en: string
          thumbnail_url: string | null
          updated_at: string
          website_label: string | null
          website_url: string | null
        }
        Insert: {
          body_cs?: string
          body_en?: string
          brand: string
          created_at?: string
          created_by?: string | null
          gallery_images?: Json
          id?: string
          is_published?: boolean
          pdf_path?: string | null
          pdf_url?: string | null
          slug: string
          sort_order?: number
          stats?: Json
          summary_cs?: string
          summary_en?: string
          tag_cs?: string
          tag_en?: string
          thumbnail_url?: string | null
          updated_at?: string
          website_label?: string | null
          website_url?: string | null
        }
        Update: {
          body_cs?: string
          body_en?: string
          brand?: string
          created_at?: string
          created_by?: string | null
          gallery_images?: Json
          id?: string
          is_published?: boolean
          pdf_path?: string | null
          pdf_url?: string | null
          slug?: string
          sort_order?: number
          stats?: Json
          summary_cs?: string
          summary_en?: string
          tag_cs?: string
          tag_en?: string
          thumbnail_url?: string | null
          updated_at?: string
          website_label?: string | null
          website_url?: string | null
        }
        Relationships: []
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
      client_reviews: {
        Row: {
          approved_at: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          rating: number
          review_text: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          rating: number
          review_text: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          rating?: number
          review_text?: string
          status?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string
          estimated_value: number | null
          first_enquiry_at: string | null
          id: string
          last_contacted_at: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string
          source_id: string | null
          status: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          estimated_value?: number | null
          first_enquiry_at?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          source_id?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          estimated_value?: number | null
          first_enquiry_at?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          source_id?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          company: string | null
          created_at: string
          details: Json
          email: string
          email_message_id: string | null
          email_status: string | null
          id: string
          kind: string
          message: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          details?: Json
          email: string
          email_message_id?: string | null
          email_status?: string | null
          id?: string
          kind?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          details?: Json
          email?: string
          email_message_id?: string | null
          email_status?: string | null
          id?: string
          kind?: string
          message?: string | null
          name?: string
          phone?: string | null
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
      courses: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string
          duration_label_cs: string
          duration_label_en: string
          embed_html: string | null
          embed_url: string | null
          id: string
          intro_cs: string
          intro_en: string
          is_free: boolean
          is_published: boolean
          learn_cs: string[]
          learn_en: string[]
          level_label_cs: string
          level_label_en: string
          price_czk: number
          slug: string
          sort_order: number
          subtitle_cs: string
          subtitle_en: string
          title_cs: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image?: string | null
          created_at?: string
          duration_label_cs?: string
          duration_label_en?: string
          embed_html?: string | null
          embed_url?: string | null
          id?: string
          intro_cs?: string
          intro_en?: string
          is_free?: boolean
          is_published?: boolean
          learn_cs?: string[]
          learn_en?: string[]
          level_label_cs?: string
          level_label_en?: string
          price_czk?: number
          slug: string
          sort_order?: number
          subtitle_cs?: string
          subtitle_en?: string
          title_cs?: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string
          duration_label_cs?: string
          duration_label_en?: string
          embed_html?: string | null
          embed_url?: string | null
          id?: string
          intro_cs?: string
          intro_en?: string
          is_free?: boolean
          is_published?: boolean
          learn_cs?: string[]
          learn_en?: string[]
          level_label_cs?: string
          level_label_en?: string
          price_czk?: number
          slug?: string
          sort_order?: number
          subtitle_cs?: string
          subtitle_en?: string
          title_cs?: string
          title_en?: string
          updated_at?: string
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
      directory_finds: {
        Row: {
          address: string | null
          audit: Json | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          date_end: string | null
          date_start: string | null
          email: string | null
          exported_at: string | null
          id: string
          kind: string
          phone: string | null
          query: string | null
          score: number | null
          site_id: string
          source_url: string | null
          status: string
          summary: string | null
          title: string
          website: string | null
        }
        Insert: {
          address?: string | null
          audit?: Json | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          email?: string | null
          exported_at?: string | null
          id?: string
          kind: string
          phone?: string | null
          query?: string | null
          score?: number | null
          site_id: string
          source_url?: string | null
          status?: string
          summary?: string | null
          title: string
          website?: string | null
        }
        Update: {
          address?: string | null
          audit?: Json | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          email?: string | null
          exported_at?: string | null
          id?: string
          kind?: string
          phone?: string | null
          query?: string | null
          score?: number | null
          site_id?: string
          source_url?: string | null
          status?: string
          summary?: string | null
          title?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directory_finds_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
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
      flowlu_lead_replies: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          error: string | null
          flowlu_lead_id: number
          flowlu_logged: boolean
          id: string
          sent_at: string | null
          status: string
          subject: string
          to_email: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          error?: string | null
          flowlu_lead_id: number
          flowlu_logged?: boolean
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
          to_email: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          error?: string | null
          flowlu_lead_id?: number
          flowlu_logged?: boolean
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          to_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      flowlu_lead_sequences: {
        Row: {
          body: string
          created_at: string
          due_at: string
          error: string | null
          flowlu_lead_id: number
          id: string
          sent_at: string | null
          status: string
          step: number
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          due_at: string
          error?: string | null
          flowlu_lead_id: number
          id?: string
          sent_at?: string | null
          status?: string
          step: number
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          due_at?: string
          error?: string | null
          flowlu_lead_id?: number
          id?: string
          sent_at?: string | null
          status?: string
          step?: number
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      flowlu_leads: {
        Row: {
          budget: number | null
          contact_company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          emails_sent: number
          first_seen_at: string
          flowlu_created_at: string | null
          flowlu_score_synced: string | null
          id: number
          last_contact_at: string | null
          last_reply_at: string | null
          name: string | null
          pipeline_stage: string
          priority: string
          raw: Json
          score: number
          score_reasons: string[]
          synced_at: string
        }
        Insert: {
          budget?: number | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          emails_sent?: number
          first_seen_at?: string
          flowlu_created_at?: string | null
          flowlu_score_synced?: string | null
          id: number
          last_contact_at?: string | null
          last_reply_at?: string | null
          name?: string | null
          pipeline_stage?: string
          priority?: string
          raw?: Json
          score?: number
          score_reasons?: string[]
          synced_at?: string
        }
        Update: {
          budget?: number | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          emails_sent?: number
          first_seen_at?: string
          flowlu_created_at?: string | null
          flowlu_score_synced?: string | null
          id?: number
          last_contact_at?: string | null
          last_reply_at?: string | null
          name?: string | null
          pipeline_stage?: string
          priority?: string
          raw?: Json
          score?: number
          score_reasons?: string[]
          synced_at?: string
        }
        Relationships: []
      }
      flowlu_settings: {
        Row: {
          auto_sync_calls: boolean
          auto_sync_leads: boolean
          id: number
          last_sync_at: string | null
          last_test_at: string | null
          last_test_message: string | null
          last_test_ok: boolean | null
          updated_at: string
        }
        Insert: {
          auto_sync_calls?: boolean
          auto_sync_leads?: boolean
          id?: number
          last_sync_at?: string | null
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_ok?: boolean | null
          updated_at?: string
        }
        Update: {
          auto_sync_calls?: boolean
          auto_sync_leads?: boolean
          id?: number
          last_sync_at?: string | null
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_ok?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      flowlu_sync_log: {
        Row: {
          created_at: string
          direction: string
          entity_id: string
          entity_type: string
          error: string | null
          flowlu_id: string | null
          id: string
          payload: Json
          status: string
        }
        Insert: {
          created_at?: string
          direction?: string
          entity_id: string
          entity_type: string
          error?: string | null
          flowlu_id?: string | null
          id?: string
          payload?: Json
          status?: string
        }
        Update: {
          created_at?: string
          direction?: string
          entity_id?: string
          entity_type?: string
          error?: string | null
          flowlu_id?: string | null
          id?: string
          payload?: Json
          status?: string
        }
        Relationships: []
      }
      geo_ai_observations: {
        Row: {
          cited: boolean
          country: string
          created_at: string
          device: string
          id: string
          language: string
          mentioned: boolean
          observed_on: string
          platform: string
          query: string
          quote: string | null
          recorded_by: string | null
          screenshot_url: string | null
          source_url: string | null
        }
        Insert: {
          cited?: boolean
          country: string
          created_at?: string
          device: string
          id?: string
          language: string
          mentioned?: boolean
          observed_on: string
          platform: string
          query: string
          quote?: string | null
          recorded_by?: string | null
          screenshot_url?: string | null
          source_url?: string | null
        }
        Update: {
          cited?: boolean
          country?: string
          created_at?: string
          device?: string
          id?: string
          language?: string
          mentioned?: boolean
          observed_on?: string
          platform?: string
          query?: string
          quote?: string | null
          recorded_by?: string | null
          screenshot_url?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      geo_audit_runs: {
        Row: {
          finished_at: string | null
          id: string
          pages: number
          started_at: string
          status: string
          summary: Json
        }
        Insert: {
          finished_at?: string | null
          id?: string
          pages?: number
          started_at?: string
          status?: string
          summary?: Json
        }
        Update: {
          finished_at?: string | null
          id?: string
          pages?: number
          started_at?: string
          status?: string
          summary?: Json
        }
        Relationships: []
      }
      geo_business_facts: {
        Row: {
          fact_key: string
          id: string
          label: string
          sort_order: number
          source: string
          updated_at: string
          value: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          fact_key: string
          id?: string
          label: string
          sort_order?: number
          source?: string
          updated_at?: string
          value?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          fact_key?: string
          id?: string
          label?: string
          sort_order?: number
          source?: string
          updated_at?: string
          value?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      geo_claims: {
        Row: {
          claim: string
          claim_type: string
          created_at: string
          id: string
          note: string | null
          path: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          claim: string
          claim_type: string
          created_at?: string
          id?: string
          note?: string | null
          path: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          claim?: string
          claim_type?: string
          created_at?: string
          id?: string
          note?: string | null
          path?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      geo_competitors: {
        Row: {
          analysed_at: string | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          report: Json | null
          url: string
        }
        Insert: {
          analysed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          report?: Json | null
          url: string
        }
        Update: {
          analysed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          report?: Json | null
          url?: string
        }
        Relationships: []
      }
      geo_content_plan: {
        Row: {
          audience: string | null
          created_at: string
          h1: string | null
          id: string
          internal_links: Json
          needs_approval: boolean
          outline: Json
          page_type: string
          primary_question: string | null
          required_facts: Json
          schema_types: string[]
          search_intent: string | null
          status: string
          title: string
          url: string | null
        }
        Insert: {
          audience?: string | null
          created_at?: string
          h1?: string | null
          id?: string
          internal_links?: Json
          needs_approval?: boolean
          outline?: Json
          page_type: string
          primary_question?: string | null
          required_facts?: Json
          schema_types?: string[]
          search_intent?: string | null
          status?: string
          title: string
          url?: string | null
        }
        Update: {
          audience?: string | null
          created_at?: string
          h1?: string | null
          id?: string
          internal_links?: Json
          needs_approval?: boolean
          outline?: Json
          page_type?: string
          primary_question?: string | null
          required_facts?: Json
          schema_types?: string[]
          search_intent?: string | null
          status?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      geo_generated_items: {
        Row: {
          after_content: string | null
          before_content: string | null
          created_at: string
          created_by: string | null
          facts: Json
          history: Json
          id: string
          json_ld: Json | null
          kind: string
          language: string
          missing_info: Json
          recommendations: Json
          status: string
          target_path: string | null
          title: string | null
          unverified: boolean
          updated_at: string
        }
        Insert: {
          after_content?: string | null
          before_content?: string | null
          created_at?: string
          created_by?: string | null
          facts?: Json
          history?: Json
          id?: string
          json_ld?: Json | null
          kind: string
          language?: string
          missing_info?: Json
          recommendations?: Json
          status?: string
          target_path?: string | null
          title?: string | null
          unverified?: boolean
          updated_at?: string
        }
        Update: {
          after_content?: string | null
          before_content?: string | null
          created_at?: string
          created_by?: string | null
          facts?: Json
          history?: Json
          id?: string
          json_ld?: Json | null
          kind?: string
          language?: string
          missing_info?: Json
          recommendations?: Json
          status?: string
          target_path?: string | null
          title?: string | null
          unverified?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      geo_locked_pages: {
        Row: {
          created_at: string
          id: string
          path: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          reason?: string | null
        }
        Relationships: []
      }
      geo_page_audits: {
        Row: {
          content_hash: string | null
          created_at: string
          description: string | null
          h1: string | null
          headings: Json
          http_status: number | null
          id: string
          internal_links: number
          issues: Json
          path: string
          run_id: string | null
          schema_types: string[]
          scores: Json
          text_excerpt: string | null
          title: string | null
          url: string
          word_count: number | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          description?: string | null
          h1?: string | null
          headings?: Json
          http_status?: number | null
          id?: string
          internal_links?: number
          issues?: Json
          path: string
          run_id?: string | null
          schema_types?: string[]
          scores?: Json
          text_excerpt?: string | null
          title?: string | null
          url: string
          word_count?: number | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          description?: string | null
          h1?: string | null
          headings?: Json
          http_status?: number | null
          id?: string
          internal_links?: number
          issues?: Json
          path?: string
          run_id?: string | null
          schema_types?: string[]
          scores?: Json
          text_excerpt?: string | null
          title?: string | null
          url?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_page_audits_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "geo_audit_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_schema_blocks: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          json_ld: Json
          page_path: string
          schema_type: string
          status: string
          updated_at: string
          validated: boolean
          validation_notes: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          json_ld: Json
          page_path: string
          schema_type: string
          status?: string
          updated_at?: string
          validated?: boolean
          validation_notes?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          json_ld?: Json
          page_path?: string
          schema_type?: string
          status?: string
          updated_at?: string
          validated?: boolean
          validation_notes?: string | null
        }
        Relationships: []
      }
      grant_documents: {
        Row: {
          created_at: string
          enquiry_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          enquiry_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          owner_id: string
        }
        Update: {
          created_at?: string
          enquiry_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_documents_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "contact_enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_emails: {
        Row: {
          ai_reply: string | null
          body_en: string | null
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
          body_en?: string | null
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
          body_en?: string | null
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
      internal_job_tokens: {
        Row: {
          created_at: string
          name: string
          token: string
        }
        Insert: {
          created_at?: string
          name: string
          token: string
        }
        Update: {
          created_at?: string
          name?: string
          token?: string
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
      language_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: Json
          created_at: string
          id: string
          language_code: string
          language_name: string
          meta_description: string
          published_at: string | null
          reviewer_notes: string | null
          slug: string
          source_path: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          id?: string
          language_code: string
          language_name: string
          meta_description?: string
          published_at?: string | null
          reviewer_notes?: string | null
          slug: string
          source_path: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          id?: string
          language_code?: string
          language_name?: string
          meta_description?: string
          published_at?: string | null
          reviewer_notes?: string | null
          slug?: string
          source_path?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      linkedin_stories: {
        Row: {
          angle: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          draft: Json | null
          episode: number | null
          id: string
          notes: string | null
          planned_date: string | null
          post: string | null
          posted_on: Json
          purpose: string | null
          questions: Json
          status: string
          story_type: string
          suggested_hook: string | null
          title: string
          updated_at: string
        }
        Insert: {
          angle?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          draft?: Json | null
          episode?: number | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          post?: string | null
          posted_on?: Json
          purpose?: string | null
          questions?: Json
          status?: string
          story_type?: string
          suggested_hook?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          angle?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          draft?: Json | null
          episode?: number | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          post?: string | null
          posted_on?: Json
          purpose?: string | null
          questions?: Json
          status?: string
          story_type?: string
          suggested_hook?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_requests: {
        Row: {
          admin_notes: string | null
          contact_email: string | null
          contact_name: string | null
          conversation: Json
          converted_module_id: string | null
          covered_by: string[]
          created_at: string
          id: string
          selected_modules: string[]
          status: string
          suggested_max: number | null
          suggested_min: number | null
          summary: string | null
          trade: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contact_email?: string | null
          contact_name?: string | null
          conversation?: Json
          converted_module_id?: string | null
          covered_by?: string[]
          created_at?: string
          id?: string
          selected_modules?: string[]
          status?: string
          suggested_max?: number | null
          suggested_min?: number | null
          summary?: string | null
          trade?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contact_email?: string | null
          contact_name?: string | null
          conversation?: Json
          converted_module_id?: string | null
          covered_by?: string[]
          created_at?: string
          id?: string
          selected_modules?: string[]
          status?: string
          suggested_max?: number | null
          suggested_min?: number | null
          summary?: string | null
          trade?: string | null
          updated_at?: string
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
      outreach_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_label: string | null
          actor_type: string
          created_at: string
          details: Json
          id: string
          message_id: string | null
          prospect_id: string | null
          step: number | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_label?: string | null
          actor_type?: string
          created_at?: string
          details?: Json
          id?: string
          message_id?: string | null
          prospect_id?: string | null
          step?: number | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_label?: string | null
          actor_type?: string
          created_at?: string
          details?: Json
          id?: string
          message_id?: string | null
          prospect_id?: string | null
          step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "outreach_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          delivered_to: string | null
          edited_at: string | null
          edited_by: string | null
          error_message: string | null
          id: string
          language: string
          proposed_at: string | null
          prospect_id: string
          provider_message_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          step: number
          subject: string
          test_mode: boolean
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          delivered_to?: string | null
          edited_at?: string | null
          edited_by?: string | null
          error_message?: string | null
          id?: string
          language?: string
          proposed_at?: string | null
          prospect_id: string
          provider_message_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          step?: number
          subject: string
          test_mode?: boolean
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          delivered_to?: string | null
          edited_at?: string | null
          edited_by?: string | null
          error_message?: string | null
          id?: string
          language?: string
          proposed_at?: string | null
          prospect_id?: string
          provider_message_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          step?: number
          subject?: string
          test_mode?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_settings: {
        Row: {
          discovery_cursor: number
          discovery_enabled: boolean
          discovery_regions: string[]
          discovery_spend_credits: number
          discovery_spend_date: string | null
          discovery_trades: string[]
          follow_up_days_step2: number
          follow_up_days_step3: number
          getsales_automation_id: string | null
          getsales_base_url: string | null
          getsales_enabled: boolean
          getsales_list_id: string | null
          getsales_sender_id: string | null
          id: number
          simulate_visitors: boolean
          test_inbox: string | null
          test_mode: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          discovery_cursor?: number
          discovery_enabled?: boolean
          discovery_regions?: string[]
          discovery_spend_credits?: number
          discovery_spend_date?: string | null
          discovery_trades?: string[]
          follow_up_days_step2?: number
          follow_up_days_step3?: number
          getsales_automation_id?: string | null
          getsales_base_url?: string | null
          getsales_enabled?: boolean
          getsales_list_id?: string | null
          getsales_sender_id?: string | null
          id?: number
          simulate_visitors?: boolean
          test_inbox?: string | null
          test_mode?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          discovery_cursor?: number
          discovery_enabled?: boolean
          discovery_regions?: string[]
          discovery_spend_credits?: number
          discovery_spend_date?: string | null
          discovery_trades?: string[]
          follow_up_days_step2?: number
          follow_up_days_step3?: number
          getsales_automation_id?: string | null
          getsales_base_url?: string | null
          getsales_enabled?: boolean
          getsales_list_id?: string | null
          getsales_sender_id?: string | null
          id?: number
          simulate_visitors?: boolean
          test_inbox?: string | null
          test_mode?: boolean
          updated_at?: string
          updated_by?: string | null
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
      prospects: {
        Row: {
          company: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          discovered_query: string | null
          email: string
          fit_score: number
          getsales_last_attempt_at: string | null
          getsales_lead_id: string | null
          getsales_sync_attempts: number
          getsales_sync_error: string | null
          getsales_sync_status: string
          getsales_synced_at: string | null
          id: string
          language: string
          last_contacted_at: string | null
          linkedin_url: string | null
          notes: string | null
          owner: string | null
          phone: string | null
          region: string | null
          replied_at: string | null
          research: Json
          source: string
          source_id: string | null
          status: string
          trade: string | null
          unsubscribed_at: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          discovered_query?: string | null
          email: string
          fit_score?: number
          getsales_last_attempt_at?: string | null
          getsales_lead_id?: string | null
          getsales_sync_attempts?: number
          getsales_sync_error?: string | null
          getsales_sync_status?: string
          getsales_synced_at?: string | null
          id?: string
          language?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          region?: string | null
          replied_at?: string | null
          research?: Json
          source?: string
          source_id?: string | null
          status?: string
          trade?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          discovered_query?: string | null
          email?: string
          fit_score?: number
          getsales_last_attempt_at?: string | null
          getsales_lead_id?: string | null
          getsales_sync_attempts?: number
          getsales_sync_error?: string | null
          getsales_sync_status?: string
          getsales_synced_at?: string | null
          id?: string
          language?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          region?: string | null
          replied_at?: string | null
          research?: Json
          source?: string
          source_id?: string | null
          status?: string
          trade?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      saved_ads: {
        Row: {
          ad: Json
          created_at: string
          created_by: string | null
          id: string
          platform: string
        }
        Insert: {
          ad: Json
          created_at?: string
          created_by?: string | null
          id?: string
          platform: string
        }
        Update: {
          ad?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          platform?: string
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
      scraped_leads: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          distance_note: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          query: string | null
          site_id: string
          source_url: string | null
          status: string
          website: string | null
          why_fit: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          distance_note?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          query?: string | null
          site_id: string
          source_url?: string | null
          status?: string
          website?: string | null
          why_fit?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          distance_note?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          query?: string | null
          site_id?: string
          source_url?: string | null
          status?: string
          website?: string | null
          why_fit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_leads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
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
      site_settings: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string
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
      tracker_items: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          owner: string | null
          source: string
          source_id: string | null
          stage: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          source?: string
          source_id?: string | null
          stage?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          source?: string
          source_id?: string | null
          stage?: string
          title?: string
          updated_at?: string
          value?: number | null
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
      visitor_signals: {
        Row: {
          alerted_at: string | null
          created_at: string
          email: string | null
          form_id: string | null
          id: string
          kind: string
          language: string
          name: string | null
          page_path: string
          payload: Json
          phone: string | null
          recovered_at: string | null
          recovery_status: string
          session_key: string | null
          simulated: boolean
          updated_at: string
        }
        Insert: {
          alerted_at?: string | null
          created_at?: string
          email?: string | null
          form_id?: string | null
          id?: string
          kind: string
          language?: string
          name?: string | null
          page_path?: string
          payload?: Json
          phone?: string | null
          recovered_at?: string | null
          recovery_status?: string
          session_key?: string | null
          simulated?: boolean
          updated_at?: string
        }
        Update: {
          alerted_at?: string | null
          created_at?: string
          email?: string | null
          form_id?: string | null
          id?: string
          kind?: string
          language?: string
          name?: string | null
          page_path?: string
          payload?: Json
          phone?: string | null
          recovered_at?: string | null
          recovery_status?: string
          session_key?: string | null
          simulated?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      voice_call_turns: {
        Row: {
          call_id: string
          created_at: string
          id: string
          role: string
          text: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          role: string
          text: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          role?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_call_turns_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "voice_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_calls: {
        Row: {
          campaign_id: string | null
          created_at: string
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          flowlu_synced: boolean
          forwarded: boolean
          from_number: string | null
          id: string
          language: string | null
          outcome: string | null
          prospect_id: string | null
          recording_url: string | null
          started_at: string
          status: string
          summary: string | null
          to_number: string | null
          twilio_call_sid: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          direction: string
          duration_seconds?: number | null
          ended_at?: string | null
          flowlu_synced?: boolean
          forwarded?: boolean
          from_number?: string | null
          id?: string
          language?: string | null
          outcome?: string | null
          prospect_id?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          to_number?: string | null
          twilio_call_sid?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flowlu_synced?: boolean
          forwarded?: boolean
          from_number?: string | null
          id?: string
          language?: string | null
          outcome?: string | null
          prospect_id?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          to_number?: string | null
          twilio_call_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "voice_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          script: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          script: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          script?: string
          status?: string
        }
        Relationships: []
      }
      voice_scan_reports: {
        Row: {
          emailed: boolean
          id: string
          issues: Json
          pages_checked: number
          ran_at: string
          summary: string | null
        }
        Insert: {
          emailed?: boolean
          id?: string
          issues?: Json
          pages_checked?: number
          ran_at?: string
          summary?: string | null
        }
        Update: {
          emailed?: boolean
          id?: string
          issues?: Json
          pages_checked?: number
          ran_at?: string
          summary?: string | null
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          elevenlabs_voice_id: string | null
          enabled: boolean
          flowlu_enabled: boolean
          forward_to_number: string | null
          id: number
          minutes_used: number
          monthly_minute_cap: number
          twilio_number: string | null
          updated_at: string
          usage_month: string
        }
        Insert: {
          elevenlabs_voice_id?: string | null
          enabled?: boolean
          flowlu_enabled?: boolean
          forward_to_number?: string | null
          id?: number
          minutes_used?: number
          monthly_minute_cap?: number
          twilio_number?: string | null
          updated_at?: string
          usage_month?: string
        }
        Update: {
          elevenlabs_voice_id?: string | null
          enabled?: boolean
          flowlu_enabled?: boolean
          forward_to_number?: string | null
          id?: number
          minutes_used?: number
          monthly_minute_cap?: number
          twilio_number?: string | null
          updated_at?: string
          usage_month?: string
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
      log_ad_event: {
        Args: {
          _creative: string
          _domain: string
          _event: string
          _zone: string
        }
        Returns: undefined
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
      serve_ad: {
        Args: { _domain: string; _zone: string }
        Returns: {
          alt_text: string
          click_url: string
          creative_id: string
          height: number
          html: string
          image_url: string
          type: string
          width: number
        }[]
      }
      set_email_queue_service_key: {
        Args: { new_key: string }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
