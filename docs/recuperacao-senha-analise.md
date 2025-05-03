# Documentação da Análise do Sistema de Recuperação de Senha

## Visão Geral

Este documento apresenta uma análise detalhada do fluxo de recuperação de senha do projeto **Locate-Family-Connect**, útil para desenvolvimento e testes.

*Data da análise: 03/05/2025*

## Arquivos Envolvidos

1. `src/lib/supabase.ts` - Configuração da conexão com Supabase
2. `src/lib/auth-config.ts` - Configurações de autenticação
3. `src/components/ForgotPasswordForm.tsx` - Formulário de solicitação de recuperação
4. `src/pages/ResetPassword.tsx` - Página de redefinição de senha

## Fluxo de Recuperação de Senha Identificado

### 1. Localização da Funcionalidade
- **URL/Rota**: A funcionalidade "Esqueci minha senha" é acessível através de `/login`
- **URL de Redefinição**: `/reset-password` (utilizada após o link do email ser clicado)
- **Tipo de Fluxo**: Primariamente web, com design responsivo para dispositivos móveis

### 2. Processo do Fluxo
- **Etapas**:
  1. Usuário insere email no ForgotPasswordForm
  2. Sistema envia email de recuperação por um de dois métodos:
     - Fluxo nativo do Supabase (`resetPasswordForEmail`)
     - Implementação personalizada usando a API Resend
  3. Usuário recebe email com link para `/reset-password`
  4. Usuário define nova senha na página ResetPassword
  5. Após sucesso, usuário é redirecionado para o login após 3 segundos

- **Mensagens**:
  - Notificações de sucesso via componente toast
  - Erros de validação para campos vazios, senhas não coincidentes, etc.
  - Tratamento de erros para falhas de API, limites de taxa, etc.

### 3. Implementação de Email
- **Métodos de Email**:
  - Principal: Função nativa `resetPasswordForEmail` do Supabase
  - Alternativa: Implementação personalizada usando API Resend
  
- **Ambiente de Teste**:
  - O código possui modo de diagnóstico com logs detalhados
  - Existe uma rota `/password-reset-test` para testar o fluxo
  - O arquivo `email-utils.ts` contém funções para testar entrega de emails

### 4. Restrições de Ambiente
- **Suporte a Ambientes**:
  - O sistema pode ser executado em ambientes de desenvolvimento local
  - Gerencia implantações no localhost, Render.com e Lovable.app
  
- **Limitação de Taxa**:
  - O código trata erros de limitação de taxa das APIs de email

### 5. Expectativas de Validação
- O código trata diversos casos de validação:
  - Campo de email vazio
  - Email inválido/inexistente
  - Senhas não coincidentes
  - Comprimento da senha (mínimo 8 caracteres)
  - Tokens expirados/inválidos

### 6. Elementos Visuais
- Utiliza UI baseada em cards com componentes Radix UI e TailwindCSS
- Mostra estados de carregamento com indicadores de spinner
- Fornece confirmação de sucesso com ícone de marca de verificação
- Implementa alternância de visibilidade de senha

## Plano de Testes Cypress Recomendado

Com base nesta análise, recomenda-se o seguinte plano para testar o fluxo de recuperação de senha:

1. **Teste do "Caminho Feliz"**:
   - Navegar para a página de login
   - Clicar no link "esqueci minha senha"
   - Inserir email válido
   - Verificar mensagem de sucesso
   - Simular recebimento do email (interceptando a chamada de API)
   - Seguir o link de redefinição (simulação)
   - Inserir novas senhas coincidentes
   - Verificar redirecionamento para o login

2. **Casos de Borda e Tratamento de Erros**:
   - Testar envio de email vazio
   - Testar formato de email inválido
   - Testar senhas não coincidentes
   - Testar senha muito curta
   - Testar token expirado
   - Testar token inválido
   - Testar cenários de limitação de taxa

3. **Testes de Entrega de Email**:
   - Simular método resetPasswordForEmail do Supabase
   - Simular chamadas da API Resend
   - Verificar template e conteúdo correto do email

## Implementação de Testes Cypress (Pendente)

Os testes em Cypress serão desenvolvidos para cobrir todos os cenários descritos acima, garantindo a robustez do sistema de recuperação de senha.
