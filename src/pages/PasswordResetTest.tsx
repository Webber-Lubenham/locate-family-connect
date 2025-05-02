
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PasswordResetTester from '@/components/PasswordResetTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PasswordResetTest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'mauro.lima@educacao.am.gov.br';

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link to="/email-diagnostic">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Diagnóstico
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Teste de Recuperação de Senha</h1>
      
      <PasswordResetTester email={email} />

      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h2 className="text-lg font-medium mb-2">Como interpretar os resultados</h2>
        <p className="mb-3">
          Este teste verifica toda a cadeia de envio de emails de recuperação de senha:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Verifica se a API key do Resend está válida</li>
          <li>Testa o envio direto via API do Resend</li>
          <li>Testa o fluxo completo via Supabase</li>
        </ol>
        <p className="mt-3 text-sm text-gray-600">
          Se o teste direto via Resend funcionar, mas o fluxo via Supabase falhar, pode indicar um problema 
          na configuração do SMTP no Supabase. Verifique as configurações no painel do Supabase.
        </p>
      </div>
    </div>
  );
};

export default PasswordResetTest;
