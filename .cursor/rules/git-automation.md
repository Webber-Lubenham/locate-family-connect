# Regra de Automação Git para Cursor

**Descrição:**
Sempre que o usuário digitar o comando `git`, execute automaticamente:

1. `git status` para mostrar o estado do repositório.
2. `git add -A` para adicionar todas as alterações.
3. `git commit -m "<mensagem contextualizada>"` usando uma mensagem de commit baseada no contexto recente (ex: arquivos alterados, tipo de alteração, bug fix, feature, docs, etc).
4. `git push` para enviar ao repositório remoto.

**Detalhes da mensagem de commit:**
- Use o padrão: `fix: <descrição>` para correções de bug.
- Use o padrão: `feature: <descrição>` para novas funcionalidades.
- Use o padrão: `docs: <descrição>` para documentação.
- Sempre inclua `[type: fix/feature/docs]` ao final.
- A mensagem deve ser clara e refletir a alteração principal do contexto.

**Exemplo:**
> Se o último arquivo alterado foi um bug em StudentRepository.ts, a mensagem deve ser:
> `fix: remove parâmetro da chamada RPC get_guardian_students para alinhar com assinatura sem parâmetros [type: fix]`

**Objetivo:**
- Garantir versionamento consistente e automatizado.
- Facilitar rastreabilidade e revisão de código. 