
export interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  shared_with_guardians?: boolean;
  address?: string;
}
