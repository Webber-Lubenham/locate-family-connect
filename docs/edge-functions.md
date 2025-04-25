# Edge Functions

Este documento descreve as Edge Functions disponíveis no projeto e suas configurações necessárias.

## share-location

Edge Function responsável por enviar emails de localização usando o serviço Resend.

### Configuração

#### Variáveis de Ambiente Requeridas

| Variável | Descrição | Status |
|----------|-----------|--------|
| RESEND_API_KEY | Chave de API do serviço Resend | ✅ Configurado |

#### Como foi Configurado

A variável de ambiente `RESEND_API_KEY` foi configurada via Dashboard do Supabase em 24/04/2025:
1. Acesso: https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/functions/secrets
2. Adicionada como secret com hash: `178d918c968eebf9b7c01b50bf8067c11db14fa78ee833f6ac492b0310b2dddb`

### Funcionalidades

- Envia emails com a localização atual do estudante para os responsáveis
- Usa o domínio verificado `sistema-monitore.com.br` para melhor entregabilidade
- Inclui link para Google Maps com as coordenadas

### Testes

Para testar o envio de emails:

1. Via frontend (recomendado):
   - Acesse http://localhost:8081/guardians
   - Clique em "Enviar Localização" para qualquer responsável listado

2. Via script de teste (desenvolvimento):
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

1. Verifique os logs da função para identificar possíveis erros
2. Confirme que o domínio `sistema-monitore.com.br` está verificado no Resend
3. Teste o envio direto usando o frontend em `/guardians`
4. Se necessário, use o script `send-location-email.js` para testes isolados

### Desenvolvimento Local

Para desenvolver e testar localmente:

1. Solicite a chave da API do Resend ao administrador do projeto

2. Configure o arquivo `.env.local`:
   ```
   RESEND_API_KEY=[solicite ao admin]
   ```

3. Execute a função localmente:
   ```bash
   supabase functions serve share-location
   ``` 