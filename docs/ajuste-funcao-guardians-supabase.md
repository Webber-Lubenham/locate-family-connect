
# Ajuste da Função `get_student_guardians_secure` no Supabase

## Problema

Ao rodar os testes Cypress ou acessar o painel do estudante, ocorre erro 404 na chamada RPC:

```
POST /rest/v1/rpc/get_student_guardians_secure 404
```

Isso significa que a função **não existe** no banco Supabase remoto.

---

## Passos para Resolver

### 1. Verifique se a função existe no Supabase

No SQL Editor do Supabase, execute:

```sql
select routine_name
from information_schema.routines
where routine_type = 'FUNCTION'
  and specific_schema = 'public'
  and routine_name = 'get_student_guardians_secure';
```

Se não aparecer nenhum resultado, a função não está criada.

---

### 2. Crie a função manualmente (caso não exista)

No SQL Editor do Supabase, execute:

```sql
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_student_id UUID;
BEGIN
  IF p_student_id IS NULL THEN
    v_student_id := auth.uid();
  ELSE
    IF p_student_id = auth.uid() THEN
      v_student_id := p_student_id;
    ELSE
      RAISE EXCEPTION 'Permissão negada';
    END IF;
  END IF;
  RETURN QUERY
  SELECT 
    g.id,
    g.student_id,
    g.email,
    g.full_name,
    g.phone,
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_student_guardians_secure TO authenticated;
```

---

### 3. Teste a função

No SQL Editor, execute:

```sql
select * from public.get_student_guardians_secure();
```

Se retornar dados (ou ao menos não der erro), a função está pronta.

---

### 4. Rode novamente os testes Cypress

Agora, o erro 404 deve desaparecer e o fluxo de "Meus Responsáveis" funcionará normalmente.

---

## Dicas
- Sempre garanta que as migrations estejam sincronizadas entre local e remoto.
- Se o erro persistir, confira se o nome da função está correto no frontend.
- Documente qualquer ajuste manual feito diretamente no Supabase.

---

**Arquivo gerado automaticamente para suporte ao time de QA e DevOps.** 
