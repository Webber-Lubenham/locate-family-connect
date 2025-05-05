# Relatório Técnico: Análise de Estado e Fluxo de Desenvolvimento
**Projeto Locate-Family-Connect**
**Data: 05/05/2025**

## 1. Resumo Executivo

Este relatório documenta uma análise técnica aprofundada do estado atual do projeto Locate-Family-Connect, identificando problemas críticos na arquitetura, fluxo de desenvolvimento e integrações que estão comprometendo a estabilidade e manutenibilidade da aplicação.

## 2. Problemas Estruturais Críticos

### 2.1. Inconsistência na Arquitetura de Autenticação

O sistema implementa o fluxo PKCE do Supabase, porém apresenta inconsistências na implementação:

- O componente `UnifiedAuthContext.tsx` combina lógicas distintas (estudante/responsável) sem separação clara
- Ausência de tratamento adequado para estados intermediários durante o fluxo de autenticação
- Conflito entre versões da API Supabase nas dependências (v2.49.4) vs. implementação

### 2.2. Integração Falha com Serviço Resend

A integração com o serviço Resend apresenta graves problemas:

- **Múltiplas chaves API** em diferentes partes do sistema:
  - `re_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu` (docs/configuracao-resend.md)
  - `re_YjGYsdCT_LedLKDERsm4t8GBq9pPwZKiJ` (scripts/test-resend-connection-with-log.js)
  - `re_P8whBAgb_QDkLcB9DHzGfBy4JiBTw5f29` (test-resend.mjs)
  - `re_eABGXYtU_5dDqRgs47KYx4yhsvSGSmctx` (edge-functions.md)
  
- **Configuração do domínio inconsistente**:
  - Status de verificação do domínio `sistema-monitore.com.br` incerto
  - Documentação conflitante sobre o estado de verificação

### 2.3. Implementação Incorreta das Políticas RLS

- As Edge Functions contornam políticas RLS sem implementar verificações adequadas
- Acesso direto à tabela `locations` ao invés de utilizar as funções RPC específicas
- Verificações de relacionamento guardião-estudante implementadas inconsistentemente

## 3. Problemas de Desenvolvimento e Testes

### 3.1. Testes Cypress Desalinhados

Os testes Cypress apresentam falhas significativas:

- Testes aguardam seletores que não existem (`[data-cy="map-container"]`)
- Inconsistência entre o comportamento real da API e os mocks nos testes
- Disparidade entre os interceptors configurados e as chamadas API reais

### 3.2. Gestão de Estado Inconsistente

- Componentes acessam diretamente a API Supabase ao invés de usar serviços centralizados

## 4. Problema de Permissão em Tabela Guardians

### 4.1. Diagnóstico do Problema

Nos logs do console do estudante, identificamos problemas críticos de permissão:

```
GET https://rsvjnndhbyyxktbczlnk.supabase.co/rest/v1/guardians?select=*&student_id=eq.56118e7d-268b-48ae-a444-e3d9660e32f8 403 (Forbidden)
```

Este erro 403 indica que existe uma política RLS impedindo o acesso do estudante à sua própria lista de responsáveis. A autenticação funciona corretamente mas a permissão está bloqueada.

### 4.2. Tentativa de Solução via Função Segura

Criamos uma função `get_student_guardians_secure` com `SECURITY DEFINER` para contornar as políticas RLS, porém os logs mostram que ela não está sendo encontrada na API:

```
POST https://rsvjnndhbyyxktbczlnk.supabase.co/rest/v1/rpc/get_student_guardians_secure 404 (Not Found)
```

Problemas identificados:

1. A migração SQL `20250505_fix_guardians_permissions.sql` não foi aplicada ao banco de dados
2. O hook `useGuardianData` tenta usar a função, mas ela não existe no servidor

### 4.3. Solução Implementada e Pendente

**Implementado:**

- Modificação do hook `useGuardianData` para:  
  - Tentar acesso direto primeiro  
  - Tentar acesso via função segura como fallback  
  - Tratar adequadamente erros de permissão e exibir mensagens claras

**Pendente:**

- Aplicar a migração SQL para criar a função `get_student_guardians_secure`
- Configurar política RLS na tabela `guardians` seguindo o padrão:
```sql
CREATE POLICY "Estudantes podem ver seus próprios responsáveis" 
ON public.guardians 
FOR SELECT 
TO authenticated 
USING (student_id = auth.uid());
```

### 4.4. Impacto no Sistema

Este problema impede que estudantes vejam seus responsáveis no dashboard, comprometendo a funcionalidade central do aplicativo. A solução robusta implementada no código frontend garante degradação elegante mesmo se a migração não for aplicada.
- Uso inconsistente de Context API vs. prop drilling
- Estados de carregamento e erro não propagados corretamente pela aplicação

## 4. Problemas de Infraestrutura e Integração

### 4.1. Configuração do Supabase

- Múltiplas versões de funções SQL para a mesma operação
- Políticas RLS inconsistentes entre tabelas relacionadas
- Triggers com lógica de negócio embutida sem documentação adequada

### 4.2. Integração MapBox

- Configuração de token não centralizada
- Ausência de estratégia para minimizar custos em chamadas da API
- Eventos de erro não tratados adequadamente

## 5. Recomendações

### 5.1. Refatoração Urgente da Autenticação

- Implementar separação clara entre os fluxos de usuário (estudante/responsável/desenvolvedor)
- Centralizar configuração e lógica de autenticação
- Implementar tratamento consistente para todos os estados de autenticação

### 5.2. Padronização da Infraestrutura de Email

- Consolidar em uma única chave API do Resend
- Verificar e documentar o status do domínio
- Implementar testes E2E para o fluxo de email completo

### 5.3. Correção das Políticas RLS

- Revisar todas as políticas RLS para garantir acesso adequado
- Usar consistentemente funções RPC para operações sensíveis
- Documentar claramente as permissões por tipo de usuário

### A.4. Infraestrutura e Testes

- Consolidar scripts de diagnóstico em um único painel
- Implementar estratégia de CI/CD com validação de políticas RLS
- Corrigir testes Cypress para refletir a implementação real

## 6. Conclusão

O projeto Locate-Family-Connect apresenta problemas estruturais significativos que comprometem sua estabilidade, segurança e manutenibilidade. Uma revisão completa da arquitetura, centralizando serviços e padronizando interfaces, é necessária para garantir a viabilidade contínua do projeto.

A próxima fase deve focar em estabilizar os componentes críticos (autenticação, email, RLS) antes de prosseguir com novas funcionalidades.

---

**Preparado por:** Sistema de Diagnóstico Técnico  
**Revisado em:** 05/05/2025
