
# Instruções para Teste de Envio de E-mail de Localização

## Objetivo
Este script testa o envio de e-mails de localização utilizando a API Resend para o projeto EduConnect.

## Pré-requisitos
- Node.js instalado (versão 16 ou superior)
- Acesso à chave da API Resend
- Conexão com a internet

## Passos para Execução do Teste

### 1. Localizar o Script
O script de teste está localizado na raiz do projeto:
```
test-direct-email.js
```

### 2. Configuração
- Verifique se a variável `RESEND_API_KEY` está corretamente configurada
- Confirme que o email de destino (`educatechnov@gmail.com`) está correto

### 3. Executar o Teste
No terminal, execute o seguinte comando:
```bash
node test-direct-email.js
```

## O que Verificar após a Execução

### Sucesso
- Verifique o console para mensagens de confirmação
- Cheque a caixa de entrada do email de destino
- Inspecione a pasta de spam

### Possíveis Problemas
- Verifique erros no console
- Confirme a validade da API key
- Verifique restrições do domínio no Resend

## Troubleshooting
1. Erro 401: Verifique a API key
2. Erro 403: Verifique permissões do domínio
3. Sem email recebido: Verifique logs detalhados

## Logs Importantes
Analise cuidadosamente:
- Status da API
- ID do email enviado
- Detalhes de erro (se houver)

## Suporte
Em caso de problemas persistentes, entre em contato com a equipe de desenvolvimento.

---
*Última atualização: 24/04/2025*
