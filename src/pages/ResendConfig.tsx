
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResendKeyForm from '@/components/ResendKeyForm';

const ResendConfig: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração do Resend</h1>
          <p className="text-gray-500 mt-1">Configure o serviço de email para recuperação de senha</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/email-diagnostic">
            Diagnóstico Completo
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <ResendKeyForm />
        
        <Card>
          <CardHeader>
            <CardTitle>Como funciona?</CardTitle>
            <CardDescription>
              Entenda como o sistema de recuperação de senha funciona com o Resend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Fluxo de Recuperação de Senha</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Usuário solicita recuperação de senha usando seu email</li>
                <li>O sistema valida o email no banco de dados</li>
                <li>Um link de recuperação é gerado</li>
                <li>O Resend envia um email com o link para o usuário</li>
                <li>Usuário clica no link e cria uma nova senha</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Vantagens do Resend</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Taxas de entrega superiores ao SMTP padrão do Supabase</li>
                <li>Estatísticas de entrega e abertura de emails</li>
                <li>Templates de email personalizados e responsivos</li>
                <li>Integração simples com APIs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Próximos passos</h3>
              <p>Após configurar sua chave API do Resend:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Teste a recuperação de senha para verificar se os emails estão sendo entregues</li>
                <li>Configure seu domínio no Resend para melhorar a entregabilidade</li>
                <li>Personalize os templates de email para sua marca</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResendConfig;
