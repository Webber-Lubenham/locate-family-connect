
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DiagnosticTool = () => {
  const [status, setStatus] = useState('idle');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [authAvailable, setAuthAvailable] = useState<boolean | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  const [rulesExist, setRulesExist] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setStatus('running');
    setError(null);
    
    try {
      // Check database connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      setDbConnected(!connectionError);
      
      // Check auth functionality
      let authWorking = false;
      try {
        const { data: session, error: authError } = await supabase.auth.getSession();
        authWorking = !authError && session !== null;
        setAuthSession(session?.session || null);
      } catch (authErr) {
        authWorking = false;
      }
      setAuthAvailable(authWorking);
      
      // Check essential tables
      const requiredTables = ['users', 'profiles', 'guardians'];
      const tableChecks = await Promise.all(
        requiredTables.map(async (table) => {
          const { data, error: tableError } = await supabase
            .from(table)
            .select('count(*)')
            .limit(1);
          return !tableError;
        })
      );
      
      setTablesExist(tableChecks.every(check => check));
      
      // Get current user profile if logged in
      if (authSession?.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authSession.user.id)
          .maybeSingle();
          
        if (!profileError && profileData) {
          setUserProfile(profileData);
        }
      }
      
      // Check RLS policies
      let policiesExist = false;
      try {
        const { data: policiesData, error: policiesError } = await supabase
          .rpc('check_guardian_relationship', {
            guardian_email: 'test@example.com',
            student_id: '00000000-0000-0000-0000-000000000000'
          });
        
        policiesExist = !policiesError; // The function exists if no error
      } catch (policyErr) {
        policiesExist = false;
      }
      
      setRulesExist(policiesExist);
      
      setStatus('completed');
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido durante o diagnóstico');
      setStatus('error');
    }
  };
  
  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  // Check for current session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setAuthSession(sessionData?.session || null);
        
        if (sessionData?.session?.user?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          setUserProfile(profileData || null);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    
    checkSession();
  }, []);

  const fixUserProfile = async () => {
    if (!authSession?.user) {
      setError('Você precisa estar autenticado para corrigir seu perfil');
      return;
    }
    
    try {
      setStatus('running');
      
      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authSession.user.id)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: authSession.user.email,
            full_name: authSession.user.user_metadata?.full_name || 'Usuário',
            user_type: authSession.user.user_metadata?.user_type || 'student',
            phone: authSession.user.user_metadata?.phone || null
          })
          .eq('user_id', authSession.user.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: authSession.user.id,
            email: authSession.user.email,
            full_name: authSession.user.user_metadata?.full_name || 'Usuário',
            user_type: authSession.user.user_metadata?.user_type || 'student',
            phone: authSession.user.user_metadata?.phone || null
          });
          
        if (insertError) throw insertError;
      }
      
      // Re-run diagnostics to show updated info
      await runDiagnostics();
    } catch (err: any) {
      setError(err.message || 'Erro ao corrigir perfil');
      setStatus('error');
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Ferramenta de Diagnóstico</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={runDiagnostics}
          disabled={status === 'running'}
        >
          {status === 'running' ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Executar Diagnóstico
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conexão com Banco de Dados</CardTitle>
            <CardDescription>Verifica se a aplicação consegue se conectar ao Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator
              status={dbConnected}
              loadingText="Testando conexão..."
              successText="Conexão estabelecida com sucesso"
              errorText="Falha ao conectar com o banco de dados"
              isLoading={status === 'running'}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>Verifica se o sistema de autenticação está funcionando</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator
              status={authAvailable}
              loadingText="Verificando sistema de autenticação..."
              successText="Sistema de autenticação disponível"
              errorText="Falha ao verificar sistema de autenticação"
              isLoading={status === 'running'}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tabelas Essenciais</CardTitle>
            <CardDescription>Verifica se as tabelas necessárias existem no banco</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator
              status={tablesExist}
              loadingText="Verificando tabelas..."
              successText="Todas as tabelas essenciais existem"
              errorText="Uma ou mais tabelas essenciais não existem"
              isLoading={status === 'running'}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Políticas de Segurança</CardTitle>
            <CardDescription>Verifica se as políticas de RLS estão configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator
              status={rulesExist}
              loadingText="Verificando políticas de segurança..."
              successText="Políticas de segurança configuradas"
              errorText="Políticas de segurança não encontradas"
              isLoading={status === 'running'}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>
              {authSession?.user 
                ? `Informações do perfil para ${authSession.user.email}` 
                : 'Faça login para ver as informações do seu perfil'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'running' ? (
              <div className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                <p>Carregando informações do perfil...</p>
              </div>
            ) : !authSession?.user ? (
              <p>Nenhum usuário autenticado</p>
            ) : !userProfile ? (
              <>
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Perfil não encontrado</AlertTitle>
                  <AlertDescription>
                    Seu perfil parece não existir no banco de dados. Isso pode causar problemas no funcionamento da aplicação.
                  </AlertDescription>
                </Alert>
                <Button onClick={fixUserProfile}>Criar/Corrigir Perfil</Button>
              </>
            ) : (
              <div className="space-y-2">
                <p><strong>ID:</strong> {userProfile.id}</p>
                <p><strong>Nome:</strong> {userProfile.full_name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Tipo:</strong> {userProfile.user_type}</p>
                <p><strong>Telefone:</strong> {userProfile.phone || 'Não informado'}</p>
                <p><strong>Criado em:</strong> {new Date(userProfile.created_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {authSession?.user && userProfile && (
              <Button variant="outline" onClick={fixUserProfile}>
                Atualizar Perfil
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Helper component for status indicators
const StatusIndicator = ({ 
  status, 
  loadingText, 
  successText, 
  errorText, 
  isLoading 
}: { 
  status: boolean | null, 
  loadingText: string, 
  successText: string, 
  errorText: string, 
  isLoading: boolean 
}) => {
  if (isLoading || status === null) {
    return (
      <div className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        <span>{loadingText}</span>
      </div>
    );
  }
  
  if (status) {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="mr-2 h-4 w-4" />
        <span>{successText}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-red-600">
      <XCircle className="mr-2 h-4 w-4" />
      <span>{errorText}</span>
    </div>
  );
};

export default DiagnosticTool;
