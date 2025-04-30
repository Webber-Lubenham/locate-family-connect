
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const TestUsers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<Record<string, string>>({});

  const testUsers = [
    {
      email: 'maria.silva@example.com',
      password: 'Test123456!',
      full_name: 'Maria Silva',
      user_type: 'student',
      description: 'Student account'
    },
    {
      email: 'carlos.oliveira@example.com',
      password: 'Test123456!',
      full_name: 'Carlos Oliveira',
      user_type: 'parent',
      description: 'Parent account'
    }
  ];

  const registerUser = async (user: typeof testUsers[0]) => {
    try {
      setRegistrationStatus(prev => ({ ...prev, [user.email]: 'loading' }));
      
      // 1. Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
            user_type: user.user_type
          }
        }
      });

      if (signUpError) {
        // Check if error is because user already exists
        if (signUpError.message.includes('already registered')) {
          setRegistrationStatus(prev => ({ ...prev, [user.email]: 'exists' }));
          console.log(`User ${user.email} already exists`);
          return true; // User exists, consider it a success
        }
        
        throw signUpError;
      }

      console.log(`User ${user.email} registered successfully:`, data);
      setRegistrationStatus(prev => ({ ...prev, [user.email]: 'success' }));
      return true;
    } catch (error: any) {
      console.error(`Error registering ${user.email}:`, error);
      setRegistrationStatus(prev => ({ ...prev, [user.email]: 'error' }));
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || `Failed to register ${user.email}`
      });
      return false;
    }
  };

  const registerAllUsers = async () => {
    setLoading(true);
    let successCount = 0;
    
    for (const user of testUsers) {
      const success = await registerUser(user);
      if (success) successCount++;
    }
    
    if (successCount === testUsers.length) {
      toast({
        title: 'Users registered',
        description: 'All test users have been registered successfully.'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration incomplete',
        description: `Registered ${successCount} out of ${testUsers.length} users`
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Register Test Users</CardTitle>
          <CardDescription>
            Create test accounts to demonstrate the guardian-student relationship functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create the following accounts:
            </p>
            
            <div className="space-y-4">
              {testUsers.map((user) => (
                <div key={user.email} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.description}</p>
                    </div>
                    <div>
                      {registrationStatus[user.email] === 'loading' && (
                        <span className="text-amber-500">Creating...</span>
                      )}
                      {registrationStatus[user.email] === 'success' && (
                        <span className="text-green-500">Created</span>
                      )}
                      {registrationStatus[user.email] === 'exists' && (
                        <span className="text-blue-500">Already exists</span>
                      )}
                      {registrationStatus[user.email] === 'error' && (
                        <span className="text-red-500">Error</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
          <Button onClick={registerAllUsers} disabled={loading}>
            {loading ? 'Creating Users...' : 'Register All Test Users'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Password for all test accounts: <code className="bg-muted p-1 rounded">Test123456!</code>
        </p>
      </div>
    </div>
  );
};

export default TestUsers;
