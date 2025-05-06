import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

// Flow diagram styles
const flowStyles = {
  container: 'flex flex-col gap-4 my-4 overflow-auto',
  flowNode: 'border border-slate-300 dark:border-slate-600 p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm',
  flowArrow: 'flex justify-center my-2',
  groupBox: 'border border-dashed border-slate-300 dark:border-slate-600 p-4 rounded-lg mb-4',
  apiNode: 'border border-blue-300 dark:border-blue-600 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-sm',
  securityNode: 'border border-red-300 dark:border-red-600 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 shadow-sm',
  dataNode: 'border border-green-300 dark:border-green-600 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 shadow-sm',
  selected: 'ring-2 ring-primary',
  infoPanel: 'mt-4 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900',
  badge: 'ml-2',
  gridContainer: 'grid grid-cols-1 md:grid-cols-2 gap-4',
};

// Component types and details
type FlowNodeInfo = {
  title: string;
  description: string;
  type: 'component' | 'api' | 'security' | 'data';
  code?: string;
  path?: string;
};

const authFlowNodes: Record<string, FlowNodeInfo> = {
  unifiedAuthContext: {
    title: 'UnifiedAuthContext',
    description: 'Contexto de autenticação legado que provê compatibilidade com componentes antigos',
    type: 'component',
    path: 'src/contexts/UnifiedAuthContext.tsx',
  },
  authProvider: {
    title: 'AuthProvider',
    description: 'Provedor de autenticação moderno que gerencia o estado do usuário e a interação com o Supabase',
    type: 'component',
    path: 'src/lib/auth.tsx',
  },
  supabaseAuth: {
    title: 'Supabase Auth',
    description: 'Serviço de autenticação PKCE do Supabase que gerencia sessões e tokens',
    type: 'api',
    code: 'supabase.auth.signInWithPassword({ email, password })',
  },
  rlsPolicies: {
    title: 'Políticas RLS',
    description: 'Políticas de segurança no nível de linha que controlam acesso aos dados',
    type: 'security',
    path: 'supabase/migrations/20250419_fix_profiles_rls.sql',
  },
  profilesTable: {
    title: 'Tabela Profiles',
    description: 'Armazena informações do perfil do usuário e tipo de usuário',
    type: 'data',
    code: 'profiles (user_id, email, user_type, full_name)',
  },
};

const locationFlowNodes: Record<string, FlowNodeInfo> = {
  useLocationSharing: {
    title: 'useLocationSharing',
    description: 'Hook principal para compartilhamento de localização',
    type: 'component',
    path: 'src/hooks/student/useLocationSharing.ts',
  },
  useLocationShare: {
    title: 'useLocationShare',
    description: 'Hook especializado para compartilhar localização via email',
    type: 'component',
    path: 'src/hooks/student/useLocationShare.ts',
  },
  shareLocationEdge: {
    title: 'share-location Edge Function',
    description: 'Função serverless que processa solicitações de compartilhamento',
    type: 'api',
    path: 'supabase/functions/share-location/index.ts',
  },
  resendAPI: {
    title: 'Resend API',
    description: 'Serviço de email para enviar notificações de localização',
    type: 'api',
    code: 'fetch("https://api.resend.com/emails")',
  },
  locationsTable: {
    title: 'Tabela Locations',
    description: 'Armazena histórico de localizações compartilhadas',
    type: 'data',
    code: 'locations (id, student_id, latitude, longitude, created_at)',
  },
  guardiansTable: {
    title: 'Tabela Guardians',
    description: 'Armazena relacionamentos entre estudantes e responsáveis',
    type: 'data',
    code: 'guardians (id, student_id, guardian_id, email, status)',
  },
};

const SystemFlowVisualizer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleNodeClick = (nodeKey: string, flowType: 'auth' | 'location') => {
    const nodeInfo = flowType === 'auth' ? authFlowNodes[nodeKey] : locationFlowNodes[nodeKey];
    setSelectedNode(nodeKey);
  };

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      // Obter versão do Supabase
      const { data: version } = await supabase.from('pg_catalog.version').select('version').limit(1).single();
      
      // Obter estatísticas da tabela
      const { data: tablesData } = await supabase.from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public');
      
      const { data: usersCount } = await supabase.from('profiles').select('count');
      
      setSystemInfo({
        databaseVersion: version?.version || 'Desconhecida',
        tablesCount: tablesData?.length || 0,
        tables: tablesData?.map(t => t.table_name).join(', ') || 'Nenhuma tabela encontrada',
        usersCount: usersCount?.[0]?.count || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao buscar informações do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeClassName = (nodeKey: string, nodeType: string) => {
    let baseClass = '';
    
    switch (nodeType) {
      case 'api':
        baseClass = flowStyles.apiNode;
        break;
      case 'security':
        baseClass = flowStyles.securityNode;
        break;
      case 'data':
        baseClass = flowStyles.dataNode;
        break;
      default:
        baseClass = flowStyles.flowNode;
    }
    
    return `${baseClass} ${selectedNode === nodeKey ? flowStyles.selected : ''} cursor-pointer hover:shadow-md transition-shadow`;
  };

  const renderNodeInfo = () => {
    if (!selectedNode) return null;
    
    const nodeInfo = authFlowNodes[selectedNode] || locationFlowNodes[selectedNode];
    if (!nodeInfo) return null;
    
    return (
      <div className={flowStyles.infoPanel}>
        <h3 className="text-lg font-medium mb-2">{nodeInfo.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{nodeInfo.description}</p>
        
        {nodeInfo.path && (
          <div className="mt-2">
            <strong className="text-xs">Caminho:</strong>
            <code className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">{nodeInfo.path}</code>
          </div>
        )}
        
        {nodeInfo.code && (
          <div className="mt-2">
            <strong className="text-xs">Código:</strong>
            <pre className="mt-1 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
              {nodeInfo.code}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          Visualizador de Fluxo do Sistema
          <Badge variant="outline" className={flowStyles.badge}>Versão Dev</Badge>
        </CardTitle>
        <CardDescription>
          Visualização interativa dos principais fluxos do Locate-Family-Connect
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="auth">
          <TabsList className="mb-4">
            <TabsTrigger value="auth">Fluxo de Autenticação</TabsTrigger>
            <TabsTrigger value="location">Compartilhamento de Localização</TabsTrigger>
            <TabsTrigger value="system">Informações do Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auth" className="space-y-4">
            <div className={flowStyles.container}>
              {/* Frontend Components */}
              <div className={flowStyles.groupBox}>
                <h3 className="font-medium mb-2">Frontend</h3>
                <div className={flowStyles.gridContainer}>
                  <div 
                    className={getNodeClassName('unifiedAuthContext', 'component')}
                    onClick={() => handleNodeClick('unifiedAuthContext', 'auth')}
                  >
                    <h4 className="font-medium">UnifiedAuthContext</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Compatibilidade legada</p>
                  </div>
                  
                  <div 
                    className={getNodeClassName('authProvider', 'component')}
                    onClick={() => handleNodeClick('authProvider', 'auth')}
                  >
                    <h4 className="font-medium">AuthProvider</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gerencia estado do usuário</p>
                  </div>
                </div>
              </div>
              
              <div className={flowStyles.flowArrow}>↓</div>
              
              {/* API */}
              <div 
                className={getNodeClassName('supabaseAuth', 'api')}
                onClick={() => handleNodeClick('supabaseAuth', 'auth')}
              >
                <h4 className="font-medium">Supabase Auth</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">PKCE Authentication Flow</p>
              </div>
              
              <div className={flowStyles.flowArrow}>↓</div>
              
              {/* Security */}
              <div 
                className={getNodeClassName('rlsPolicies', 'security')}
                onClick={() => handleNodeClick('rlsPolicies', 'auth')}
              >
                <h4 className="font-medium">Políticas RLS</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Controle de acesso baseado em função</p>
              </div>
              
              <div className={flowStyles.flowArrow}>↓</div>
              
              {/* Data */}
              <div 
                className={getNodeClassName('profilesTable', 'data')}
                onClick={() => handleNodeClick('profilesTable', 'auth')}
              >
                <h4 className="font-medium">Tabela Profiles</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dados do perfil do usuário</p>
              </div>
            </div>
            
            {renderNodeInfo()}
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4">
            <div className={flowStyles.container}>
              {/* Frontend Components */}
              <div className={flowStyles.groupBox}>
                <h3 className="font-medium mb-2">Frontend Hooks</h3>
                <div className={flowStyles.gridContainer}>
                  <div 
                    className={getNodeClassName('useLocationSharing', 'component')}
                    onClick={() => handleNodeClick('useLocationSharing', 'location')}
                  >
                    <h4 className="font-medium">useLocationSharing</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hook principal</p>
                  </div>
                  
                  <div 
                    className={getNodeClassName('useLocationShare', 'component')}
                    onClick={() => handleNodeClick('useLocationShare', 'location')}
                  >
                    <h4 className="font-medium">useLocationShare</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Compartilhamento por email</p>
                  </div>
                </div>
              </div>
              
              <div className={flowStyles.flowArrow}>↓</div>
              
              {/* Backend Services */}
              <div className={flowStyles.groupBox}>
                <h3 className="font-medium mb-2">Backend & Serviços</h3>
                <div className={flowStyles.gridContainer}>
                  <div 
                    className={getNodeClassName('shareLocationEdge', 'api')}
                    onClick={() => handleNodeClick('shareLocationEdge', 'location')}
                  >
                    <h4 className="font-medium">Edge Function</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">share-location</p>
                  </div>
                  
                  <div 
                    className={getNodeClassName('resendAPI', 'api')}
                    onClick={() => handleNodeClick('resendAPI', 'location')}
                  >
                    <h4 className="font-medium">Resend API</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Serviço de email</p>
                  </div>
                </div>
              </div>
              
              <div className={flowStyles.flowArrow}>↓</div>
              
              {/* Database */}
              <div className={flowStyles.groupBox}>
                <h3 className="font-medium mb-2">Banco de Dados</h3>
                <div className={flowStyles.gridContainer}>
                  <div 
                    className={getNodeClassName('locationsTable', 'data')}
                    onClick={() => handleNodeClick('locationsTable', 'location')}
                  >
                    <h4 className="font-medium">Tabela Locations</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Histórico de localizações</p>
                  </div>
                  
                  <div 
                    className={getNodeClassName('guardiansTable', 'data')}
                    onClick={() => handleNodeClick('guardiansTable', 'location')}
                  >
                    <h4 className="font-medium">Tabela Guardians</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Relações estudante-responsável</p>
                  </div>
                </div>
              </div>
            </div>
            
            {renderNodeInfo()}
          </TabsContent>
          
          <TabsContent value="system">
            <div className="space-y-4">
              <Button 
                onClick={fetchSystemInfo}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Carregando...' : 'Verificar Estado do Sistema'}
              </Button>
              
              {systemInfo && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Versão do Banco de Dados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <code className="text-xs">{systemInfo.databaseVersion}</code>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Tabelas do Banco</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{systemInfo.tablesCount} tabelas</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {systemInfo.tables}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Usuários</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{systemInfo.usersCount} usuários</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Timestamp</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <code className="text-xs">
                          {new Date(systemInfo.timestamp).toLocaleString()}
                        </code>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Desenvolvido para equipe técnica. Clique nos nós para ver detalhes.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SystemFlowVisualizer;
