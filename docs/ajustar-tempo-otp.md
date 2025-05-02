# Ajuste do Tempo de Expiração do OTP no Supabase

## Problema
O tempo de expiração do OTP (One-Time Password) está configurado para mais de uma hora, o que é considerado um risco de segurança.

## Solução
Ajustar o tempo de expiração do OTP para 15 minutos (900 segundos) através da interface administrativa do Supabase.

### Passos para Ajuste

1. Acesse o Dashboard do Supabase
2. Navegue até Authentication > Settings
3. Localize a seção "Email Auth"
4. Ajuste o campo "OTP Expiry" para 900 (15 minutos em segundos)
5. Salve as alterações

### Impacto da Mudança
- Os códigos OTP enviados por email expirarão após 15 minutos
- Usuários terão que solicitar um novo código se não usarem dentro deste período
- Melhoria significativa na segurança da autenticação

### Boas Práticas
- Monitore tentativas falhas de autenticação
- Implemente rate limiting para solicitações de OTP
- Mantenha logs de eventos de autenticação para auditoria

## Verificação
Após a mudança, teste o fluxo de autenticação para garantir que:
1. Os códigos OTP são recebidos corretamente
2. Os códigos expiram após 15 minutos
3. O sistema permite solicitar novo código após expiração

## Suporte
Em caso de problemas, consulte a [documentação oficial do Supabase Auth](https://supabase.com/docs/guides/auth) ou entre em contato com o suporte.

# Ativação da Proteção contra Senhas Vazadas

## Problema
A proteção contra senhas vazadas está desativada, o que representa um risco de segurança para os usuários.

## Solução
Ativar a proteção contra senhas vazadas através da interface administrativa do Supabase.

### Passos para Ativação

1. Acesse o Dashboard do Supabase
2. Navegue até Authentication > Settings
3. Localize a seção "Security Settings"
4. Ative a opção "Leaked Password Protection" (Proteção contra Senhas Vazadas)
5. Salve as alterações

### Benefícios
- Impede que usuários utilizem senhas comprometidas em vazamentos de dados anteriores
- Verifica senhas contra o banco de dados do HaveIBeenPwned.org
- Aumenta significativamente a segurança das contas de usuário
- Reduz o risco de acesso não autorizado através de ataques de força bruta

### Impacto da Mudança
- Usuários que tentarem usar senhas comprometidas receberão uma mensagem de erro
- Eles serão solicitados a criar uma senha mais segura

## Implementação Complementar
Considere também implementar:

1. **Requisitos de Força de Senha**
   - Configure requisitos mínimos de senha (comprimento, caracteres especiais, etc.)
   - Navegue até Authentication > Settings > Password Settings

2. **Bloqueio de Conta**
   - Configure bloqueio temporário após múltiplas tentativas falhas de login
   - Navegue até Authentication > Settings > Security Settings

## Verificação
Após a ativação, teste o fluxo de registro e alteração de senha para garantir que:
1. Senhas conhecidas como vazadas são rejeitadas
2. O sistema fornece feedback claro ao usuário sobre o motivo da rejeição
3. O fluxo normal de autenticação continua funcionando para senhas seguras

## Suporte
Em caso de problemas, consulte a [documentação oficial do Supabase Auth](https://supabase.com/docs/guides/auth/auth-passwords) ou entre em contato com o suporte.
