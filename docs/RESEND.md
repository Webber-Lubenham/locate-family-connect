# Documentação do Sistema de Email - Resend API

## 1. Visão Geral

O EduConnect utiliza o Resend como serviço principal de envio de emails para todas as comunicações do sistema, incluindo:
- Compartilhamento de localização
- Recuperação de senha
- Notificações do sistema
- Comunicações importantes

## 2. Configuração Técnica

### 2.1 Credenciais e Ambiente
```env
RESEND_API_KEY=re_xxxx...  # Chave principal
BACKUP_EMAIL_API_KEY=      # Chave de backup (recomendada)
```

### 2.2 Domínio Configurado
- Domínio: `sistema-monitore.com.br`
- Email padrão: `notificacoes@sistema-monitore.com.br`
- Status: **verificado** (verificado no Resend Dashboard)

### 2.3 Registros DNS Necessários
```dns
# Registros MX
sistema-monitore.com.br.    MX    10 mx1.resend.com
sistema-monitore.com.br.    MX    20 mx2.resend.com

# SPF Record
sistema-monitore.com.br.    TXT   "v=spf1 include:spf.resend.com -all"

# DKIM Record
resend._domainkey          TXT    "v=DKIM1; k=rsa; p=..."

# DMARC Record
_dmarc.sistema-monitore.com.br.  TXT  "v=DMARC1; p=reject; pct=100"
```

## 3. Implementação

### 3.1 Edge Functions
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, content: string) {
  try {
    const data = await resend.emails.send({
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [to],
      subject: subject,
      html: content,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

### 3.2 Templates de Email
Localização: `src/lib/email-templates/`
- `location-share.html`: Template para compartilhamento de localização
- `password-reset.html`: Template para recuperação de senha
- `notification.html`: Template para notificações gerais

## 4. Monitoramento e Logs

### 4.1 Dashboard Resend
- URL: https://resend.com/dashboard
- Métricas disponíveis:
  - Taxa de entrega
  - Taxa de abertura
  - Taxa de cliques
  - Bounces e reclamações

### 4.2 Logs no Supabase
```bash
# Visualizar logs da Edge Function
supabase functions logs share-location --project-ref your-project-ref
```

## 5. Testes e Validação

### 5.1 Scripts de Teste
```bash
# Teste básico de envio
node scripts/test-email.js

# Teste com template de localização
node scripts/test-location-email.js

# Teste completo do sistema
npm run test:email-system
```

### 5.2 Endpoints de Teste
```http
POST /api/test-email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "content": "Test content"
}
```

## 6. Solução de Problemas

### 6.1 Problemas Comuns

#### Email não entregue
1. Verificar logs no Resend Dashboard
2. Confirmar status do domínio
3. Verificar filtros de spam
4. Validar endereço de email

#### Erros de API
- 401: API Key inválida
- 429: Limite de taxa excedido
- 403: Problema com permissões

### 6.2 Procedimentos de Verificação
1. Verificar status do serviço: https://status.resend.com
2. Validar configurações DNS
3. Testar com email alternativo
4. Verificar logs de erro

## 7. Manutenção

### 7.1 Rotação de Chaves
- Frequência: A cada 90 dias
- Processo:
  1. Gerar nova chave no Dashboard
  2. Atualizar variáveis de ambiente
  3. Reimplantar Edge Functions
  4. Verificar funcionamento
  5. Revogar chave antiga

### 7.2 Verificações Regulares
- Diária: Monitorar taxa de entrega
- Semanal: Revisar logs de erro
- Mensal: Verificar configurações DNS
- Trimestral: Rotação de chaves API

## 8. Segurança

### 8.1 Melhores Práticas
- Nunca expor API Keys no código
- Usar variáveis de ambiente
- Implementar rate limiting
- Manter logs seguros
- Validar endereços de email

### 8.2 Backup
- Sistema de fallback configurado
- Chave de API secundária disponível
- Processo de failover automático

## 9. Recursos e Links

### 9.1 Documentação
- [Documentação Resend](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)
- [Guias de Integração](https://resend.com/guides)

### 9.2 Suporte
- Email: support@resend.com
- Status: https://status.resend.com
- Dashboard: https://resend.com/dashboard

## 10. Atualizações e Versões

### 10.1 Histórico de Versões
- v1.0.0: Implementação inicial
- v1.1.0: Adição de templates
- v1.2.0: Sistema de backup
- v1.3.0: Melhorias de monitoramento

### 10.2 Próximas Atualizações Planejadas
- [ ] Implementação de analytics avançado
- [ ] Novos templates responsivos
- [ ] Sistema de filas para emails em massa
- [ ] Melhorias no sistema de logs

## 11. Configuração do Resend no Supabase

### 11.1 Integração SMTP para Auth

O Supabase Auth utiliza SMTP para enviar emails de recuperação de senha e outros emails do sistema de autenticação. Para garantir que esses emails sejam enviados corretamente usando o Resend, é necessário configurar o provedor SMTP no painel do Supabase.

### 11.2 Passo a Passo: Configurar SMTP do Resend no Supabase

#### 1. Obtenha as credenciais SMTP do Resend
- Acesse https://resend.com/dashboard
- Vá em Settings > SMTP
- Copie as seguintes informações:
  - Host: `smtp.resend.com`
  - Usuário: `resend`
  - Senha: sua `RESEND_API_KEY`
  - Porta: `587` (TLS) ou `465` (SSL)

#### 2. Acesse o painel do Supabase
- Entre em https://app.supabase.com/
- Selecione seu projeto

#### 3. Configure o provedor SMTP
- Navegue até Auth > Settings > Email
- Localize a seção de configuração de email (SMTP)
- Preencha os campos com os dados do Resend:
  - SMTP Host: `smtp.resend.com`
  - SMTP Port: `587`
  - SMTP User: `resend`
  - SMTP Password: [sua RESEND_API_KEY]
  - Sender Email: `onboarding@resend.dev` (domínio padrão do Resend para testes)
  - Sender Name: `EduConnect`
- Salve as configurações

> **IMPORTANTE**: Use `onboarding@resend.dev` como email temporário até que o domínio `sistema-monitore.com.br` seja verificado no Resend. Depois que o domínio for verificado, você pode atualizar para `notificacoes@sistema-monitore.com.br`.

![Exemplo de configuração SMTP no Supabase](https://i.imgur.com/abcdefg.png)

### 11.3 Verificação e Testes

#### Teste do fluxo de recuperação de senha
1. Use o frontend normalmente para solicitar a recuperação de senha
2. Verifique se o email aparece no painel do Resend
3. Confirme o recebimento na caixa de entrada

#### Solução de problemas SMTP

##### Erro: Emails não aparecem no dashboard do Resend

Se os emails não aparecem no dashboard do Resend, mas o frontend mostra mensagem de sucesso:

1. **Verificar o domínio**: O domínio `sistema-monitore.com.br` precisa ser verificado no Resend
   - Até que seja verificado, use `onboarding@resend.dev` como remetente temporário

2. **Verificar configuração SMTP**:
   - Se o Supabase pedir autenticação STARTTLS, use a porta `587`
   - Se pedir SSL/TLS direto, use a porta `465`
   - Não use a API Key do Resend como "API Key" no Supabase, use como senha SMTP

3. **Verificar logs**: 
   - Verifique os logs do Supabase Auth para erros de SMTP
   - Confirme se as variáveis de ambiente do Supabase não estão sobrescrevendo as configurações do painel

### 11.4 Verificação da Implementação Frontend

A implementação frontend já está correta, usando o método oficial do Supabase:

```typescript
// Método usado no frontend para recuperação de senha
const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
  redirectTo: window.location.origin + '/reset-password',
});
```

O contexto AuthContext expõe esse método como `forgotPassword`, que é utilizado no componente ForgotPassword.