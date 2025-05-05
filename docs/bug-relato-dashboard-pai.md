# Relato de Bug: Dashboard do Responsável não exibe estudantes vinculados

**Data:** 2025-05-13  
**Responsável:** Engenharia Locate-Family-Connect

---

## Cenário
- Usuário: Responsável (exemplo: Mauro Frank Lima de Lima)
- Dashboard: https://monitore-mvp.lovable.app/parent-dashboard
- Sintoma: A seção "Estudantes Vinculados" exibe "Nenhum estudante vinculado ainda.", mesmo havendo relacionamentos no banco de dados.

---

## Diagnóstico
- O frontend faz uma chamada POST para o endpoint:
  ```
  https://rsvjnndhbyyxktbczlnk.supabase.co/rest/v1/rpc/get_guardian_students
  ```
- O console do navegador mostra:
  - **404 (Not Found)** para a chamada RPC
  - Mensagem: `Error fetching students: {code: '42883', ... message: 'operator does not exist: uuid = integer'}`
- O banco de dados possui registros válidos de relacionamento entre responsáveis e estudantes.

---

## Causa Raiz
- A função `get_guardian_students` não estava exposta corretamente como endpoint RPC no Supabase.
- Motivos:
  - A função não estava marcada como `STABLE` (requisito do Supabase para RPCs).
  - Possível divergência de tipos ou parâmetros na assinatura da função.
  - Permissões de EXECUTE não estavam garantidas para o papel `authenticated`.

---

## Proposta de Solução
1. **Recriar a função no Supabase** com as propriedades corretas:
   ```sql
   DROP FUNCTION IF EXISTS public.get_guardian_students();
   CREATE OR REPLACE FUNCTION public.get_guardian_students()
   RETURNS TABLE (
     student_id UUID,
     student_email TEXT,
     student_name TEXT
   )
   LANGUAGE plpgsql
   STABLE
   SECURITY DEFINER
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       u.id,
       u.email,
       COALESCE(p.full_name, '')
     FROM
       guardians g
       JOIN users u ON g.student_id = u.id
       LEFT JOIN profiles p ON p.user_id = u.id
     WHERE
       g.email = (auth.jwt() ->> 'email')
       AND g.is_active = true;
   END;
   $$;
   GRANT EXECUTE ON FUNCTION public.get_guardian_students TO authenticated;
   ```
2. **Aplicar a migration** no ambiente de produção.
3. **Verificar no painel Supabase** se a função aparece como STABLE e está disponível em Database > Functions.
4. **Testar o dashboard**: O frontend deve exibir corretamente os estudantes vinculados ao responsável.

---

## Referências
- [Supabase Docs: Exposing Functions as RPC Endpoints](https://supabase.com/docs/guides/database/functions#exposing-functions-as-rpc-endpoints)
- [Dashboard do Responsável](https://monitore-mvp.lovable.app/parent-dashboard)

---

**Arquivo gerado automaticamente via instrução GPT-4.1** 