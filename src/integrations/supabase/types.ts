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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_oauth_states: { Args: never; Returns: undefined }
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
      account_type: "individual" | "enterprise"
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
      account_type: ["individual", "enterprise"],
      app_role: ["owner", "admin", "operator", "user"],
      invitation_status: ["pending", "accepted", "expired", "cancelled"],
      membership_role: ["primary", "member"],
      membership_status: ["active", "pending", "suspended", "removed"],
    },
  },
} as const
