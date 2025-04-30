
// Definições de tipo compartilhadas para o banco de dados

// Tipo para perfil de usuário
export interface UserProfile {
  id: string;
  user_id?: string;
  full_name: string;
  phone?: string | null;
  email?: string;
  user_type: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Tipo para dados de localização
export interface LocationData {
  id: string;
  user_id: string | number; // Updated to allow both string and number
  latitude: number;
  longitude: number;
  timestamp: string;
  user?: {
    full_name: string;
    role?: string;
    user_type?: string;
  } | null;
}

// Tipo para responsáveis (guardians)
export interface GuardianData {
  id: string;
  student_id: string; // Padronizamos para string para manter consistência com auth.uid()
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
}
