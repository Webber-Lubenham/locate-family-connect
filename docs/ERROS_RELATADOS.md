# Relatório de Erros no Sistema EduConnect

## 1. Erro: Uncaught ReferenceError: process is not defined

### Descrição
Este erro ocorre quando o código tenta acessar a variável global `process` no ambiente do navegador, onde ela não está definida. O erro foi identificado no arquivo:

```
https://ad2bf0f2-d5c0-44f9-82fd-8b2eeeb1165f.lovableproject.com/src/components/RegisterForm.tsx
```

Na linha 20, coluna 21, o erro de referência não definida para `process` foi lançado, causando uma falha em tempo de execução e uma tela em branco.

### Causa Provável
O objeto `process` é uma variável global do Node.js e não está disponível no ambiente do navegador. Isso geralmente acontece quando o código tenta acessar variáveis de ambiente ou outras propriedades do Node.js diretamente no frontend sem o devido tratamento.

### Sugestão de Correção
- Verificar o uso da variável `process` no código frontend e substituir por variáveis de ambiente configuradas corretamente para o ambiente de build (ex: usando Vite, Webpack, etc).
- Utilizar variáveis de ambiente prefixadas (ex: `import.meta.env` no Vite) para acessar configurações no frontend.
- Garantir que o bundler está configurado para substituir ou definir variáveis de ambiente corretamente.

---

## 2. Erro: 422 Unprocessable Content na Requisição de Signup do Supabase

### Descrição
O erro HTTP 422 indica que o servidor entendeu a requisição, mas não conseguiu processar os dados enviados devido a erros semânticos. No contexto do cadastro de usuário, isso geralmente significa que os dados enviados (email, senha, etc) não passaram nas validações do backend.

Exemplo de erro no console:

```
POST https://rsvjnndhbyyxktbczlnk.supabase.co/auth/v1/signup 422 (Unprocessable Content)
```

E mensagem de erro no hook:

```
Supabase signup error: {message: 'User already registered', code: 'user_already_exists'}
```

### Como Verificar
- Inspecionar a aba "Response" no painel Network do DevTools para a requisição que falhou.
- O corpo da resposta deve conter um objeto JSON com detalhes dos erros de validação, por exemplo:

```json
{
  "error": "Invalid input",
  "message": {
    "email": ["Email must be a valid email address"],
    "password": ["Password must be at least 6 characters long"]
  }
}
```

### Possíveis Causas
- Campos obrigatórios ausentes.
- Formato inválido do email.
- Senha com tamanho ou complexidade insuficiente.
- Confirmação de senha não batendo com a senha.
- Usuário já cadastrado (erro `user_already_exists`).

### Sugestões de Correção
- Corrigir os dados enviados no formulário de cadastro conforme as mensagens de erro.
- Implementar validação no frontend para evitar envio de dados inválidos.
- Garantir que o usuário não está tentando cadastrar um email já registrado.
- Tratar erros de forma amigável para o usuário, exibindo mensagens claras.

---

## Resumo

- O erro `process is not defined` indica uso incorreto de variáveis de ambiente no frontend e deve ser corrigido configurando corretamente o acesso a variáveis de ambiente no bundler.
- O erro 422 no signup do Supabase indica falha na validação dos dados enviados, devendo ser inspecionados os detalhes da resposta para corrigir os dados e melhorar a validação no frontend.

---

Este documento foi criado para auxiliar no entendimento e resolução dos erros encontrados no sistema EduConnect durante o processo de autenticação.
