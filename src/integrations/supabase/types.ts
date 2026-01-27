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
      account_memberships: {
        Row: {
          account_id: string
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          address: Json | null
          company_name: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          phone: string | null
          settings: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          count: number | null
          created_at: string
          event_category: string
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          event_category: string
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string
          event_category?: string
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_rollups_org: {
        Row: {
          created_at: string
          event_category: string
          event_count: number | null
          event_type: string
          id: string
          organization_id: string
          rollup_date: string
          unique_users: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_category: string
          event_count?: number | null
          event_type: string
          id?: string
          organization_id: string
          rollup_date: string
          unique_users?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_category?: string
          event_count?: number | null
          event_type?: string
          id?: string
          organization_id?: string
          rollup_date?: string
          unique_users?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_rollups_platform: {
        Row: {
          created_at: string
          event_category: string
          event_count: number | null
          event_type: string
          id: string
          rollup_date: string
          unique_orgs: number | null
          unique_users: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_category: string
          event_count?: number | null
          event_type: string
          id?: string
          rollup_date: string
          unique_orgs?: number | null
          unique_users?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_category?: string
          event_count?: number | null
          event_type?: string
          id?: string
          rollup_date?: string
          unique_orgs?: number | null
          unique_users?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_rollups_user: {
        Row: {
          created_at: string
          event_category: string
          event_count: number | null
          event_type: string
          id: string
          organization_id: string | null
          rollup_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_category: string
          event_count?: number | null
          event_type: string
          id?: string
          organization_id?: string | null
          rollup_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_category?: string
          event_count?: number | null
          event_type?: string
          id?: string
          organization_id?: string | null
          rollup_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auth_failures: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      cohort_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_code: string
          invited_by: string
          organization_id: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_code: string
          invited_by: string
          organization_id?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by?: string
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_memberships: {
        Row: {
          converted_at: string | null
          converted_to_tier: string | null
          expires_at: string
          id: string
          organization_id: string | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          converted_to_tier?: string | null
          expires_at?: string
          id?: string
          organization_id?: string | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          converted_to_tier?: string | null
          expires_at?: string
          id?: string
          organization_id?: string | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          title: string | null
          updated_at: string
          user_id: string
          vopsy_mode: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          vopsy_mode?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          vopsy_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_attachments: {
        Row: {
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          name: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          name: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_attachments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          lesson_type: string
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lesson_type?: string
          order_index?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lesson_type?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quizzes: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          options: Json | null
          order_index: number
          question: string
          question_type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          options?: Json | null
          order_index?: number
          question: string
          question_type?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json | null
          order_index?: number
          question?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          organization_id: string | null
          published_at: string | null
          status: string
          thumbnail_url: string | null
          tier_access: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          organization_id?: string | null
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          tier_access?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          tier_access?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          created_at: string
          document_type: string
          extracted_data: Json | null
          extraction_status: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          organization_id: string | null
          period_end: string | null
          period_start: string | null
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          extracted_data?: Json | null
          extraction_status?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          extracted_data?: Json | null
          extraction_status?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hour_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          hours: number
          id: string
          organization_id: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          hours: number
          id?: string
          organization_id: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          hours?: number
          id?: string
          organization_id?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hour_purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string
          enabled: boolean
          id: string
          provider: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string
          enabled?: boolean
          id?: string
          provider: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string
          enabled?: boolean
          id?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          access_token: string | null
          connected_account: string | null
          created_at: string
          health: string | null
          id: string
          last_synced_at: string | null
          org_id: string
          provider: string
          refresh_token: string | null
          scopes: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_account?: string | null
          created_at?: string
          health?: string | null
          id?: string
          last_synced_at?: string | null
          org_id: string
          provider: string
          refresh_token?: string | null
          scopes?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_account?: string | null
          created_at?: string
          health?: string | null
          id?: string
          last_synced_at?: string | null
          org_id?: string
          provider?: string
          refresh_token?: string | null
          scopes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          provider: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          provider: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          cohort_expires_at: string | null
          created_at: string
          hours_purchased: number | null
          hours_used: number | null
          id: string
          name: string
          slug: string | null
          stripe_customer_id: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          cohort_expires_at?: string | null
          created_at?: string
          hours_purchased?: number | null
          hours_used?: number | null
          id?: string
          name: string
          slug?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          cohort_expires_at?: string | null
          created_at?: string
          hours_purchased?: number | null
          hours_used?: number | null
          id?: string
          name?: string
          slug?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_billing_reports: {
        Row: {
          created_at: string
          data: Json
          generated_by: string
          id: string
          period_end: string
          period_start: string
          report_type: string
        }
        Insert: {
          created_at?: string
          data?: Json
          generated_by: string
          id?: string
          period_end: string
          period_start: string
          report_type: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_by?: string
          id?: string
          period_end?: string
          period_start?: string
          report_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          organization_id: string | null
          primary_account_id: string | null
          role: string | null
          selected_tier: string | null
          stripe_subscription_id: string | null
          subscription_confirmed: boolean | null
          subscription_confirmed_at: string | null
          subscription_tier: string | null
          tier_selected: boolean | null
          updated_at: string
          user_id: string
          vopsy_initialized: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          primary_account_id?: string | null
          role?: string | null
          selected_tier?: string | null
          stripe_subscription_id?: string | null
          subscription_confirmed?: boolean | null
          subscription_confirmed_at?: string | null
          subscription_tier?: string | null
          tier_selected?: boolean | null
          updated_at?: string
          user_id: string
          vopsy_initialized?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          primary_account_id?: string | null
          role?: string | null
          selected_tier?: string | null
          stripe_subscription_id?: string | null
          subscription_confirmed?: boolean | null
          subscription_confirmed_at?: string | null
          subscription_tier?: string | null
          tier_selected?: boolean | null
          updated_at?: string
          user_id?: string
          vopsy_initialized?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_account_id_fkey"
            columns: ["primary_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          organization_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answer: string
          attempted_at: string
          id: string
          is_correct: boolean
          quiz_id: string
          user_id: string
        }
        Insert: {
          answer: string
          attempted_at?: string
          id?: string
          is_correct: boolean
          quiz_id: string
          user_id: string
        }
        Update: {
          answer?: string
          attempted_at?: string
          id?: string
          is_correct?: boolean
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          last_used_at: string
          name: string | null
          phone: string | null
          use_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_used_at?: string
          name?: string | null
          phone?: string | null
          use_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_used_at?: string
          name?: string | null
          phone?: string | null
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      studio_generations: {
        Row: {
          created_at: string
          id: string
          prompt: string | null
          tier: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt?: string | null
          tier: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string | null
          tier?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_academy_stats: {
        Row: {
          courses_completed: number
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          lessons_completed: number
          longest_streak: number
          quizzes_perfect: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          courses_completed?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          quizzes_perfect?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          courses_completed?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          quizzes_perfect?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          organization_id: string | null
          shared: boolean | null
          size_bytes: number | null
          starred: boolean | null
          storage_path: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          organization_id?: string | null
          shared?: boolean | null
          size_bytes?: number | null
          starred?: boolean | null
          storage_path: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          organization_id?: string | null
          shared?: boolean | null
          size_bytes?: number | null
          starred?: boolean | null
          storage_path?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_oauth_states: { Args: never; Returns: undefined }
      get_safe_profile_email: {
        Args: { profile_email: string; profile_user_id: string }
        Returns: string
      }
      get_user_effective_tier: {
        Args: { check_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_member: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_account_primary: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_owner: { Args: { _user_id: string }; Returns: boolean }
      user_has_tier_access: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type:
        | "free"
        | "ai_assistant"
        | "ai_operations"
        | "ai_enterprise"
        | "ai_advisory"
        | "ai_tax"
        | "ai_compliance"
      app_role: "owner" | "admin" | "operator" | "user"
      invitation_status: "pending" | "accepted" | "expired" | "cancelled"
      membership_role: "primary" | "member"
      membership_status: "active" | "pending" | "suspended" | "removed"
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
      account_type: [
        "free",
        "ai_assistant",
        "ai_operations",
        "ai_enterprise",
        "ai_advisory",
        "ai_tax",
        "ai_compliance",
      ],
      app_role: ["owner", "admin", "operator", "user"],
      invitation_status: ["pending", "accepted", "expired", "cancelled"],
      membership_role: ["primary", "member"],
      membership_status: ["active", "pending", "suspended", "removed"],
    },
  },
} as const
