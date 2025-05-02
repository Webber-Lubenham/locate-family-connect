
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
