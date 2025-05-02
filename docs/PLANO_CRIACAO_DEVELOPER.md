# Plano para Criar Perfil de Developer no Supabase

## 1. Preparação

- **Acesse o painel do Supabase** do seu projeto.
- **Tenha em mãos**:
  - Seu e-mail institucional: `mauro.lima@educacao.am.gov.br`
  - Uma senha forte: `DevEduConnect2025!` (ou outra de sua escolha)
  - A Service Key do Supabase (caso opte por script)

---

## 2. Escolha o método de criação

### A. Método Manual (Painel Supabase) — Recomendado

1. **Vá em Auth > Users**
2. Clique em **Add User**
3. Preencha:
   - **Email:** `mauro.lima@educacao.am.gov.br`
   - **Password:** `DevEduConnect2025!`
   - **User metadata:**  
     ```json
     {
       "user_type": "developer",
       "full_name": "Mauro Lima"
     }
     ```
   - Marque para confirmar o e-mail automaticamente (se disponível)
4. Clique em **Create**
5. Pronto! O usuário estará apto a logar imediatamente.

---

### B. Método Automático (Script Node.js com Service Key)

1. **No seu projeto, abra o arquivo `.env`** e adicione/corrija:
   ```
   VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
   VITE_SUPABASE_SERVICE_KEY=<sua-service-key>
   ```
2. **No terminal, execute:**
   ```sh
   node scripts/create-developer-user.js
   ```
   (O script já está preparado para criar o usuário com seu e-mail e senha.)

3. **Verifique no painel Supabase** se o usuário foi criado.

---

## 3. Validação

- **Acesse o frontend** e faça login com:
  - **Email:** `mauro.lima@educacao.am.gov.br`
  - **Senha:** `DevEduConnect2025!`
- Você deve ser redirecionado para o dashboard de developer.

---

## 4. Dicas de Segurança

- Após o primeiro login, altere a senha para uma de sua preferência.
- Nunca compartilhe a Service Key fora de ambientes seguros.
- Mantenha o acesso de developer restrito a quem realmente precisa.

---

## 5. Se der erro

- Verifique se a Service Key está correta no `.env`.
- Confira se o usuário já existe (se sim, delete antes de criar de novo).
- Veja se o painel Supabase mostra algum erro ao criar o usuário.
- Se usar o script, confira o log detalhado para mensagens de erro.

---

Se seguir esse plano, seu perfil de developer será criado corretamente e você poderá acessar todas as ferramentas avançadas do sistema! 