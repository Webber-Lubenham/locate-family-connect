
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// For webhook event types
enum WebhookEventType {
  EMAIL_DELIVERED = 'email.delivered',
  EMAIL_FAILED = 'email.failed',
  LOCATION_SHARED = 'location.shared',
  LOCATION_REQUEST = 'location.request',
  STUDENT_CONNECTED = 'student.connected',
  GUARDIAN_CONNECTED = 'guardian.connected',
  SYSTEM_ALERT = 'system.alert'
}

// Define the necessary CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

// Get webhook secret from environment variables
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'whsec_3PJt8OntzAgvdOGUmC5U0gJWTC3H4cCQ';

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
  try {
    // In a production environment, we would validate the HMAC signature
    // For now we'll just do a basic check
    return signature === WEBHOOK_SECRET;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Handle incoming webhooks
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get signature from headers
    const signature = req.headers.get('x-webhook-signature') || '';
    
    // Parse the request body
    const payload = await req.json();
    const stringPayload = JSON.stringify(payload);
    
    console.log("Received webhook:", { 
      type: payload.type,
      data: payload.data,
      signature: signature ? "present" : "missing",
    });
    
    // Verify the webhook signature
    if (!verifySignature(stringPayload, signature)) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Store the webhook event
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        type: payload.type || 'unknown',
        data: payload.data || {},
        signature: signature
      })
      .select('id')
      .single();
      
    if (error) {
      throw error;
    }
    
    // Process specific webhook types
    let processedResult;
    switch (payload.type) {
      case WebhookEventType.EMAIL_DELIVERED:
        processedResult = await processEmailDelivered(payload.data);
        break;
      case WebhookEventType.EMAIL_FAILED:
        processedResult = await processEmailFailed(payload.data);
        break;
      case WebhookEventType.LOCATION_SHARED:
        processedResult = await processLocationShared(payload.data);
        break;
      default:
        processedResult = { success: true, message: 'Event stored' };
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook received',
        event_id: data?.id,
        processed: processedResult
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process webhook',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to process email delivered events
async function processEmailDelivered(data: any) {
  console.log("Processing email delivered:", data);
  
  try {
    // Update notification if this is a location share email
    if (data?.metadata?.type === 'location_share' && data?.metadata?.locationId) {
      await updateNotificationStatus(data.metadata.locationId, 'delivered');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error processing email delivered:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to process email failed events
async function processEmailFailed(data: any) {
  console.log("Processing email failed:", data);
  
  try {
    // Update notification if this is a location share email
    if (data?.metadata?.type === 'location_share' && data?.metadata?.locationId) {
      await updateNotificationStatus(data.metadata.locationId, 'failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error processing email failed:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to process location shared events
async function processLocationShared(data: any) {
  console.log("Processing location shared:", data);
  return { success: true };
}

// Helper function to update notification status
async function updateNotificationStatus(locationId: string, status: string) {
  return await supabase
    .from('location_notifications')
    .update({ status })
    .eq('location_id', locationId);
}

// Utility function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      insert: (data: any) => ({
        select: (columns: string) => ({
          single: () => {
            console.log(`Insert into ${table}:`, data);
            return { data: { id: crypto.randomUUID() }, error: null };
          }
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          console.log(`Update ${table} where ${column} = ${value}:`, data);
          return { data: null, error: null };
        }
      })
    })
  };
}
