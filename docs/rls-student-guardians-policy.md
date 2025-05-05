# Instruções: Validação do Acesso de Estudantes à Lista de Responsáveis (guardians)

**Data:** 2025-05-05  
**Responsável:** Engenharia Locate-Family-Connect

---

## Objetivo
Garantir que estudantes consigam visualizar corretamente seus responsáveis (guardians) no painel, após a aplicação da nova policy RLS na tabela `guardians`.

---

## 1. Pré-requisitos
- Migration aplicada: `20250505_fix_guardians_permissions.sql` (policy "Students can view their guardians")
- Ambiente local rodando (`localhost:8080`) ou ambiente de homologação
- Usuário estudante cadastrado e autenticado

---

## 2. Passos para Teste

### 2.1. Acesse o Painel do Estudante
- Abra o navegador e acesse: `http://localhost:8080/student-dashboard`
- Faça login como estudante

### 2.2. Verifique a Seção "Meus Responsáveis"
- Localize a seção "Meus Responsáveis" no painel
- **Esperado:** A lista de responsáveis deve ser exibida corretamente
- **Não esperado:** Mensagem de erro de permissão ou lista vazia indevidamente

### 2.3. Verifique o Console do Navegador
- Pressione `F12` para abrir as DevTools
- Vá até a aba **Console**
- **Procure por erros** relacionados a permissões (403) ou requisições malformadas (400)

### 2.4. Verifique as Requisições de Rede
- Na DevTools, vá até a aba **Network**
- Filtre por `guardians` ou `get_student_guardians_secure`
- **Esperado:**
  - Requisição para `/rest/v1/guardians` deve retornar 200 e dados
  - OU requisição para `/rpc/get_student_guardians_secure` deve retornar 200 e dados
- **Não esperado:**
  - 403 Forbidden (problema de permissão)
  - 400 Bad Request (problema de parâmetro)

---

## 3. Diagnóstico de Problemas

### 3.1. Se aparecer 403 Forbidden
- Confirme se a migration foi aplicada corretamente
- Verifique se a policy está ativa:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'guardians';
  ```
- Policy esperada:
  - `USING (student_id = auth.uid())`

### 3.2. Se aparecer 400 Bad Request na função RPC
- Verifique se o frontend está chamando a função com o parâmetro correto:
  - Para o estudante atual: **não envie parâmetro**
  - Para outro estudante: envie `{ p_student_id: '<uuid>' }`

### 3.3. Se a lista aparecer vazia
- Confirme que existem registros na tabela `guardians` com `student_id` igual ao `auth.uid()` do estudante logado
- Teste a query diretamente no SQL Editor do Supabase:
  ```sql
  SELECT * FROM guardians WHERE student_id = '<uuid_do_estudante>';
  ```

---

## 4. O que fazer em caso de falha
- Documente o erro encontrado (mensagem, print, status code)
- Consulte os logs do Supabase e do navegador
- Refaça os passos de validação
- Se necessário, entre em contato com o time de backend

---

## 5. Checklist Final
- [ ] Migration aplicada
- [ ] Policy ativa e correta
- [ ] Estudante visualiza seus responsáveis
- [ ] Sem erros 403/400 no console
- [ ] Documentação atualizada

---

**Arquivo gerado automaticamente via instrução GPT-4.1** 