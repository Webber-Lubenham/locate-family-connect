export interface UserSession {
  id: string;
  email: string;
  user_metadata?: {
    user_type?: string;
    full_name?: string;
    phone?: string;
    [key: string]: any;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface StudentWithProfiles extends Student {
  user_profiles?: {
    name: string;
    email: string;
  };
}

// Add a consistent GuardianData interface to be used across the application
export interface GuardianData {
  id: string;
  student_id: string;
  guardian_id?: string | null;
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  relationship_type?: string;
  status?: 'pending' | 'active' | 'rejected';
}
