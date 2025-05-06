
# PRD - Locate-Family-Connect

## 1. Visão Geral do Produto

### 1.1 Descrição
Locate-Family-Connect é um sistema de rastreamento e compartilhamento de localização que conecta estudantes e responsáveis, permitindo visualização em tempo real, notificações seguras e gerenciamento de perfis.

### 1.2 Objetivos
- Proporcionar um ambiente seguro para compartilhamento de localização entre estudantes e seus responsáveis
- Facilitar a comunicação e monitoramento da segurança dos estudantes
- Oferecer uma experiência de usuário intuitiva e adaptada a diferentes dispositivos

### 1.3 Público-Alvo
- **Estudantes**: Crianças e jovens em idade escolar que precisam compartilhar sua localização
- **Responsáveis**: Pais, mães e tutores que desejam monitorar a localização dos estudantes
- **Administradores**: Equipe de suporte e gestão do sistema

## 2. Requisitos Funcionais

### 2.1 Autenticação e Gerenciamento de Usuários
- Registro de usuários com diferentes tipos de perfil (estudante, responsável, administrador)
- Login seguro com email e senha utilizando PKCE flow
- Recuperação de senha por email
- Perfis de usuário com informações básicas e de contato
- Vinculação entre perfis de estudantes e responsáveis

### 2.2 Compartilhamento de Localização
- Rastreamento de localização dos estudantes em tempo real
- Interface de mapa para visualização da localização atual e histórico
- Compartilhamento manual de localização pelo estudante com seus responsáveis
- Histórico de localizações compartilhadas com data, hora e endereço

### 2.3 Notificações e Alertas
- Envio de emails de compartilhamento de localização
- Notificações para responsáveis quando um estudante compartilha sua localização
- Alertas de segurança para movimentações suspeitas ou fora de áreas pré-definidas
- Resumo de atividades diárias/semanais

### 2.4 Gerenciamento de Vínculos
- Adição e remoção de vínculos entre estudantes e responsáveis
- Aprovação de solicitações de vínculo por parte dos estudantes
- Painel de gerenciamento de responsáveis para estudantes
- Painel de gerenciamento de estudantes para responsáveis

### 2.5 Administração do Sistema
- Painel administrativo para monitoramento de usuários e atividades
- Processamento de webhooks para integração com serviços externos
- Logs de eventos para auditoria e diagnóstico
- Ferramentas de suporte para resolução de problemas

## 3. Requisitos Não Funcionais

### 3.1 Desempenho
- Tempo de carregamento do mapa inferior a 3 segundos
- Atualização de localização em tempo real (intervalo máximo de 30 segundos)
- Suporte a pelo menos 10.000 usuários simultâneos

### 3.2 Segurança
- Autenticação PKCE com Supabase Auth
- Criptografia de dados sensíveis
- Políticas de Row Level Security (RLS) para controle de acesso
- Proteção contra ataques comuns (CSRF, XSS, SQL Injection)
- Validação de entrada em todos os formulários

### 3.3 Disponibilidade e Confiabilidade
- Disponibilidade de 99,9% do sistema
- Backup automático de dados
- Plano de recuperação de desastres
- Monitoramento contínuo de serviços

### 3.4 Usabilidade
- Interface responsiva para dispositivos móveis e desktop
- Experiência de usuário intuitiva e acessível
- Suporte a múltiplos idiomas (inicialmente Português e Inglês)
- Feedback visual claro para todas as ações do usuário

### 3.5 Compatibilidade
- Suporte aos principais navegadores (Chrome, Firefox, Safari, Edge)
- Funcionamento adequado em dispositivos iOS e Android
- Adaptação a diferentes tamanhos de tela e orientações

## 4. Arquitetura do Sistema

### 4.1 Front-end
- React 18 + TypeScript
- Vite para build e desenvolvimento
- TailwindCSS + Radix UI para componentes
- MapBox para visualização de mapas

### 4.2 Back-end
- Supabase para autenticação e banco de dados
- PostgreSQL para armazenamento de dados
- Edge Functions para processamento serverless
- Row Level Security (RLS) para segurança

### 4.3 Integrações
- MapBox API para mapas e geocodificação
- Resend API para envio de emails
- Webhooks para integração com serviços externos

## 5. Fluxos de Usuário

### 5.1 Registro e Onboarding
1. Usuário acessa a página de registro
2. Preenche dados básicos (nome, email, telefone)
3. Seleciona tipo de perfil (estudante ou responsável)
4. Recebe email de confirmação
5. Completa perfil com informações adicionais
6. Para estudantes: adiciona responsáveis
7. Para responsáveis: vincula-se a estudantes

### 5.2 Compartilhamento de Localização
1. Estudante acessa seu dashboard
2. Visualiza seu mapa de localização atual
3. Clica no botão "Compartilhar Localização"
4. Seleciona os responsáveis para compartilhar
5. Confirma o compartilhamento
6. Responsáveis recebem notificação por email

### 5.3 Visualização de Localização
1. Responsável acessa seu dashboard
2. Visualiza lista de estudantes vinculados
3. Seleciona um estudante para visualizar localização
4. Visualiza mapa com localização atual e histórico
5. Pode filtrar por data/hora ou obter detalhes específicos

## 6. Especificações Técnicas

### 6.1 Banco de Dados
- Tabelas principais:
  - `profiles`: Dados de perfil dos usuários
  - `guardians`: Relacionamento entre estudantes e responsáveis
  - `locations`: Histórico de localizações
  - `webhook_events`: Eventos de webhook recebidos
  - `auth_logs`: Logs de autenticação e ações críticas

### 6.2 APIs e Endpoints
- `/auth/*`: Endpoints de autenticação
- `/api/locations/*`: Gerenciamento de localizações
- `/api/guardians/*`: Gerenciamento de vínculos
- `/api/webhooks/*`: Recebimento e processamento de webhooks

### 6.3 Segurança e Permissões
- Políticas RLS para cada tabela
- Funções PostgreSQL para operações sensíveis
- Edge Functions para lógica de negócios complexa
- Logs de auditoria para ações críticas

## 7. Métricas e Análises

### 7.1 Métricas de Produto
- Número de usuários ativos diários/mensais
- Frequência de compartilhamento de localização
- Tempo médio de sessão por tipo de usuário
- Taxa de conversão de registro para uso ativo

### 7.2 Indicadores de Desempenho
- Tempo de carregamento de páginas
- Latência de operações de mapa
- Tempo de resposta de emails
- Taxa de sucesso de compartilhamento de localização

## 8. Roadmap e Priorização

### 8.1 MVP (Minimum Viable Product)
- Autenticação básica e perfis de usuário
- Compartilhamento manual de localização
- Visualização simples de mapa
- Vinculação estudante-responsável
- Emails de notificação básicos

### 8.2 Versão 1.0
- Dashboard completo para estudantes e responsáveis
- Histórico detalhado de localizações
- Melhorias de UI/UX para mobile
- Gerenciamento avançado de responsáveis/estudantes
- Webhook para integrações externas

### 8.3 Futuras Versões
- Delimitação geográfica (geofencing)
- Alertas automáticos de segurança
- Aplicativo móvel dedicado
- Integração com instituições de ensino
- Análise avançada de padrões de deslocamento

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos
- **Precisão de GPS**: Mitigação através de algoritmos de filtro e validação
- **Escalabilidade**: Arquitetura distribuída e monitoramento proativo
- **Tempo offline**: Mecanismos de cache e sincronização

### 9.2 Riscos de Segurança
- **Privacidade**: Controle granular de compartilhamento, termos claros
- **Acesso não autorizado**: Autenticação forte, RLS e auditoria contínua
- **Vulnerabilidades**: Testes de segurança regulares, atualizações de dependências

## 10. Apêndices

### 10.1 Glossário
- **Estudante**: Usuário cujas localizações são compartilhadas
- **Responsável**: Usuário que monitora as localizações dos estudantes
- **Vínculo**: Conexão aprovada entre estudante e responsável
- **Compartilhamento**: Ato de enviar localização atual aos responsáveis

### 10.2 Referências Técnicas
- Documentação do Supabase: https://supabase.com/docs
- API MapBox: https://docs.mapbox.com/
- Resend API: https://resend.com/docs

---

**Atualizado em:** 2025-05-06  
**Versão:** 1.0
