import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Server, Database, GitBranch, Bug, FileText, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";

const DevDashboard: React.FC = () => {
  const { user } = useUnifiedAuth();
  const fullName = user?.user_metadata?.full_name || 'Developer';
  
  return (
    <div className="container py-6 space-y-6" data-cy="dashboard-container">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, <span className="font-medium">{fullName}</span>. 
          Ferramentas e recursos para desenvolvedores.
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 font-medium">
            Developer Mode
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
            {import.meta.env.MODE}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
          <TabsTrigger value="admin">Administração</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-orange-500" />
                  <span>Cypress Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Interface para testes E2E
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Execute testes Cypress, visualize resultados e depure problemas de integração.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/cypress">Acessar Cypress</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>API Docs</span>
                </CardTitle>
                <CardDescription>
                  Documentação de API
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Explore endpoints, schemas e exemplos de integração com a API.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/api-docs">Ver Documentação</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-teal-500" />
                  <span>Exemplos de Código</span>
                </CardTitle>
                <CardDescription>
                  Snippets e componentes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Biblioteca de componentes, exemplos e padrões de código usados no projeto.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/code-examples">Ver Exemplos</Link>
                </Button>
              </CardFooter>
            </Card>
            
          </div>
        </TabsContent>
        
        <TabsContent value="diagnostics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  <span>Diagnóstico</span>
                </CardTitle>
                <CardDescription>
                  Diagnóstico do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Ferramentas para diagnóstico de problemas, logs e status do sistema.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/diagnostic">Acessar Diagnóstico</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-500" />
                  <span>Banco de Dados</span>
                </CardTitle>
                <CardDescription>
                  Gerenciamento de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Visualize esquemas, execute queries e gerencie dados de teste.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/database">Gerenciar Dados</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-500" />
                  <span>Edge Functions</span>
                </CardTitle>
                <CardDescription>
                  Serverless Functions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Status, logs e testes de Edge Functions no Supabase.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/edge-functions">Gerenciar Functions</Link>
                </Button>
              </CardFooter>
            </Card>
            
          </div>
        </TabsContent>
        
        <TabsContent value="admin" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-500" />
                  <span>Usuários</span>
                </CardTitle>
                <CardDescription>
                  Gerenciamento de usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Gerencie usuários, perfis e permissões do sistema.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/users">Gerenciar Usuários</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  <span>Ambiente</span>
                </CardTitle>
                <CardDescription>
                  Configurações do ambiente
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Visualize e configure variáveis de ambiente e integrações.
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/dev/environment">Ver Ambiente</Link>
                </Button>
              </CardFooter>
            </Card>
            
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DevDashboard;
