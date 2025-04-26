# Relato do Problema de Relacionamento entre Responsáveis e Estudantes

## Contexto
Durante a implementação do relacionamento bidirecional entre responsáveis (pais) e estudantes no Locate Family Connect, identificamos que os vínculos necessários não estavam corretamente refletidos no banco de dados. Isso impedia que:
- O pai visse seus filhos no dashboard.
- Os filhos vissem o pai em seus respectivos dashboards.

## Diagnóstico
Após análise, detectamos os seguintes pontos:
- Os usuários (pai e filhos) existiam na tabela `users`, mas alguns perfis estavam ausentes ou incompletos na tabela `profiles`.
- Não havia registros na tabela `guardians` associando o pai aos filhos.
- A ausência de constraints únicas em `profiles` dificultava o uso de comandos SQL com `ON CONFLICT`.

## Solução Proposta e Executada
1. **Garantimos a existência dos perfis dos filhos na tabela `profiles`**:
   - Inserimos registros para cada filho, apenas se não existissem, utilizando comandos SQL condicionais.
2. **Criamos os relacionamentos na tabela `guardians`**:
   - Associamos o pai (`frankwebber33@hotmail.com`) aos três filhos por meio de registros, também evitando duplicidade.
3. **Validação**:
   - Agora, o pai deve visualizar os três filhos no dashboard e cada filho deve visualizar o pai, conforme esperado para o relacionamento bidirecional.

## Recomendações Futuras
- Garantir que toda criação de usuário gere automaticamente o perfil correspondente em `profiles`.
- Adicionar constraints únicas em `profiles.user_id` para facilitar futuras operações SQL.
- Automatizar a criação dos vínculos no frontend, utilizando as funções SQL criadas nas últimas migrações.

---

Este relato documenta o problema, a análise e a solução aplicada, servindo de referência para futuras manutenções e evolução do sistema.
