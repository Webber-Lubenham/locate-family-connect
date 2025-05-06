import React from 'react';
import PageContainer from '@/components/PageContainer';
import SystemFlowVisualizer from '@/components/developer/SystemFlowVisualizer';

/**
 * Página de visualização dos fluxos do sistema para desenvolvedores
 * Esta página é acessível apenas para usuários com a role developer
 */
const DeveloperFlow: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Fluxos do Sistema</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Este painel técnico permite visualizar e compreender os principais fluxos 
          de dados e interações no sistema Locate-Family-Connect.
        </p>
        
        <SystemFlowVisualizer />
      </div>
    </PageContainer>
  );
};

export default DeveloperFlow;
