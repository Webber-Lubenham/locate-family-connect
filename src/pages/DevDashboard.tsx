import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, Globe, Mail, RefreshCcw, Server, Terminal, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DevDashboard: React.FC = () => {
  const { user, loading, session } = useUnifiedAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('database');

  useEffect(() => {
    if (!user || loading) return;

    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error('Error fetching profiles:', error);
          setError('Failed to load profiles.');
        } else {
          setProfiles(data || []);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles.');
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [user, loading]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center">Not authenticated.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Developer Dashboard</CardTitle>
          <CardDescription>Tools and information for developers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
            <TabsList>
              <TabsTrigger value="database">
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="authentication">
                <User className="mr-2 h-4 w-4" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="api">
                <Server className="mr-2 h-4 w-4" />
                API
              </TabsTrigger>
              <TabsTrigger value="emails">
                <Mail className="mr-2 h-4 w-4" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Terminal className="mr-2 h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="environment">
                <Globe className="mr-2 h-4 w-4" />
                Environment
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="database" className="space-y-2">
                <h3 className="text-lg font-semibold">Profiles</h3>
                {loadingProfiles ? (
                  <div>Loading profiles...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            User Type
                          </th>
                          <th className="px-6 py-3 bg-gray-50"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profiles.map((profile) => (
                          <tr key={profile.id}>
                            <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                              {profile.id}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                              {profile.user_id}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                              {profile.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                              {profile.user_type}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                              <Button variant="outline">Edit</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="authentication">
                <h3 className="text-lg font-semibold">Authentication Details</h3>
                <div className="mt-2">
                  <p>
                    <strong>User ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>User Type:</strong> {user.user_metadata?.user_type}
                  </p>
                  <p>
                    <strong>Session:</strong> {session ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="api">
                <h3 className="text-lg font-semibold">API Endpoints</h3>
                <div className="mt-2">
                  <p>List of available API endpoints and their documentation.</p>
                  <ul>
                    <li>/api/students</li>
                    <li>/api/guardians</li>
                    <li>/api/locations</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="emails">
                <h3 className="text-lg font-semibold">Email Configuration</h3>
                <div className="mt-2">
                  <p>Settings for sending emails, including templates and API keys.</p>
                  <Button variant="outline">Test Email Configuration</Button>
                </div>
              </TabsContent>

              <TabsContent value="logs">
                <h3 className="text-lg font-semibold">System Logs</h3>
                <div className="mt-2">
                  <p>View and analyze system logs for debugging and monitoring.</p>
                  <Button variant="outline">View Logs</Button>
                </div>
              </TabsContent>

              <TabsContent value="environment">
                <h3 className="text-lg font-semibold">Environment Variables</h3>
                <div className="mt-2">
                  <p>List of environment variables and their values.</p>
                  <ul>
                    <li><code>VITE_SUPABASE_URL</code>: {process.env.VITE_SUPABASE_URL}</li>
                    <li><code>VITE_SUPABASE_ANON_KEY</code>: {process.env.VITE_SUPABASE_ANON_KEY}</li>
                  </ul>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="secondary">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DevDashboard;
