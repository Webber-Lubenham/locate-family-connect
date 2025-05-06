
import { supabase } from '@/lib/supabase';
import { WebhookEvent, WebhookEventType, WebhookPayload, WebhookProcessResult } from './types';
import { recordServiceEvent, ServiceType, SeverityLevel } from '../monitoring/service-monitor';

export class WebhookService {
  private readonly secretKey: string;
  
  constructor(secretKey?: string) {
    // This is just for initialization - we'll use the key from env vars in the edge function
    this.secretKey = secretKey || 'whsec_3PJt8OntzAgvdOGUmC5U0gJWTC3H4cCQ';
  }
  
  /**
   * Verify webhook signature to ensure it's from a trusted source
   */
  verifySignature(payload: string, signature: string): boolean {
    // In a real implementation, this would use crypto to verify HMAC signature
    // For now, we'll just do a basic check
    return !!signature && signature.startsWith('whsec_');
  }
  
  /**
   * Process incoming webhook event
   */
  async processWebhook(event: WebhookPayload, signature: string): Promise<WebhookProcessResult> {
    try {
      // Verify webhook signature
      if (!this.verifySignature(JSON.stringify(event), signature)) {
        recordServiceEvent(
          ServiceType.WEBHOOK, 
          SeverityLevel.WARNING, 
          'Invalid webhook signature', 
          { eventType: event.event }
        );
        return {
          success: false,
          message: 'Invalid signature'
        };
      }
      
      // Log the webhook event
      recordServiceEvent(
        ServiceType.WEBHOOK, 
        SeverityLevel.INFO, 
        `Received webhook event: ${event.event}`, 
        { eventData: event.data }
      );
      
      // Process based on event type
      switch (event.event) {
        case WebhookEventType.EMAIL_DELIVERED:
          return this.handleEmailDelivered(event);
          
        case WebhookEventType.EMAIL_FAILED:
          return this.handleEmailFailed(event);
          
        case WebhookEventType.LOCATION_SHARED:
          return this.handleLocationShared(event);
          
        case WebhookEventType.LOCATION_REQUEST:
          return this.handleLocationRequest(event);
          
        default:
          // Store unknown events too
          await this.storeWebhookEvent(event, signature);
          return {
            success: true,
            message: `Event stored: ${event.event}`
          };
      }
    } catch (error) {
      recordServiceEvent(
        ServiceType.WEBHOOK, 
        SeverityLevel.ERROR, 
        'Error processing webhook', 
        { error }
      );
      return {
        success: false,
        message: 'Error processing webhook',
        error
      };
    }
  }
  
  /**
   * Store webhook event in database
   */
  private async storeWebhookEvent(event: WebhookPayload, signature: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .insert({
          type: event.event,
          data: event.data,
          signature: signature,
          source: event.source
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      return data?.id || null;
    } catch (error) {
      recordServiceEvent(
        ServiceType.WEBHOOK, 
        SeverityLevel.ERROR, 
        'Error storing webhook event', 
        { error, event }
      );
      return null;
    }
  }
  
  /**
   * Handle email delivered event
   */
  private async handleEmailDelivered(event: WebhookPayload): Promise<WebhookProcessResult> {
    try {
      const eventId = await this.storeWebhookEvent(event, '');
      
      // Additional logic for email delivered events
      // Update notification status if this is a location share email
      if (event.data?.metadata?.type === 'location_share') {
        await this.updateNotificationStatus(
          event.data.metadata.locationId,
          'delivered'
        );
      }
      
      recordServiceEvent(
        ServiceType.EMAIL, 
        SeverityLevel.INFO, 
        'Email delivered successfully', 
        { recipient: event.data?.to, messageId: event.data?.messageId }
      );
      
      return {
        success: true,
        message: 'Email delivery event processed',
        event_id: eventId || undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process email delivery event',
        error
      };
    }
  }
  
  /**
   * Handle email failed event
   */
  private async handleEmailFailed(event: WebhookPayload): Promise<WebhookProcessResult> {
    try {
      const eventId = await this.storeWebhookEvent(event, '');
      
      // Additional logic for email failure events
      // Update notification status if this is a location share email
      if (event.data?.metadata?.type === 'location_share') {
        await this.updateNotificationStatus(
          event.data.metadata.locationId,
          'failed'
        );
      }
      
      recordServiceEvent(
        ServiceType.EMAIL, 
        SeverityLevel.WARNING, 
        'Email delivery failed', 
        { 
          recipient: event.data?.to, 
          reason: event.data?.reason,
          messageId: event.data?.messageId 
        }
      );
      
      return {
        success: true,
        message: 'Email failure event processed',
        event_id: eventId || undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process email failure event',
        error
      };
    }
  }
  
  /**
   * Handle location shared event
   */
  private async handleLocationShared(event: WebhookPayload): Promise<WebhookProcessResult> {
    try {
      const eventId = await this.storeWebhookEvent(event, '');
      
      // Additional logic for location shared events
      recordServiceEvent(
        ServiceType.LOCATION, 
        SeverityLevel.INFO, 
        'Location shared via webhook', 
        { 
          studentId: event.data?.studentId,
          guardianEmail: event.data?.guardianEmail,
          latitude: event.data?.latitude,
          longitude: event.data?.longitude
        }
      );
      
      return {
        success: true,
        message: 'Location shared event processed',
        event_id: eventId || undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process location shared event',
        error
      };
    }
  }
  
  /**
   * Handle location request event
   */
  private async handleLocationRequest(event: WebhookPayload): Promise<WebhookProcessResult> {
    try {
      const eventId = await this.storeWebhookEvent(event, '');
      
      // Additional logic for location request events
      recordServiceEvent(
        ServiceType.LOCATION, 
        SeverityLevel.INFO, 
        'Location request via webhook', 
        { 
          guardianId: event.data?.guardianId,
          studentEmail: event.data?.studentEmail
        }
      );
      
      return {
        success: true,
        message: 'Location request event processed',
        event_id: eventId || undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process location request event',
        error
      };
    }
  }
  
  /**
   * Update notification status
   */
  private async updateNotificationStatus(locationId: string, status: string): Promise<void> {
    try {
      if (!locationId) return;
      
      await supabase
        .from('location_notifications')
        .update({ status })
        .eq('location_id', locationId);
    } catch (error) {
      recordServiceEvent(
        ServiceType.DATABASE, 
        SeverityLevel.ERROR, 
        'Failed to update notification status', 
        { locationId, status, error }
      );
    }
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
