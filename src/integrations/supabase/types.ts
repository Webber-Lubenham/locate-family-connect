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
      access_attempts: {
        Row: {
          attempted_route: string
          created_at: string | null
          id: string
          ip_address: string | null
          required_role: string
          user_agent: string | null
          user_id: string | null
          user_role: string
        }
        Insert: {
          attempted_route: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          required_role: string
          user_agent?: string | null
          user_id?: string | null
          user_role: string
        }
        Update: {
          attempted_route?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          required_role?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string | null
          date: string
          id: string
          latitude: number | null
          longitude: number | null
          notification_sent: boolean | null
          notification_time: string | null
          report_time: string | null
          reported_by: string | null
          school_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notification_sent?: boolean | null
          notification_time?: string | null
          report_time?: string | null
          reported_by?: string | null
          school_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notification_sent?: boolean | null
          notification_time?: string | null
          report_time?: string | null
          reported_by?: string | null
          school_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          successful: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          successful?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          successful?: boolean | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      children: {
        Row: {
          address: string | null
          admission_date: string | null
          birth_city: string | null
          birth_country: string | null
          birth_date: string
          birth_state: string | null
          cpf: string | null
          created_at: string | null
          document_status: string | null
          document_url: string | null
          document_verified: boolean | null
          document_verified_at: string | null
          document_verified_by: string | null
          email: string | null
          email_sent: boolean | null
          father_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          grade: string | null
          id: string
          invitation_sent_at: string | null
          is_confirmed: boolean | null
          last_location_lat: number | null
          last_location_lng: number | null
          last_location_updated: string | null
          last_login: string | null
          mother_birth_date: string | null
          mother_name: string | null
          name: string
          nationality: string | null
          neighborhood: string | null
          parent_id: string | null
          phone_number: string | null
          postal_code: string | null
          presentation_date: string | null
          presentation_location: string | null
          race: Database["public"]["Enums"]["race_type"] | null
          registration_number: string
          school_id: string | null
          shift: string | null
          status: string | null
          temp_password: string | null
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date: string
          birth_state?: string | null
          cpf?: string | null
          created_at?: string | null
          document_status?: string | null
          document_url?: string | null
          document_verified?: boolean | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          email?: string | null
          email_sent?: boolean | null
          father_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade?: string | null
          id?: string
          invitation_sent_at?: string | null
          is_confirmed?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_location_updated?: string | null
          last_login?: string | null
          mother_birth_date?: string | null
          mother_name?: string | null
          name: string
          nationality?: string | null
          neighborhood?: string | null
          parent_id?: string | null
          phone_number?: string | null
          postal_code?: string | null
          presentation_date?: string | null
          presentation_location?: string | null
          race?: Database["public"]["Enums"]["race_type"] | null
          registration_number: string
          school_id?: string | null
          shift?: string | null
          status?: string | null
          temp_password?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date?: string
          birth_state?: string | null
          cpf?: string | null
          created_at?: string | null
          document_status?: string | null
          document_url?: string | null
          document_verified?: boolean | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          email?: string | null
          email_sent?: boolean | null
          father_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade?: string | null
          id?: string
          invitation_sent_at?: string | null
          is_confirmed?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_location_updated?: string | null
          last_login?: string | null
          mother_birth_date?: string | null
          mother_name?: string | null
          name?: string
          nationality?: string | null
          neighborhood?: string | null
          parent_id?: string | null
          phone_number?: string | null
          postal_code?: string | null
          presentation_date?: string | null
          presentation_location?: string | null
          race?: Database["public"]["Enums"]["race_type"] | null
          registration_number?: string
          school_id?: string | null
          shift?: string | null
          status?: string | null
          temp_password?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          school_id: string
          start_time: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          school_id: string
          start_time: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          school_id?: string
          start_time?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string | null
          enrolled_at: string | null
          id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_changes: {
        Row: {
          action: string
          child_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          child_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          child_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_changes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      directors: {
        Row: {
          cpf: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          password_changed_at: string | null
          phone: string | null
          rg: string | null
          temp_password: string | null
          updated_at: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          password_changed_at?: string | null
          phone?: string | null
          rg?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          password_changed_at?: string | null
          phone?: string | null
          rg?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          delivery_status: string | null
          error_message: string | null
          guardian_email: string
          id: string
          message_id: string | null
          message_type: string
          service_response: Json | null
          status: string
          student_id: string | null
          subject: string | null
          timestamp: string
          updated_at: string | null
          verification_date: string | null
        }
        Insert: {
          delivery_status?: string | null
          error_message?: string | null
          guardian_email: string
          id?: string
          message_id?: string | null
          message_type?: string
          service_response?: Json | null
          status: string
          student_id?: string | null
          subject?: string | null
          timestamp?: string
          updated_at?: string | null
          verification_date?: string | null
        }
        Update: {
          delivery_status?: string | null
          error_message?: string | null
          guardian_email?: string
          id?: string
          message_id?: string | null
          message_type?: string
          service_response?: Json | null
          status?: string
          student_id?: string | null
          subject?: string | null
          timestamp?: string
          updated_at?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          content: string
          created_at: string | null
          id: string
          processed: boolean | null
          processed_at: string | null
          recipient: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          recipient: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          recipient?: string
          subject?: string
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      guardian_notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          guardian_id: string | null
          id: string
          sms_enabled: boolean | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          guardian_id?: string | null
          id?: string
          sms_enabled?: boolean | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          guardian_id?: string | null
          id?: string
          sms_enabled?: boolean | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_notification_preferences_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          id: string
          is_primary: boolean | null
          nome: string
          sms_number: string | null
          status: string | null
          student_id: string | null
          telefone: string
          temp_password: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean | null
          nome: string
          sms_number?: string | null
          status?: string | null
          student_id?: string | null
          telefone: string
          temp_password?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean | null
          nome?: string
          sms_number?: string | null
          status?: string | null
          student_id?: string | null
          telefone?: string
          temp_password?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      identity_verification_requests: {
        Row: {
          document_number: string
          document_type: string
          id: string
          profile_id: string | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_number: string
          document_type: string
          id?: string
          profile_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_number?: string
          document_type?: string
          id?: string
          profile_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          subject?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          parent_id: string | null
          role: string
          token: string | null
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          parent_id?: string | null
          role: string
          token?: string | null
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          parent_id?: string | null
          role?: string
          token?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
      location_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          is_resolved: boolean | null
          latitude: number | null
          longitude: number | null
          resolved_at: string | null
          student_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          student_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      location_updates: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          created_at: string
          device_id: string | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
          status: Database["public"]["Enums"]["student_status"]
          student_id: string
          timestamp: string
          transport_mode: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id: string
          timestamp?: string
          transport_mode?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id?: string
          timestamp?: string
          transport_mode?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          login_type: Database["public"]["Enums"]["login_type"]
          metadata: Json | null
          successful: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          login_type: Database["public"]["Enums"]["login_type"]
          metadata?: Json | null
          successful?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          login_type?: Database["public"]["Enums"]["login_type"]
          metadata?: Json | null
          successful?: boolean | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string | null
          id: number
          level: string | null
          message: string
          metadata: Json | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          level?: string | null
          message: string
          metadata?: Json | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          level?: string | null
          message?: string
          metadata?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          guardian_email: string | null
          id: string
          notification_type: string | null
          status: string
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          guardian_email?: string | null
          id?: string
          notification_type?: string | null
          status: string
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          guardian_email?: string | null
          id?: string
          notification_type?: string | null
          status?: string
          student_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          content: Json
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          recipient_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          recipient_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          recipient_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          student_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          student_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          student_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_relations: {
        Row: {
          accepted_at: string | null
          child_email: string
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          parent_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          child_email: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token: string
          parent_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          child_email?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          parent_id?: string
          status?: string
        }
        Relationships: []
      }
      parent_notification_preferences: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notification_type:
            | Database["public"]["Enums"]["notification_type"]
            | null
          parent_id: string
          student_id: string
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          parent_id: string
          student_id: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          parent_id?: string
          student_id?: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_notification_preferences_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "responsible_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_notification_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          created_at: string | null
          director_email: string
          id: string
          school_cnpj: string
          school_name: string
          status: string | null
          temp_password: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          director_email: string
          id?: string
          school_cnpj: string
          school_name: string
          status?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          director_email?: string
          id?: string
          school_cnpj?: string
          school_name?: string
          status?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean | null
          class_period: string | null
          country: string | null
          created_at: string
          document_number: string | null
          email: string | null
          enrollment_date: string | null
          failed_attempts: number | null
          failed_login_attempts: number | null
          full_name: string | null
          grade: string | null
          guardian_name: string | null
          id: string
          identity_document_number: string | null
          identity_document_type: string | null
          identity_verification_date: string | null
          identity_verified: boolean | null
          last_failed_attempt: string | null
          last_login_attempt: string | null
          locked_until: string | null
          login_attempts: number | null
          name: string | null
          password_changed_at: string | null
          phone_number: string | null
          position: string | null
          role: string
          school_id: string | null
          student_id: string | null
          student_name: string | null
          temp_password: string | null
          temp_password_created_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          class_period?: string | null
          country?: string | null
          created_at?: string
          document_number?: string | null
          email?: string | null
          enrollment_date?: string | null
          failed_attempts?: number | null
          failed_login_attempts?: number | null
          full_name?: string | null
          grade?: string | null
          guardian_name?: string | null
          id: string
          identity_document_number?: string | null
          identity_document_type?: string | null
          identity_verification_date?: string | null
          identity_verified?: boolean | null
          last_failed_attempt?: string | null
          last_login_attempt?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          name?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          position?: string | null
          role?: string
          school_id?: string | null
          student_id?: string | null
          student_name?: string | null
          temp_password?: string | null
          temp_password_created_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          class_period?: string | null
          country?: string | null
          created_at?: string
          document_number?: string | null
          email?: string | null
          enrollment_date?: string | null
          failed_attempts?: number | null
          failed_login_attempts?: number | null
          full_name?: string | null
          grade?: string | null
          guardian_name?: string | null
          id?: string
          identity_document_number?: string | null
          identity_document_type?: string | null
          identity_verification_date?: string | null
          identity_verified?: boolean | null
          last_failed_attempt?: string | null
          last_login_attempt?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          name?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          position?: string | null
          role?: string
          school_id?: string | null
          student_id?: string | null
          student_name?: string | null
          temp_password?: string | null
          temp_password_created_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      responsible_persons: {
        Row: {
          city: string
          country: string
          cpf: string
          created_at: string
          email: string
          full_name: string
          id: string
          number: string
          password: string | null
          phone: string
          postal_code: string
          relationship: string
          role: string
          state: string
          status: string | null
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          cpf: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          number: string
          password?: string | null
          phone: string
          postal_code: string
          relationship: string
          role?: string
          state: string
          status?: string | null
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          cpf?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          number?: string
          password?: string | null
          phone?: string
          postal_code?: string
          relationship?: string
          role?: string
          state?: string
          status?: string | null
          street?: string
          updated_at?: string
        }
        Relationships: []
      }
      responsible_persons_backup: {
        Row: {
          city: string | null
          country: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          number: string | null
          password: string | null
          phone: string | null
          postal_code: string | null
          relationship: string | null
          role: string | null
          state: string | null
          status: string | null
          street: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          number?: string | null
          password?: string | null
          phone?: string | null
          postal_code?: string | null
          relationship?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          number?: string | null
          password?: string | null
          phone?: string | null
          postal_code?: string | null
          relationship?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      safe_zones: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          parent_id: string
          radius: number
          student_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          parent_id: string
          radius: number
          student_id: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          parent_id?: string
          radius?: number
          student_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safe_zones_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "responsible_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safe_zones_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      school_locations: {
        Row: {
          address: string
          created_at: string
          geofence_radius: number | null
          id: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          address: string
          created_at?: string
          geofence_radius?: number | null
          id?: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          address?: string
          created_at?: string
          geofence_radius?: number | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string
          city: string | null
          cnpj: string | null
          created_at: string | null
          creation_act: string | null
          creation_date: string | null
          director_id: string | null
          email: string | null
          id: string
          inep_code: string | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          phone_number: string | null
          postal_code: string | null
          radius: number
          state: string | null
          website: string | null
        }
        Insert: {
          address: string
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          creation_act?: string | null
          creation_date?: string | null
          director_id?: string | null
          email?: string | null
          id?: string
          inep_code?: string | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          phone_number?: string | null
          postal_code?: string | null
          radius?: number
          state?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          creation_act?: string | null
          creation_date?: string | null
          director_id?: string | null
          email?: string | null
          id?: string
          inep_code?: string | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          phone_number?: string | null
          postal_code?: string | null
          radius?: number
          state?: string | null
          website?: string | null
        }
        Relationships: []
      }
      student_attendance_declarations: {
        Row: {
          birth_city: string | null
          birth_country: string | null
          birth_date: string | null
          birth_state: string | null
          credentials_sent: boolean | null
          file_name: string
          file_path: string
          grade: string | null
          id: string
          parent_id: string
          processed: boolean | null
          registration_number: string
          school_address: string | null
          school_city: string | null
          school_creation_act: string | null
          school_creation_date: string | null
          school_id: string | null
          school_inep: string | null
          school_name: string | null
          school_phone: string | null
          school_postal_code: string | null
          school_state: string | null
          shift: string | null
          status: string | null
          student_email: string | null
          student_id: string | null
          student_name: string
          student_phone: string | null
          upload_date: string | null
        }
        Insert: {
          birth_city?: string | null
          birth_country?: string | null
          birth_date?: string | null
          birth_state?: string | null
          credentials_sent?: boolean | null
          file_name: string
          file_path: string
          grade?: string | null
          id?: string
          parent_id: string
          processed?: boolean | null
          registration_number: string
          school_address?: string | null
          school_city?: string | null
          school_creation_act?: string | null
          school_creation_date?: string | null
          school_id?: string | null
          school_inep?: string | null
          school_name?: string | null
          school_phone?: string | null
          school_postal_code?: string | null
          school_state?: string | null
          shift?: string | null
          status?: string | null
          student_email?: string | null
          student_id?: string | null
          student_name: string
          student_phone?: string | null
          upload_date?: string | null
        }
        Update: {
          birth_city?: string | null
          birth_country?: string | null
          birth_date?: string | null
          birth_state?: string | null
          credentials_sent?: boolean | null
          file_name?: string
          file_path?: string
          grade?: string | null
          id?: string
          parent_id?: string
          processed?: boolean | null
          registration_number?: string
          school_address?: string | null
          school_city?: string | null
          school_creation_act?: string | null
          school_creation_date?: string | null
          school_id?: string | null
          school_inep?: string | null
          school_name?: string | null
          school_phone?: string | null
          school_postal_code?: string | null
          school_state?: string | null
          shift?: string | null
          status?: string | null
          student_email?: string | null
          student_id?: string | null
          student_name?: string
          student_phone?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_declarations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "responsible_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_declarations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_declarations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          created_at: string | null
          discipline: string
          grade_level: number
          hours: number | null
          id: string
          school_id: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discipline: string
          grade_level: number
          hours?: number | null
          id?: string
          school_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discipline?: string
          grade_level?: number
          hours?: number | null
          id?: string
          school_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_devices: {
        Row: {
          created_at: string
          device_id: string
          device_model: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          last_seen: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_model?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_model?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_devices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          id: string
          metadata: Json | null
          parent_id: string
          status: string | null
          student_id: string
          uploaded_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          id?: string
          metadata?: Json | null
          parent_id: string
          status?: string | null
          student_id: string
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          parent_id?: string
          status?: string | null
          student_id?: string
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_education: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          school_name: string
          shift: string
          start_date: string | null
          student_id: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          school_name: string
          shift: string
          start_date?: string | null
          student_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          school_name?: string
          shift?: string
          start_date?: string | null
          student_id?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_education_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          parent_id: string
          student_id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          parent_id: string
          student_id: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          parent_id?: string
          student_id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "student_invitations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_locations: {
        Row: {
          created_at: string
          id: string
          is_within_school: boolean | null
          latitude: number
          longitude: number
          student_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_within_school?: boolean | null
          latitude: number
          longitude: number
          student_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_within_school?: boolean | null
          latitude?: number
          longitude?: number
          student_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_locations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          student_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          student_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          student_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      student_verification_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          id: string
          metadata: Json | null
          parent_id: string | null
          status: string | null
          student_id: string | null
          uploaded_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          status?: string | null
          student_id?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          status?: string | null
          student_id?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_verification_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      user_details: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          phone: string | null
          registration_number: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          last_login?: string | null
          phone?: string | null
          registration_number?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          phone?: string | null
          registration_number?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: number
          profile_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          profile_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          parent_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          parent_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          parent_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_relationships: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          relationship_type: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          relationship_type?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          relationship_type?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_login_attempts: {
        Args: { p_email: string }
        Returns: boolean
      }
      clean_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_or_get_school: {
        Args: {
          p_name: string
          p_inep_code: string
          p_address: string
          p_state: string
          p_city: string
          p_postal_code: string
          p_creation_act: string
          p_creation_date: string
          p_phone: string
          p_email: string
        }
        Returns: string
      }
      create_password_reset_token: {
        Args: { user_email: string }
        Returns: string
      }
      create_student_account: {
        Args: {
          p_name: string
          p_email: string
          p_registration_number: string
          p_birth_date: string
          p_parent_id: string
        }
        Returns: string
      }
      generate_student_credentials: {
        Args: { student_id: string; student_email: string }
        Returns: undefined
      }
      generate_student_invitation: {
        Args: { p_student_id: string; p_parent_id: string; p_email: string }
        Returns: string
      }
      generate_temp_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_guardian_of: {
        Args: { guardian_id: string; student_id: string }
        Returns: boolean
      }
      is_guardian_or_student: {
        Args: { guardian_id: string; student_id: string }
        Returns: boolean
      }
      is_point_in_safe_zone: {
        Args: { p_latitude: number; p_longitude: number; p_student_id: string }
        Returns: boolean
      }
      mark_token_used: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      register_student: {
        Args: {
          p_name: string
          p_birth_date: string
          p_birth_city: string
          p_birth_state: string
          p_birth_country: string
          p_registration_number: string
          p_email: string
          p_grade: string
          p_shift: string
          p_school_id: string
          p_parent_id: string
        }
        Returns: string
      }
      send_email: {
        Args: { p_to: string; p_subject: string; p_html_content: string }
        Returns: boolean
      }
      update_guardian_invitation_timestamp: {
        Args: { guardian_id: string; sent_at: string }
        Returns: undefined
      }
      update_temp_password: {
        Args: { user_email: string }
        Returns: string
      }
      validate_reset_token: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      validate_student_registration: {
        Args: {
          p_registration_number: string
          p_student_email: string
          p_student_name: string
        }
        Returns: boolean
      }
      verify_email_token: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      verify_password: {
        Args: { user_password: string; stored_password: string }
        Returns: boolean
      }
      verify_responsible_person_password: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
      verify_responsible_person_password_by_cpf: {
        Args: { p_cpf: string; p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      document_type:
        | "enrollment_declaration"
        | "birth_certificate"
        | "identity_document"
        | "proof_of_residence"
      gender_type: "male" | "female" | "other" | "not_specified"
      guardian_type: "primary" | "secondary"
      login_type: "auth_users" | "responsible_persons"
      notification_type: "whatsapp" | "email" | "both"
      race_type:
        | "white"
        | "black"
        | "brown"
        | "indigenous"
        | "asian"
        | "not_specified"
      student_status:
        | "in_class"
        | "in_transit"
        | "at_home"
        | "unknown"
        | "emergency"
      user_role: "student" | "guardian" | "admin" | "school"
      user_type: "student" | "parent" | "teacher" | "admin"
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
    Enums: {
      document_type: [
        "enrollment_declaration",
        "birth_certificate",
        "identity_document",
        "proof_of_residence",
      ],
      gender_type: ["male", "female", "other", "not_specified"],
      guardian_type: ["primary", "secondary"],
      login_type: ["auth_users", "responsible_persons"],
      notification_type: ["whatsapp", "email", "both"],
      race_type: [
        "white",
        "black",
        "brown",
        "indigenous",
        "asian",
        "not_specified",
      ],
      student_status: [
        "in_class",
        "in_transit",
        "at_home",
        "unknown",
        "emergency",
      ],
      user_role: ["student", "guardian", "admin", "school"],
      user_type: ["student", "parent", "teacher", "admin"],
    },
  },
} as const
