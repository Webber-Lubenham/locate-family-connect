export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
      }
    }
    Functions: {
      get_student_locations_for_guardian: {
        Args: {
          p_student_id: string;
          p_guardian_email?: string;
        };
        Returns: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          address: string | null;
          shared_with_guardians: boolean;
        }[];
      };
    }
  }
} 