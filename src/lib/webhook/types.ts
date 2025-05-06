
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  created_at: string;
  signature: string;
}

export enum WebhookEventType {
  EMAIL_DELIVERED = 'email.delivered',
  EMAIL_FAILED = 'email.failed',
  LOCATION_SHARED = 'location.shared',
  LOCATION_REQUEST = 'location.request',
  STUDENT_CONNECTED = 'student.connected',
  GUARDIAN_CONNECTED = 'guardian.connected',
  SYSTEM_ALERT = 'system.alert'
}

export interface WebhookPayload {
  event: WebhookEventType;
  data: any;
  timestamp: string;
  source: string;
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
  event_id?: string;
  error?: any;
}
