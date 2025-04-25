
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { error: resetError } = await forgotPassword(email);
      
      if (resetError) {
        throw resetError;
      }
      
      // If successful, show success message
      setSuccess(true);
    } catch (error: any) {
      setError('Ocorreu um erro ao enviar o email de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-educonnect-purple/10 to-educonnect-light-purple/20">
      <Card className="w-full max-w-md shadow-lg border-educonnect-purple/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-educonnect-dark-purple">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber um link de redefinição de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-medium">Email enviado!</h3>
              <p>
                Enviamos as instruções de recuperação de senha para o seu email. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            
              <Button 
                type="submit" 
                className="w-full bg-educonnect-purple hover:bg-educonnect-secondary-purple text-white" 
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Email de Recuperação"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 mt-2 w-full">
            Lembrou sua senha?{" "}
            <a 
              href="/login" 
              className="text-educonnect-purple hover:text-educonnect-secondary-purple font-semibold"
            >
              Voltar ao Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
