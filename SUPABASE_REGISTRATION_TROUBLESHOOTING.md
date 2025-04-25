# Resolução de Problemas: Cadastro de Usuários no Supabase

## Diagnóstico do Problema

Após testes extensivos e análise dos logs, identificamos que o problema está no **backend do Supabase** e não no frontend da aplicação. O erro persistente "Database error saving new user" continua ocorrendo mesmo quando:

- Removemos completamente o campo de telefone do formulário
- Simplificamos os dados enviados para o mínimo necessário
- Implementamos diferentes formatos para os dados de entrada

## Passos para Resolução

### 1. Verificar Configurações no Painel do Supabase

1. **Acesse o Dashboard do Supabase**
   - Entre em [https://app.supabase.com](https://app.supabase.com)
   - Selecione o projeto `rsvjnndhbyyxktbczlnk`

2. **Verifique a Configuração de Autenticação**
   - Navegue para "Authentication" > "Settings"
   - Confirme que a opção "Enable email confirmations" está configurada conforme desejado
   - Verifique se há alguma restrição de domínio ou regra personalizada que possa estar bloqueando o registro

3. **Examine os Logs de Erro**
   - Vá para a aba "Logs" no menu lateral
   - Filtre por "Error" no nível de log
   - Procure por eventos relacionados a "auth.signup" ou "new user creation"
   - Os logs detalhados mostrarão o erro exato que está ocorrendo no banco de dados

4. **Verifique o Schema do Banco de Dados**
   - Vá para a aba "Table Editor"
   - Selecione a tabela `profiles`
   - Verifique se há restrições, triggers ou validações que possam estar causando o erro
   - Verifique se a relação entre as tabelas `auth.users` e `public.profiles` está configurada corretamente

### 2. Teste de Criação Manual de Usuário

Para determinar se o problema está na API ou na estrutura do banco de dados:

1. **Crie um Usuário Direto no Painel**
   - Vá para "Authentication" > "Users"
   - Clique em "Add User" ou "Invite User"
   - Preencha os detalhes básicos (email, senha) sem informar telefone
   - Se funcionar, o problema está na integração da API, não no banco de dados

2. **Teste com a API do Supabase Studio**
   - Vá para "API Docs" ou "SQL Editor" 
   - Experimente criar um usuário usando a API diretamente no Studio
   - Isso ajudará a identificar se o problema está na configuração da API ou no banco de dados

### 3. Possíveis Soluções para o Backend

Dependendo do que for descoberto nos logs e testes:

1. **Se for um problema de Schema**:
   - Crie uma migration SQL para ajustar a tabela `profiles`
   - Remova restrições desnecessárias (especialmente no campo de telefone)
   - Verifique se os triggers estão configurados corretamente

2. **Se for um problema de Configuração**:
   - Ajuste as configurações de autenticação no painel do Supabase
   - Verifique se há funções RPC ou hooks personalizados interferindo

3. **Se for um problema na API de Autenticação**:
   - Verifique a versão da API do Supabase que está sendo usada
   - Confirme se há limitações conhecidas ou bugs reportados para essa versão

## Melhorias Já Implementadas no Frontend

Enquanto o problema no backend é resolvido, já implementamos:

1. **Tratamento de Erro Aprimorado**
   - Logs detalhados dos erros (código, status, mensagem)
   - Mensagens mais amigáveis para os usuários
   - Feedback visual mais claro quando ocorre um erro

2. **Armazenamento Temporário de Dados**
   - Os dados de registro são salvos no localStorage
   - Isso permite futuras tentativas sem que o usuário precise preencher o formulário novamente

3. **Campo de Telefone Opcional**
   - O telefone não é mais obrigatório para o registro
   - Não é mais enviado para o Supabase durante o cadastro

## Próximos Passos

1. **Analisar os Logs do Supabase** após mais tentativas de cadastro
2. **Implementar a correção no backend** com base nos resultados da análise
3. **Reintroduzir gradualmente os campos opcionais** (como o telefone) após confirmar que o cadastro básico funciona

---

Documento criado em: 25/04/2025
