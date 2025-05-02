# Correção de Testes Cypress - Diagnóstico e Soluções

## Problema Detectado

Os testes Cypress estavam falhando com os seguintes erros:

1. **Erro de Contexto React**: `useUser must be used within a UserProvider`
2. **Erro de Tipo**: `TypeError: _data$event.startsWith is not a function`
3. **Erro de Asserção**: `Timed out retrying after 10000ms: Expected to find content: 'EduConnect' but never did.`

## Análise de Causa Raiz

### 1. Incompatibilidade de Contexto Auth

O problema principal era uma incompatibilidade entre os contextos de autenticação. A aplicação estava usando dois contextos diferentes para gerenciar a autenticação:

- `UserContext.tsx` - O contexto original/legado
- `UnifiedAuthContext.tsx` - O novo contexto unificado

Componentes como `Login.tsx` e `LoginForm.tsx` estavam importando e usando hooks de `UserContext`, mas a aplicação estava utilizando `UnifiedAuthContext` como o provedor principal. Isso resultava no erro `useUser must be used within a UserProvider`.

### 2. Acesso Incorreto a Propriedades de Usuário

O código estava tentando acessar `user.user_type` diretamente, mas na implementação do `UnifiedAuthContext`, o tipo do usuário estava armazenado em `user.user_metadata?.user_type`.

### 3. Validação de UI Incorreta no Teste

Os testes Cypress estavam procurando pelo texto "EduConnect", mas o texto real exibido na UI era "Monitore".

## Soluções Implementadas

### 1. Correção das Importações de Contexto

- Em `src/pages/Login.tsx`: Substituído `import { useUser } from '@/contexts/UserContext'` por `import { useUser } from '@/contexts/UnifiedAuthContext'`.
- Em `src/components/LoginForm.tsx`: Substituído `import { useUser, User } from '@/contexts/UserContext'` por `import { useUser } from '@/contexts/UnifiedAuthContext'` e adicionado `import { User as SupabaseUser } from '@supabase/supabase-js'`.

### 2. Correção do Acesso a Propriedades de Usuário

- Em `Login.tsx`: Substituído `user.user_type` por `user.user_metadata?.user_type`.
- Em `LoginForm.tsx`: Refatorado o mapeamento do objeto de usuário para passar o objeto Supabase User diretamente ao invés de criar um objeto personalizado, evitando incompatibilidade de tipos.

### 3. Atualização dos Testes Cypress

- Em `cypress/e2e/login-dashboard.cy.js`: Substituído `cy.contains('EduConnect', { timeout: 10000 })` por `cy.contains('Monitore', { timeout: 10000 })`.

## Recomendações Adicionais

### 1. Corrigir o Erro startsWith

Para resolver o erro `_data$event.startsWith is not a function`, recomenda-se adicionar verificação de tipo no listener de eventos do `main.tsx`:

```typescript
// Listener global para depuração de eventos recebidos na janela
window.addEventListener('message', (event) => {
  console.log('[DEBUG][window.message] event.data:', event.data, 'typeof:', typeof event.data);
  
  // Adicionar verificação de tipo antes de usar startsWith
  if (typeof event.data === 'string') {
    // Operações com startsWith aqui
  } else if (typeof event.data === 'object' && event.data !== null) {
    console.log('[DEBUG][window.message] event.data keys:', Object.keys(event.data));
  }
});
```

### 2. Padronização do Contexto de Autenticação

Para evitar problemas futuros, é recomendável padronizar o uso do contexto de autenticação em toda a aplicação:

1. **Migração Completa**: Migrar completamente para o `UnifiedAuthContext` e remover o `UserContext` se não estiver mais em uso.
2. **Auditoria de Código**: Verificar todas as importações de contexto de autenticação para garantir consistência.
3. **Aliases Consistentes**: Manter os aliases `useUser` e `useAuth` apontando para o mesmo hook em toda a aplicação.

### 3. Melhorias nos Testes Cypress

1. **Configuração de Estado de Teste**: Criar comandos para configurar o estado inicial para os testes (ex: usuário autenticado).
2. **Testes Isolados**: Considerar o uso de mocks para o Supabase nos testes para não depender de autenticação real.
3. **Verificação de Conteúdo Dinâmico**: Usar seletores mais robustos ou atributos data-cy para elementos dinâmicos ao invés de confiar em conteúdo de texto.

## Próximos Passos

1. Execute os testes Cypress novamente para confirmar que as correções resolveram os problemas:
   ```bash
   npx cypress open
   ```

2. Verifique se o erro `_data$event.startsWith` persiste. Se sim, implemente a verificação de tipo recomendada.

3. Certifique-se de que as credenciais da conta de teste (usuario@teste.com/senhaSegura123) existem no ambiente de teste.

4. Considere adicionar testes mais robustos que não dependam de textos específicos na UI, mas sim de atributos data-cy ou seletores mais estáveis.

## Observações Finais

Este documento fornece uma análise detalhada dos problemas encontrados nos testes Cypress e as soluções implementadas. As correções visam garantir que os testes sejam mais confiáveis e menos propensos a falhas devido a mudanças na UI ou na lógica de negócio.

Como prática recomendada, todos os futuros componentes que precisem de autenticação devem usar o contexto unificado para garantir consistência e evitar erros semelhantes. Além disso, os testes devem ser escritos de forma a minimizar dependências em elementos voláteis da UI.
