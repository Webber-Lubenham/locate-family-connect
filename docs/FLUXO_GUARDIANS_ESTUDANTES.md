
# Fluxo de Relacionamento entre Estudantes e Responsáveis

## Visão Geral

Este documento descreve o fluxo completo de gerenciamento de responsáveis no sistema EduConnect, incluindo a arquitetura de dados, funções RPC seguras e políticas de segurança implementadas.

## Arquitetura de Dados

### Tabela `guardians`

A tabela `guardians` armazena o relacionamento entre estudantes e seus responsáveis:

```sql
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
```

### Políticas de Segurança (RLS)

As seguintes políticas de segurança estão implementadas na tabela `guardians`:

1. **Students can view their guardians**: Permite que estudantes vejam seus próprios responsáveis
2. **Students can add their own guardians**: Permite que estudantes adicionem responsáveis
3. **Students can update their own guardians**: Permite que estudantes atualizem dados de seus responsáveis
4. **Students can delete their own guardians**: Permite que estudantes removam responsáveis

## Função RPC Segura

### `get_student_guardians_secure`

Esta função RPC segura foi criada para permitir que estudantes consultem seus responsáveis de maneira segura:

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
  -- Se nenhum ID for fornecido, usa o ID do usuário atual
  IF p_student_id IS NULL THEN
    v_student_id := auth.uid();
  ELSE
    -- Verifica se o usuário atual tem permissão para ver os guardians do estudante fornecido
    IF p_student_id = auth.uid() THEN
      v_student_id := p_student_id;
    ELSE
      RAISE EXCEPTION 'Permissão negada';
    END IF;
  END IF;

  -- Retorna os guardians do estudante
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
```

### Características Importantes:

- **SECURITY DEFINER**: Executa com as permissões do criador da função, não do usuário
- **Validação de Permissão**: Verifica se o usuário tem permissão para acessar os dados solicitados
- **Parâmetro Default**: Se não for fornecido ID, usa o ID do usuário autenticado

## Fluxo de Operações

### Adição de Responsável

1. O estudante acessa a página "Meus Responsáveis"
2. Clica no botão "Adicionar Responsável"
3. Insere o e-mail e nome do responsável
4. O sistema verifica se o e-mail já está cadastrado
5. Se não estiver, cria um novo registro na tabela `guardians`
6. Uma notificação é enviada ao responsável (opcional)

### Remoção de Responsável

1. O estudante acessa a página "Meus Responsáveis"
2. Localiza o responsável na lista
3. Clica no botão "Remover"
4. O sistema solicita confirmação
5. Após confirmação, o registro é removido da tabela `guardians`

### Compartilhamento de Localização

1. O estudante acessa a página "Meus Responsáveis"
2. Localiza o responsável na lista
3. Clica no botão "Compartilhar Localização"
4. O sistema captura a localização atual
5. A localização é enviada ao responsável por e-mail
6. O sistema registra o compartilhamento

## Componentes Frontend

### `useGuardianList.ts`

Hook responsável por gerenciar a lista de responsáveis:

- `guardians`: Lista de responsáveis do estudante
- `isLoading`: Estado de carregamento
- `error`: Mensagem de erro, se houver
- `fetchGuardians`: Função para buscar a lista de responsáveis
- `deleteGuardian`: Função para remover um responsável
- `shareLocation`: Função para compartilhar localização
- `resendEmail`: Função para reenviar convite

### `GuardianCard.tsx`

Componente que exibe os dados de um responsável:

- Nome
- E-mail
- Telefone
- Status (ativo/inativo)
- Data de criação
- Botões de ação (remover, compartilhar localização)

## Diagrama de Relacionamento

```
┌──────────────┐     ┌───────────┐     ┌────────────────┐
│ auth.users   │     │ guardians │     │ locations      │
├──────────────┤     ├───────────┤     ├────────────────┤
│ id           │──┐  │ id        │     │ id             │
│ email        │  │  │ student_id│──┐  │ user_id        │
│ ...          │  │  │ email     │  │  │ latitude       │
└──────────────┘  │  │ full_name │  │  │ longitude      │
                  │  │ phone     │  │  │ timestamp      │
                  │  │ is_active │  │  │ shared_with    │
                  │  │ created_at│  │  │ ...            │
                  └──┤           │  └──┤                │
                     └───────────┘     └────────────────┘
```

## Resolução de Problemas Comuns

### Erro: "Permissão negada"

**Causa**: O usuário não tem permissão para acessar os dados solicitados.

**Solução**: 
1. Verificar se o usuário está autenticado
2. Confirmar se o ID do estudante corresponde ao ID do usuário autenticado
3. Verificar se as políticas RLS estão corretamente configuradas

### Erro: "Função não existe"

**Causa**: A função RPC não foi criada no banco de dados.

**Solução**:
1. Executar a migração que cria a função `get_student_guardians_secure`
2. Verificar se a função existe no banco usando:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_type = 'FUNCTION' 
   AND specific_schema = 'public'
   AND routine_name = 'get_student_guardians_secure';
   ```
