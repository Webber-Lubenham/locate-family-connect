# Problema de Redirecionamento Após Login

## Descrição do Problema

Após um login bem-sucedido no sistema, os usuários não estão sendo redirecionados para os dashboards apropriados. O problema está no componente `Login.tsx`, onde a lógica de redirecionamento não está sendo executada corretamente.

## Código Afetado

O problema está no arquivo `src/pages/Login.tsx`, especificamente na função `handleSubmit`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  try {
    const { user, session } = await supabase.auth.signIn(email, password);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user) {  // Esta verificação está duplicada
      throw new Error('Usuário não encontrado');
    }

    toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
      variant: "default"
    });

    // Redirecionar para o dashboard correto baseado no tipo de usuário
    if (user.user_metadata?.user_type === 'student') {
      navigate('/student-dashboard');
    } else if (user.user_metadata?.user_type === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/dashboard');
    }
  }
  // ...
}
```

## Problemas Identificados

1. **Verificação Duplicada**: Há duas verificações idênticas de `if (!user)` que são redundantes.
2. **Redirecionamento**: O código para redirecionamento está correto, mas não está sendo executado devido à verificação duplicada.
3. **Sessão**: O código não está verificando se a sessão foi criada com sucesso.

## Solução Proposta

1. Remover a verificação duplicada de `if (!user)`.
2. Adicionar uma verificação para garantir que a sessão foi criada.
3. Manter o redirecionamento baseado no tipo de usuário.

## Impacto

Este problema está impedindo que os usuários acessem seus dashboards após um login bem-sucedido, afetando a experiência do usuário e a funcionalidade do sistema.

## Status

O problema foi identificado e uma solução está sendo desenvolvida.
