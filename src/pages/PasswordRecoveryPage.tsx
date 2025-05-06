
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PasswordRecoveryPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Erro ao recuperar senha',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setIsDone(true);
      toast({
        title: 'Email enviado',
        description: 'Um link para recuperar sua senha foi enviado para seu email',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao recuperar senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recuperação de Senha</CardTitle>
          <CardDescription>
            Enviaremos um link de recuperação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isDone ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>
          ) : (
            <div className="py-4 text-center">
              <p className="mb-4">
                Se uma conta existir com esse email, você receberá um link para recuperar sua senha.
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, verifique sua caixa de entrada e também a pasta de spam.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-primary hover:underline">
            Voltar para login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordRecoveryPage;
