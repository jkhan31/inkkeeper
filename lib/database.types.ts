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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          cover_color: string | null
          cover_url: string | null
          created_at: string | null
          current_unit: number | null
          format: string | null
          genre_type: string | null
          id: string
          shelf_name: string | null
          status: string | null
          title: string
          total_units: number | null
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_color?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_unit?: number | null
          format?: string | null
          genre_type?: string | null
          id?: string
          shelf_name?: string | null
          status?: string | null
          title: string
          total_units?: number | null
          user_id: string
        }
        Update: {
          author?: string | null
          cover_color?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_unit?: number | null
          format?: string | null
          genre_type?: string | null
          id?: string
          shelf_name?: string | null
          status?: string | null
          title?: string
          total_units?: number | null
          user_id?: string
        }
        Relationships: []
      }
      companions: {
        Row: {
          created_at: string | null
          id: string
          maxed_at: string | null
          nickname: string | null
          species: string
          status: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          maxed_at?: string | null
          nickname?: string | null
          species: string
          status?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          maxed_at?: string | null
          nickname?: string | null
          species?: string
          status?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_book_id: string | null
          active_companion_id: string | null
          ai_opt_in: boolean | null
          app_version: string | null
          country_code: string | null
          current_streak: number | null
          daily_goal_amount: number | null
          device_os: string | null
          email: string | null
          golden_bookmarks: number
          id: string
          ink_drops: number | null
          is_premium: boolean | null
          last_session_at: string | null
          preferred_format: string | null
          streak_rewarded_at: number | null
          streak_target: number | null
          timezone: string | null
        }
        Insert: {
          active_book_id?: string | null
          active_companion_id?: string | null
          ai_opt_in?: boolean | null
          app_version?: string | null
          country_code?: string | null
          current_streak?: number | null
          daily_goal_amount?: number | null
          device_os?: string | null
          email?: string | null
          golden_bookmarks?: number
          id: string
          ink_drops?: number | null
          is_premium?: boolean | null
          last_session_at?: string | null
          preferred_format?: string | null
          streak_rewarded_at?: number | null
          streak_target?: number | null
          timezone?: string | null
        }
        Update: {
          active_book_id?: string | null
          active_companion_id?: string | null
          ai_opt_in?: boolean | null
          app_version?: string | null
          country_code?: string | null
          current_streak?: number | null
          daily_goal_amount?: number | null
          device_os?: string | null
          email?: string | null
          golden_bookmarks?: number
          id?: string
          ink_drops?: number | null
          is_premium?: boolean | null
          last_session_at?: string | null
          preferred_format?: string | null
          streak_rewarded_at?: number | null
          streak_target?: number | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_book_id_fkey"
            columns: ["active_book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          book_id: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          pages_read: number | null
          reflection_data: Json | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          pages_read?: number | null
          reflection_data?: Json | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          pages_read?: number | null
          reflection_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: { Args: never; Returns: undefined }
      get_reading_summary: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          best_day_date: string
          most_sessions_in_a_day: number
          total_minutes_read: number
          total_pages_read: number
          total_sessions: number
        }[]
      }
      log_session_atomic: {
        Args: {
          p_active_companion_id: string
          p_book_id: string
          p_duration_seconds: number
          p_ink_gained: number
          p_new_book_unit: number
          p_pages_read: number
          p_reflection_data: Json
          p_user_id: string
          p_xp_gained: number
        }
        Returns: undefined
      }
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
