
import { WebhookEventType, WebhookPayload } from './types';

/**
 * Send a test webhook event to the webhook handler
 */
export async function sendTestWebhook(
  eventType: WebhookEventType, 
  data: any
): Promise<{ success: boolean; message: string; response?: any }> {
  try {
    const webhookUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/webhook-handler';
    const webhookSecret = 'whsec_3PJt8OntzAgvdOGUmC5U0gJWTC3H4cCQ';
    
    const payload: WebhookPayload = {
      event: eventType,
      data,
      timestamp: new Date().toISOString(),
      source: 'test-client'
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': webhookSecret
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      message: 'Test webhook sent successfully',
      response: responseData
    };
  } catch (error: any) {
    console.error('Error sending test webhook:', error);
    return {
      success: false,
      message: error.message || 'Failed to send test webhook'
    };
  }
}
