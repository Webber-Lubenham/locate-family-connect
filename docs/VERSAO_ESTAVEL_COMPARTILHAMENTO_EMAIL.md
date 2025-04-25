# Estado Estável do Sistema de Compartilhamento por Email

**Data:** 25 de abril de 2025  
**Commit de referência:** ef74f90 (fix(edge-function): Correção na função share-location para melhorar entrega de emails)

## Visão Geral

Este documento registra o estado estável do sistema de compartilhamento de localização por email. Esta versão foi testada e confirmada como funcional em 25/04/2025, com emails sendo entregues corretamente aos destinatários.

## Componentes Críticos

### 1. Função Edge do Supabase (`share-location`)

A função Edge está configurada corretamente com os seguintes elementos críticos:

```typescript
const payload = {
  from: "EduConnect <noreply@sistema-monitore.com.br>", // CRÍTICO: Este endereço específico
  to: [to],
  subject: `${name} compartilhou a localização atual`,
  html,
  headers: {
    "X-Entity-Ref-ID": emailId,
    "X-Priority": "1",
    "X-MSMail-Priority": "High",
    "Importance": "high",
    "DKIM-Signature": "v=1; a=rsa-sha256",
    "SPF": "pass",
    "List-Unsubscribe": "<mailto:unsubscribe@sistema-monitore.com.br>",
    "Return-Path": "bounces@sistema-monitore.com.br",
    "Message-ID": `<${emailId}@sistema-monitore.com.br>`,
    "X-Report-Abuse": "Please report abuse to abuse@sistema-monitore.com.br",
    "X-Auto-Response-Suppress": "OOF, DR, RN, NRN, AutoReply"
  },
};
```

### 2. Configuração de DNS no Resend

Os registros DNS abaixo devem permanecer configurados:

```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "send.sistema-monitore.com.br.",
        "Type": "MX",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "10 feedback-smtp.us-east-1.amazonses.com"
          }
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "send.sistema-monitore.com.br.",
        "Type": "TXT",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "\"v=spf1 include:amazonses.com ~all\""
          }
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "resend._domainkey.sistema-monitore.com.br.",
        "Type": "TXT",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4EhejEP5EtbFVz8R6AIyhg884wEUv+hvzRv+g4momhuOULr70v3XaDt51ehF0Eb1CzLDc/ZAGt43cvt/evtJtoJ2oW9yZyRyMYrRI4oShwrPKRMcT94A+zzWMNCgye4Rm/OiDs2O50iZHB2dvyM72wldsv+M304jZz7UFRjMmrQIDAQAB\""
          }
        ]
      }
    }
  ]
}
```

### 3. Domínio Verificado no Resend

O domínio `sistema-monitore.com.br` está verificado e configurado corretamente no Resend. É crucial que o prefixo `noreply@` esteja autorizado para envio.

## Regras Importantes

1. **Não alterar o endereço de email**
   - O endereço remetente deve ser exatamente `noreply@sistema-monitore.com.br`
   - Diferenças como `notificacoes@` ou `no-reply@` (com hífen) causarão falhas

2. **Manter cabeçalhos de email**
   - Os cabeçalhos DKIM, SPF e outros são críticos para a entregabilidade
   - Não remover ou simplificar excessivamente os cabeçalhos

3. **Deploy da função Edge**
   - O deploy automático apresenta problemas
   - Usar o Dashboard do Supabase para deploy manual da função
   
## Como Restaurar Esta Versão

### Código da Função Edge

O código completo da função está disponível no arquivo [share-location-fixed.ts](../share-location-fixed.ts). Caso necessário, este código deve ser copiado e implantado manualmente no Dashboard do Supabase.

### Git

Para restaurar o estado completo do repositório para esta versão estável:

```bash
git checkout ef74f90
```

## Testes Realizados

1. **Envio para Hotmail**: Testado com sucesso em 25/04/2025
   - Destinatário: frankwebber33@hotmail.com
   - Resultado: Email entregue e visível na caixa de entrada

2. **Respostas da API Resend**: Status 200 com ID do email retornado

## Pessoas de Referência

- Mauro Frank (frankwebber33@hotmail.com) - Testou e confirmou o recebimento dos emails

---

**Nota**: Esta documentação deve ser atualizada se houver alterações bem-sucedidas no futuro. Conserve este documento como referência caso algo quebre posteriormente.
