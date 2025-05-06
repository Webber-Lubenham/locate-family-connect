// Definição dos tipos específicos para o app mobile
export type UserType = 'student' | 'parent' | 'developer';

export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  shared_with_guardians: boolean;
  user_id: string;
  address?: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type Guardian = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  is_active: boolean;
};

// Tipo simplificado para Database para o MVP mobile
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          user_type: UserType;
          phone?: string;
          created_at: string;
        };
      };
      guardians: {
        Row: {
          id: string;
          student_id: string;
          email: string;
          phone?: string;
          is_active: boolean;
          created_at: string;
        };
      };
      locations: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          created_at: string;
          shared_with_guardians: boolean;
          address?: string;
        };
      };
      auth_logs: {
        Row: {
          id: number;
          user_id: string;
          event_type: string;
          occurred_at: string;
          metadata: any;
        };
      };
    };
    Functions: {
      get_student_locations_for_guardian: {
        Args: {
          p_student_id: string;
        };
        Returns: Location[];
      };
      save_student_location: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_shared_with_guardians: boolean;
        };
        Returns: {
          success: boolean;
          message?: string;
        };
      };
      log_auth_event: {
        Args: {
          p_event_type: string;
          p_metadata?: any;
        };
        Returns: void;
      };
    };
  };
};
