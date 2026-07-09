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
      club_members: {
        Row: {
          company_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          category: string
          created_at: string
          id: string
          sender_id: string
          text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          sender_id: string
          text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          sender_id?: string
          text?: string
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
      partner_rewards: {
        Row: {
          active: boolean
          category: string
          company_name: string
          created_at: string
          description: string | null
          id: string
          points_cost: number
          title: string
        }
        Insert: {
          active?: boolean
          category: string
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          points_cost: number
          title: string
        }
        Update: {
          active?: boolean
          category?: string
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          points_cost?: number
          title?: string
        }
        Relationships: []
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
      plan_views: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_views_plan_id_fkey"
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
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          plan_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          plan_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          plan_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          reward_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reward_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "partner_rewards"
            referencedColumns: ["id"]
          },
        ]
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
