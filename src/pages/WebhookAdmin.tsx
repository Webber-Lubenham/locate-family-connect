
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { WebhookEventType } from '@/lib/webhook/types';
import { ArrowLeft, AlertTriangle, CheckCircle, RefreshCw, Clipboard } from 'lucide-react';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created_at: string;
  signature: string;
}

const WebhookAdmin: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch webhook events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Since we don't have webhook_events in the TypeScript types yet,
      // let's use auth_logs as a temporary solution with proper filtering
      let query = supabase
        .from('auth_logs')
        .select('*')
        .order('occurred_at', { ascending: false });
      
      // Filter to get only webhook-related events
      if (selectedTab !== 'all') {
        query = query.eq('event_type', selectedTab);
      } else {
        // Filter for webhook-related events
        query = query.like('event_type', '%webhook%');
      }
      
      // Limit to 100 most recent events
      query = query.limit(100);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match the WebhookEvent interface
      const transformedData: WebhookEvent[] = (data || []).map((item) => ({
        id: item.id.toString(),
        type: item.event_type || 'unknown',
        data: item.metadata || {},
        created_at: item.occurred_at || new Date().toISOString(),
        signature: item.metadata?.signature || ''
      }));
      
      setEvents(transformedData);
    } catch (error: any) {
      console.error('Error fetching webhook events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [selectedTab]);

  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    const webhookUrl = `https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/webhook-handler`;
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'URL Copied',
      description: 'Webhook URL copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Webhook Admin</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={fetchEvents} variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={copyWebhookUrl} className="gap-1">
            <Clipboard className="h-4 w-4" />
            Copy Webhook URL
          </Button>
        </div>
      </div>
      
      {/* Webhook information card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="font-medium">Webhook URL:</p>
              <code className="bg-muted p-2 block rounded-md text-sm">
                https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/webhook-handler
              </code>
            </div>
            <div>
              <p className="font-medium">Secret Key:</p>
              <code className="bg-muted p-2 block rounded-md text-sm">
                whsec_3PJt8OntzAgvdOGUmC5U0gJWTC3H4cCQ
              </code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mt-2">
                Add the <code>x-webhook-signature</code> header with the secret key to authenticate your webhook requests.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Events list */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value={WebhookEventType.EMAIL_DELIVERED}>Email Delivered</TabsTrigger>
          <TabsTrigger value={WebhookEventType.EMAIL_FAILED}>Email Failed</TabsTrigger>
          <TabsTrigger value={WebhookEventType.LOCATION_SHARED}>Location Shared</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {selectedTab === 'all' ? 'All Events' : `${selectedTab} Events`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No webhook events found
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          {event.type.includes('failed') ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          )}
                          <span className="font-medium">{event.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookAdmin;
