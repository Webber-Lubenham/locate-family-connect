
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmailConfigTester from '@/components/EmailConfigTester';
import { env } from '@/env';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const EmailDiagnostic: React.FC = () => {
  // Verificando se há configurações importantes no env
  const checkEnvConfig = () => {
    const issues = [];
    if (!env.RESEND_API_KEY) {
      issues.push('RESEND_API_KEY não está configurada');
    }
    if (!env.APP_DOMAIN) {
      issues.push('APP_DOMAIN não está configurado');
    }
    return issues;
  };

  const envIssues = checkEnvConfig();

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Diagnóstico de Sistema de Email</h1>
      
      <div className="grid gap-6">
        {/* Resumo das configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Atuais</CardTitle>
            <CardDescription>Visão geral das configurações de email do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Verificação de variáveis de ambiente */}
              {envIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-bold mb-1">Problemas nas configurações:</div>
                    <ul className="list-disc pl-5">
                      {envIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Detalhes da configuração */}
              <div>
                <h3 className="text-lg font-medium mb-2">Configuração de Email</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Provedor</td>
                      <td>Resend</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">API Key</td>
                      <td>
                        {env.RESEND_API_KEY ? 
                          `${env.RESEND_API_KEY.substring(0, 5)}...${env.RESEND_API_KEY.substring(env.RESEND_API_KEY.length - 5)}` : 
                          <span className="text-red-500">Não configurada</span>
                        }
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Domínio da aplicação</td>
                      <td>{env.APP_DOMAIN || <span className="text-red-500">Não configurado</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Verificador de configuração */}
        <div className="flex justify-center">
          <EmailConfigTester />
        </div>
      </div>
    </div>
  );
};

export default EmailDiagnostic;
