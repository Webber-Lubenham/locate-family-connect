
# Edge Functions

Este documento descreve as Edge Functions disponíveis no projeto e suas configurações necessárias.

## share-location

Edge Function responsável por enviar emails de localização usando o serviço Resend.

### Configuração

#### Variáveis de Ambiente Requeridas

| Variável | Descrição | Status |
|----------|-----------|--------|
| RESEND_API_KEY | Chave de API do serviço Resend | ✅ Configurado |
| BACKUP_EMAIL_API_KEY | Chave para serviço de backup (opcional) | ❌ Não configurado |

#### Como foi Configurado

A variável de ambiente `RESEND_API_KEY` foi configurada via Dashboard do Supabase em 24/04/2025:
1. Acesso: https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/functions/secrets
2. Adicionada como secret com hash: `178d918c968eebf9b7c01b50bf8067c11db14fa78ee833f6ac492b0310b2dddb`

### Funcionalidades

- Envia emails com a localização atual do estudante para os responsáveis
- Usa o domínio verificado `sistema-monitore.com.br` para melhor entregabilidade
- Inclui link para Google Maps com as coordenadas
- Formato de email responsivo para melhor visualização em dispositivos móveis
- Versão em texto plano para clientes de email que não suportam HTML

### Testes

Para testar o envio de emails:

1. Via frontend (recomendado):
   - Acesse http://localhost:8081/guardians
   - Clique em "Enviar Localização" para qualquer responsável listado

2. Via Edge Function de teste:
   ```bash
   curl -X POST 'https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/test-email' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ..." \
     -d '{"email": "seu-email@exemplo.com"}'
   ```

3. Via script de teste (desenvolvimento):
   ```bash
   node send-location-email.js [email-destino]
   ```

### Logs e Monitoramento

Os logs da função podem ser visualizados em:
```
https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/functions/share-location/logs
```

### Troubleshooting

Se os emails não estiverem sendo enviados:

1. **Verificar logs da Edge Function** para identificar erros de envio
2. **Verificar filtros de spam** no email do destinatário
3. **Verificar domínio** - Confirme que `sistema-monitore.com.br` está verificado no Resend
4. **Teste com endereço alternativo** - Use a função `test-email` para testar com outro endereço
5. **Verificar políticas de email corporativo** - Alguns domínios corporativos bloqueiam emails externos
6. **Verificar status do Resend** - Veja se o serviço está operacional em https://status.resend.com

### Problemas Comuns

| Problema | Possível Causa | Solução |
|----------|---------------|---------|
| Email não chega | Filtro de spam | Verificar pasta de spam/lixo eletrônico |
| Email bloqueado | Política corporativa | Usar email pessoal (Gmail, Outlook, etc.) |
| Erro 429 | Limite de taxa excedido | Aguardar alguns minutos e tentar novamente |
| Falha de envio | Configuração DNS | Verificar registros DNS do domínio no Resend |

## test-email

Edge Function para testar o envio de emails pelo sistema.

### Configuração

Utiliza a mesma configuração da função `share-location`.

### Uso

```bash
curl -X POST 'https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/test-email' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ..." \
  -d '{"email": "destinatario@exemplo.com"}'
```

### Finalidade

Esta função envia um email de teste simples para verificar a configuração do sistema de email e depurar problemas de entrega.
