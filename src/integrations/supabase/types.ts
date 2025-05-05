export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_logs: {
        Row: {
          event_type: string | null
          id: number
          metadata: Json | null
          occurred_at: string | null
          user_id: string | null
        }
        Insert: {
          event_type?: string | null
          id?: number
          metadata?: Json | null
          occurred_at?: string | null
          user_id?: string | null
        }
        Update: {
          event_type?: string | null
          id?: number
          metadata?: Json | null
          occurred_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guardians: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      location_notifications: {
        Row: {
          created_at: string | null
          guardian_email: string
          guardian_id: string | null
          id: string
          location_id: string | null
          status: string
          student_id: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_email: string
          guardian_id?: string | null
          id?: string
          location_id?: string | null
          status?: string
          student_id: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_email?: string
          guardian_id?: string | null
          id?: string
          location_id?: string | null
          status?: string
          student_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_notifications_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          id: string
          latitude: number
          longitude: number
          shared_with_guardians: boolean | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          id?: string
          latitude: number
          longitude: number
          shared_with_guardians?: boolean | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          id?: string
          latitude?: number
          longitude?: number
          shared_with_guardians?: boolean | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      locations_backup: {
        Row: {
          id: string | null
          latitude: number | null
          longitude: number | null
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      parent_student_relationships: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          phone: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          email?: string
          full_name: string
          id?: number
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          updated_at: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          updated_at?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      guardian_student_relationships: {
        Row: {
          created_at: string | null
          guardian_email: string | null
          is_active: boolean | null
          relationship_id: string | null
          student_id: string | null
          student_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_guardian_relationship: {
        Args: {
          p_student_id: string
          p_guardian_email: string
          p_guardian_name?: string
          p_guardian_phone?: string
        }
        Returns: boolean
      }
      check_guardian_relationship: {
        Args: { guardian_email: string; student_id: string }
        Returns: boolean
      }
      format_phone: {
        Args: { phone: string }
        Returns: string
      }
      get_guardian_notifications: {
        Args: { p_guardian_email: string }
        Returns: {
          id: string
          location_id: string
          student_id: string
          student_name: string
          status: string
          created_at: string
          latitude: number
          longitude: number
        }[]
      }
      get_guardian_students: {
        Args: Record<PropertyKey, never>
        Returns: {
          student_id: string
          student_email: string
          student_name: string
        }[]
      }
      get_student_guardians_secure: {
        Args: { p_student_id?: string }
        Returns: {
          id: string
          student_id: string
          email: string
          full_name: string
          phone: string
          is_active: boolean
          created_at: string
        }[]
      }
      get_student_locations: {
        Args: { p_guardian_email: string; p_student_id: string }
        Returns: {
          id: string
          user_id: string
          latitude: number
          longitude: number
          location_timestamp: string
          address: string
          student_name: string
          student_email: string
        }[]
      }
      get_student_locations_for_guardian: {
        Args:
          | { p_student_id: string }
          | { p_student_id: string; p_guardian_email?: string }
        Returns: {
          id: string
          user_id: string
          latitude: number
          longitude: number
          timestamp: string
          address: string
          shared_with_guardians: boolean
          student_name: string
        }[]
      }
      get_unread_notifications_count: {
        Args: { p_guardian_email: string }
        Returns: number
      }
      is_strong_password: {
        Args: { password: string }
        Returns: boolean
      }
      is_valid_email: {
        Args: { email: string }
        Returns: boolean
      }
      is_valid_phone: {
        Args: { phone_number: string }
        Returns: boolean
      }
      save_student_location: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_shared_with_guardians?: boolean
        }
        Returns: string
      }
      validate_email: {
        Args: { email: string }
        Returns: boolean
      }
      validate_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      verify_user_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          auth_exists: boolean
          user_exists: boolean
          profile_exists: boolean
          missing_data: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
