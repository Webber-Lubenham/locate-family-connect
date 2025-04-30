# Relato de Teste: Localização de Estudante via Perfil de Pai

## Cenário

Durante o desenvolvimento e testes do sistema de localização, realizamos o seguinte fluxo para validar a visualização da localização de um estudante por um responsável (pai):

## 1. Criação dos Dados de Teste (Seed)
- **Usuário Pai:**
  - Email: `parent.test@example.com`
  - Criado via seed nas tabelas de autenticação e de perfis.
- **Usuário Estudante:**
  - Email: `student.test@example.com`
  - UUID: `b30ffe65-0909-4ab4-aa22-fbae8ab4c283`
  - Criado via seed nas tabelas de autenticação e de perfis.
- **Localização:**
  - Latitude: `-23.5489`
  - Longitude: `-46.6388`
  - Associada ao estudante de teste via seed.

## 2. Fluxo de Teste
1. Login no sistema com o usuário pai (`parent.test@example.com`).
2. Acesso à rota:
   - `http://localhost:8080/student-map/b30ffe65-0909-4ab4-aa22-fbae8ab4c283`
3. Esperado: Visualizar o mapa com a localização do estudante e o histórico de localizações.

## 3. Resultado Obtido
- O frontend exibe o seguinte erro:
  - **Localização do Estudante:**
    - `Erro ao buscar perfil do usuário`
  - **Histórico de Localizações:**
    - `Erro ao buscar perfil do usuário`
- Console do navegador mostra:
  - Requisição GET para `/profiles?select=id&user_id=eq.b30ffe65-0909-4ab4-aa22-fbae8ab4c283` retorna **406 (Not Acceptable)**.
  - Detalhe do erro: `{code: 'PGRST116', details: 'The result contains 0 rows', ...}`

## 4. Observações Técnicas
- O seed foi executado normalmente, criando os registros de pai, estudante e localização.
- O frontend está buscando o perfil do estudante pelo UUID informado na URL.
- O erro indica que **não existe um registro na tabela `profiles` com `user_id = 'b30ffe65-0909-4ab4-aa22-fbae8ab4c283'`** no banco de dados atual.
- Possíveis causas:
  - O seed não populou corretamente a tabela `profiles` para esse estudante.
  - O banco foi resetado ou alterado após o seed.
  - Alguma inconsistência entre as tabelas (`auth.users`, `users`, `profiles`).

## 5. Próximos Passos Sugeridos
- Garantir via migration ou seed que o estudante de teste exista em todas as tabelas necessárias (`auth.users`, `profiles`, `users`, `locations`).
- Validar se o UUID do estudante está correto e igual em todas as referências.
- Reexecutar o teste após garantir a consistência dos dados.

---

*Documento gerado automaticamente para rastreabilidade do bug e apoio à depuração.* 