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