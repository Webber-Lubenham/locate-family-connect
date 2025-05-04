
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { UserSession } from '@/types/auth';
import { Badge } from '@/components/ui/badge';

// Constantes para referência de tabelas
const TABLES = {
  GUARDIANS: 'guardians',
  PROFILES: 'profiles',
  USERS: 'users',
  GUARDIAN_STUDENT_RELATIONSHIPS: 'guardian_student_relationships'
};

const DiagnosticTool: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [databaseDiagnostic, setDatabaseDiagnostic] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [repairStatus, setRepairStatus] = useState<{
    repairing: boolean;
    success: boolean;
    error: string | null;
  }>({
    repairing: false,
    success: false,
    error: null
  });

  // Check current auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata
          });
          
          await fetchUserProfile(data.user.id);
          await checkDatabaseIntegrity(data.user.id);
        }
      } catch (error: any) {
        console.error('Error checking auth:', error);
        setErrorMessage(error.message || 'Failed to check authentication status');
      }
    };

    checkAuth();
  }, []);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      // First check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!profileError && profileData) {
        setUserProfile(profileData);
        setLoading(false);
        return;
      }

      // Then check users table - convert userId to number if needed
      let queryUserId: string | number = userId;
      if (!isNaN(Number(userId))) {
        queryUserId = Number(userId);
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', queryUserId)
        .maybeSingle();

      if (!userError && userData) {
        setUserProfile(userData);
        setLoading(false);
        return;
      }
      
      // Final check with guardians table for parent-student relationship
      if (!userProfile) {
        const { data: guardianData, error: guardianError } = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', userId)
          .maybeSingle();

        if (guardianData && !guardianError) {
          setUserProfile({
            id: -1,  // Placeholder ID
            user_id: userId,
            full_name: guardianData.full_name || 'Estudante',
            email: guardianData.email || '',
            phone: guardianData.phone || '',
            user_type: 'student',
            created_at: guardianData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setErrorMessage(error.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Check database integrity for current user
  const checkDatabaseIntegrity = async (userId: string) => {
    setLoading(true);
    try {
      // Check if user exists in users table - using the id as a string since it could be a UUID
      let queryUserId: string | number = userId;
      if (!isNaN(Number(userId))) {
        queryUserId = Number(userId);
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', queryUserId)
        .maybeSingle();
      
      // Check if user exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      // Check guardians table
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', userId);
      
      // Set diagnostic results
      setDatabaseDiagnostic({
        user: {
          exists: !!userData,
          data: userData,
          error: userError?.message
        },
        profile: {
          exists: !!profileData,
          data: profileData,
          error: profileError?.message
        },
        relationships: {
          count: relationshipData?.length || 0,
          data: relationshipData,
          error: relationshipError?.message
        }
      });
    } catch (error: any) {
      console.error('Error checking DB integrity:', error);
      setErrorMessage(error.message || 'Failed to check database integrity');
    } finally {
      setLoading(false);
    }
  };

  // Repair user database records
  const handleRepairUser = async () => {
    if (!user) return;
    
    setRepairStatus({ repairing: true, success: false, error: null });
    try {
      // 1. Create user record if missing
      if (!databaseDiagnostic?.user?.exists) {
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            email: user.email,
            user_type: user.user_metadata?.user_type || 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertUserError) throw new Error(`Failed to create user record: ${insertUserError.message}`);
      }
      
      // 2. Create profile record if missing
      if (!databaseDiagnostic?.profile?.exists) {
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
            user_type: user.user_metadata?.user_type || 'student',
            phone: user.user_metadata?.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertProfileError) throw new Error(`Failed to create profile record: ${insertProfileError.message}`);
      }
      
      // 3. Refresh data
      await fetchUserProfile(user.id);
      await checkDatabaseIntegrity(user.id);
      
      setRepairStatus({ repairing: false, success: true, error: null });
    } catch (error: any) {
      console.error('Repair error:', error);
      setRepairStatus({ repairing: false, success: false, error: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Tool</h1>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Auth Status */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading authentication status...</p>
          ) : user ? (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User Type:</strong> {user.user_metadata?.user_type || 'Not set'}</p>
              <p><strong>Full Name:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
              <p><strong>Phone:</strong> {user.user_metadata?.phone || 'Not set'}</p>
            </div>
          ) : (
            <p>No user authenticated</p>
          )}
        </CardContent>
      </Card>
      
      {/* Profile Status */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading profile data...</p>
          ) : user ? (
            !userProfile ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Profile not found</AlertTitle>
                <AlertDescription>
                  User authenticated but no profile data exists in the database.
                </AlertDescription>
              </Alert>
            ) : (
              <div>
                <p><strong>Database Record ID:</strong> {userProfile.id}</p>
                {userProfile.user_id && <p><strong>User ID:</strong> {userProfile.user_id}</p>}
                {userProfile.auth_user_id && <p><strong>Auth User ID:</strong> {userProfile.auth_user_id}</p>}
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Name:</strong> {userProfile.full_name || userProfile.name || 'Not set'}</p>
                <p><strong>User Type:</strong> {userProfile.user_type || 'Not set'}</p>
                <p><strong>Created At:</strong> {userProfile.created_at || 'Not set'}</p>
              </div>
            )
          ) : (
            <p>No user authenticated</p>
          )}
        </CardContent>
      </Card>
      
      {/* Database Diagnostic */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Database Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Running diagnostic...</p>
          ) : databaseDiagnostic ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={databaseDiagnostic.user.exists ? 'default' : 'destructive'}>
                  Users Table
                </Badge>
                {databaseDiagnostic.user.exists ? 
                  <Check className="h-4 w-4 text-green-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                }
                <span>{databaseDiagnostic.user.exists ? 'Record exists' : 'Missing record'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={databaseDiagnostic.profile.exists ? 'default' : 'destructive'}>
                  Profiles Table
                </Badge>
                {databaseDiagnostic.profile.exists ? 
                  <Check className="h-4 w-4 text-green-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                }
                <span>{databaseDiagnostic.profile.exists ? 'Record exists' : 'Missing record'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Relationships
                </Badge>
                <span>{databaseDiagnostic.relationships.count} guardian relationships found</span>
              </div>
              
              <ScrollArea className="h-32 border rounded p-2">
                <pre className="text-xs">
                  {JSON.stringify(databaseDiagnostic, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          ) : (
            <p>No diagnostic data available</p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRepairUser}
            disabled={loading || repairStatus.repairing || !user || (databaseDiagnostic?.user?.exists && databaseDiagnostic?.profile?.exists)}
          >
            {repairStatus.repairing ? 'Repairing...' : 'Repair User Records'}
          </Button>
          
          {repairStatus.success && (
            <Alert variant="default" className="ml-4 p-2 inline-flex items-center">
              <Check className="h-4 w-4 mr-2" />
              <span>Repair successful</span>
            </Alert>
          )}
          
          {repairStatus.error && (
            <Alert variant="destructive" className="ml-4 p-2 inline-flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{repairStatus.error}</span>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DiagnosticTool;
