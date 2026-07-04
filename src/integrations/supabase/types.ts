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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities_catalog: {
        Row: {
          category: string
          commission_per_person: number
          company_name: string
          description: string
          id: string
          suggested_location: string | null
          suggested_max: number
          title: string
        }
        Insert: {
          category: string
          commission_per_person: number
          company_name: string
          description: string
          id?: string
          suggested_location?: string | null
          suggested_max?: number
          title: string
        }
        Update: {
          category?: string
          commission_per_person?: number
          company_name?: string
          description?: string
          id?: string
          suggested_location?: string | null
          suggested_max?: number
          title?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          advertiser_id: string
          company_name: string
          created_at: string
          id: string
          impressions: number
          message: string
          title: string
        }
        Insert: {
          advertiser_id: string
          company_name: string
          created_at?: string
          id?: string
          impressions?: number
          message: string
          title: string
        }
        Update: {
          advertiser_id?: string
          company_name?: string
          created_at?: string
          id?: string
          impressions?: number
          message?: string
          title?: string
        }
        Relationships: []
      }
      host_reviews: {
        Row: {
          comment: string | null
          company_id: string
          created_at: string
          host_id: string
          id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          company_id: string
          created_at?: string
          host_id: string
          id?: string
          rating: number
        }
        Update: {
          comment?: string | null
          company_id?: string
          created_at?: string
          host_id?: string
          id?: string
          rating?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          sender_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          sender_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_participants: {
        Row: {
          joined_at: string
          plan_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          plan_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_participants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          activity_id: string | null
          category: string
          commission_per_person: number | null
          company_name: string | null
          created_at: string
          creator_id: string
          date: string
          description: string
          host_id: string | null
          id: string
          is_hosted: boolean
          location: string
          max_people: number
          time: string
          title: string
        }
        Insert: {
          activity_id?: string | null
          category: string
          commission_per_person?: number | null
          company_name?: string | null
          created_at?: string
          creator_id: string
          date: string
          description: string
          host_id?: string | null
          id?: string
          is_hosted?: boolean
          location: string
          max_people: number
          time: string
          title: string
        }
        Update: {
          activity_id?: string | null
          category?: string
          commission_per_person?: number | null
          company_name?: string | null
          created_at?: string
          creator_id?: string
          date?: string
          description?: string
          host_id?: string | null
          id?: string
          is_hosted?: boolean
          location?: string
          max_people?: number
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          created_at: string
          id: string
          interests: string[]
          is_company: boolean
          is_host: boolean
          name: string
          onboarded: boolean
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          id: string
          interests?: string[]
          is_company?: boolean
          is_host?: boolean
          name?: string
          onboarded?: boolean
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          interests?: string[]
          is_company?: boolean
          is_host?: boolean
          name?: string
          onboarded?: boolean
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          amount: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          amount: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          amount?: number
          reason?: string
          created_at?: string
        }
        Relationships: []
      }
      partner_rewards: {
        Row: {
          id: string
          company_name: string
          category: string
          title: string
          description: string | null
          points_cost: number
          active: boolean
        }
        Insert: {
          id?: string
          company_name: string
          category: string
          title: string
          description?: string | null
          points_cost: number
          active?: boolean
        }
        Update: {
          id?: string
          company_name?: string
          category?: string
          title?: string
          description?: string | null
          points_cost?: number
          active?: boolean
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          redeemed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          redeemed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          redeemed_at?: string
        }
        Relationships: []
      }
      plan_views: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          id: string
          category: string
          sender_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          sender_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          sender_id?: string
          text?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_ad_impression: { Args: { ad_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
