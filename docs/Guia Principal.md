# 📚 Guia Completo de Desenvolvimento do Locate-Family-Connect

## 🎯 Missão e Objetivos do Projeto

### Missão
Conectar responsáveis e estudantes através de um sistema seguro de compartilhamento de localização e notificações, proporcionando tranquilidade aos responsáveis e autonomia aos estudantes.

### Objetivos Principais
- Facilitar o compartilhamento de localização em tempo real entre estudantes e seus responsáveis
- Garantir a segurança e privacidade dos dados pessoais e de localização
- Oferecer uma experiência de usuário intuitiva e responsiva em dispositivos móveis e desktop
- Manter um sistema de autenticação robusto com diferentes níveis de acesso

## 👥 Papéis de Usuário

### 1. Estudante
- **Acesso ao:** Dashboard de estudante, mapa de localização, gerenciamento de responsáveis
- **Funcionalidades:**
  - Compartilhar localização atual com responsáveis
  - Visualizar histórico de localizações compartilhadas
  - Gerenciar lista de responsáveis (adicionar/remover)
  - Configurar preferências de compartilhamento

### 2. Responsável (Guardian)
- **Acesso ao:** Dashboard de responsável, mapa com localização dos estudantes
- **Funcionalidades:**
  - Visualizar localização atual e histórico dos estudantes vinculados
  - Receber notificações por email de novas localizações compartilhadas
  - Gerenciar perfil e preferências de notificação

### 3. Desenvolvedor (Papel administrativo)
- **Acesso ao:** Dashboard completo, ferramentas de diagnóstico, configurações avançadas
- **Funcionalidades:**
  - Monitorar logs e status do sistema
  - Testar integrações (Resend, Mapbox)
  - Realizar operações de diagnóstico e manutenção

## 🛠️ Stack Tecnológica e Recursos Necessários

### Frontend
- **Framework:** React + TypeScript + Vite
- **UI Components:** Componentes personalizados + Radix UI
- **Estilização:** TailwindCSS
- **Estado:** Context API para estados globais (auth, user)
- **Testes:** Cypress para E2E, Jest para testes unitários

### Backend
- **Plataforma:** Supabase (https://rsvjnndhbyyxktbczlnk.supabase.co)
- **Autenticação:** Supabase Auth com fluxo PKCE
- **Banco de Dados:** PostgreSQL via Supabase
- **Edge Functions:** Para operações assíncronas (compartilhamento via email)
- **Políticas RLS:** Para controle granular de acesso aos dados

### Integrações Externas
- **Mapas:** MapBox para visualização e compartilhamento de localização
- **Email:** Resend API (domínio: sistema-monitore.com.br)
  - **API Key Principal:** `re_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu`
  - **Email Padrão:** notificacoes@sistema-monitore.com.br

### Recursos de Desenvolvimento Necessários
- Conta Supabase com acesso ao projeto `rsvjnndhbyyxktbczlnk`
- Chave API do Resend verificada
- Chave API do MapBox
- Ambiente Node.js (v16+)
- Git para controle de versão

## 📱 Dashboards e Funcionalidades Principais

### Dashboard do Estudante
- Mapa interativo para visualizar e compartilhar localização
- Gerenciador de responsáveis (adicionar, editar, remover)
- Histórico de localizações compartilhadas
- Configurações de preferências de compartilhamento

### Dashboard do Responsável
- Visualização de localização atual dos estudantes vinculados
- Histórico de localizações recebidas
- Notificações de compartilhamento
- Perfil e configurações pessoais

### Ferramentas de Diagnóstico (Desenvolvedor)
- Interface para testar envio de emails
- Visualização de logs do sistema
- Testes de conexão com Supabase
- Configuração avançada de serviços

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
1. **auth.users**
   - Tabela nativa do Supabase Auth
   - Campos estendidos: `user_type`, `phone`

2. **public.profiles**
   - `id`: UUID (referência a auth.users)
   - `full_name`: Nome completo
   - `phone`: Telefone (opcional)
   - `user_type`: Tipo de usuário (student, parent, developer)

3. **public.guardians**
   - `id`: UUID gerado automaticamente
   - `student_id`: ID do estudante (referência a auth.users)
   - `email`: Email do responsável
   - `phone`: Telefone (opcional)
   - `is_active`: Status da relação

4. **public.locations**
   - Armazena dados de localização (coordenadas, timestamp)
   - `shared_with_guardians`: Flag para compartilhamento
   - Dados de endereço (quando disponíveis)

5. **public.auth_logs**
   - Tabela para diagnóstico e auditoria

### Funções SQL Críticas
- `handle_new_user()`: Trigger para criação de perfil após cadastro
- `save_student_location()`: Salva localização com segurança
- `get_student_locations_for_guardian()`: Acesso seguro às localizações
- `get_student_guardians_secure()`: Acesso à lista de responsáveis

### Políticas RLS (Row Level Security)
- Garantem que estudantes só acessem seus próprios dados
- Permitem que responsáveis vejam apenas estudantes vinculados
- Protegem dados sensíveis de localização

## 🗺️ Integração com Mapas

### Funcionalidades
- Visualização de localização atual em mapa interativo
- Histórico de localizações com marcadores no mapa
- Compartilhamento de localização com precisão ajustável
- Geocodificação inversa para mostrar endereços

### Implementação
- MapBox como provedor principal de mapas
- Componentes React customizados para interação
- Armazenamento de coordenadas e metadados no banco

## 📧 Sistema de Email

### Funcionalidades
- Notificações de compartilhamento de localização
- Emails de recuperação de senha
- Convites para novos responsáveis

### Implementação
- Resend API para envio de emails
- Templates HTML responsivos
- Edge Function `share-location` para processamento assíncrono
- Domínio verificado: sistema-monitore.com.br

## 📊 Casos de Uso Principais

1. **Compartilhamento de Localização**
   - Estudante compartilha localização atual
   - Sistema envia email para responsáveis
   - Responsáveis visualizam no mapa

2. **Gerenciamento de Responsáveis**
   - Estudante adiciona novo responsável
   - Sistema registra relação no banco
   - Responsável recebe acesso às localizações

3. **Recuperação de Senha**
   - Usuário solicita redefinição
   - Email enviado com token seguro
   - Redefinição com validação de token

4. **Monitoramento de Localização**
   - Responsável acessa dashboard
   - Visualiza última localização dos estudantes
   - Acessa histórico de compartilhamentos

## 📱 Responsividade

### Requisitos
- Interface totalmente adaptativa (mobile-first)
- Suporte a interações touch e gestos em mapas
- Otimização para telas pequenas e dispositivos móveis
- Carregamento eficiente em conexões lentas

### Implementação
- TailwindCSS para design responsivo
- Componentes específicos para mobile (MobileNavigation)
- Detection de dispositivo via hooks customizados (use-mobile)
- Estratégias de cache para melhor performance

## 👨‍💻 Equipe e Responsabilidades

### Composição Ideal
1. **Desenvolvedor Frontend Sênior**
   - Responsável por: Componentes React, estados, UI/UX
   - Foco em: Experiência de usuário, responsividade, performance

2. **Engenheiro Backend/Supabase**
   - Responsável por: Banco de dados, políticas RLS, Edge Functions
   - Foco em: Segurança, integridade de dados, escalabilidade

3. **Especialista em Autenticação e Segurança**
   - Responsável por: Fluxos de autenticação, recuperação de senha
   - Foco em: PKCE, tokens, proteção de dados sensíveis

4. **Especialista em Geolocalização**
   - Responsável por: Integração com MapBox, algoritmos de localização
   - Foco em: Precisão, performance, experiência de mapa

5. **Engenheiro de QA/Testes**
   - Responsável por: Testes E2E, unitários, casos de borda
   - Foco em: Qualidade, confiabilidade, prevenção de regressões

6. **DevOps**
   - Responsável por: Automação, CI/CD, monitoramento
   - Foco em: Deployment seguro, logs, diagnóstico de problemas

## ⚠️ Pontos Críticos de Atenção

1. **Autenticação**
   - UnifiedAuthContext.tsx precisa de refatoração
   - Separar fluxos por tipo de usuário
   - Garantir tratamento de todos os estados

2. **Configuração do Resend**
   - Padronizar com uma única API key
   - Verificar status real do domínio
   - Testar envio de emails regularmente

3. **Políticas RLS**
   - Revisar todas as políticas de acesso
   - Garantir que estudantes possam ver seus responsáveis
   - Usar funções RPC para operações sensíveis

4. **Edge Functions**
   - Melhorar tratamento de erros
   - Garantir logs detalhados
   - Testar com cenários reais

5. **Testes Cypress**
   - Atualizar seletores e mocks
   - Garantir alinhamento com implementação real
   - Priorizar fluxos críticos

## 📝 Procedimentos de Desenvolvimento

### Ambiente de Desenvolvimento
1. Clone o repositório
2. Configure .env com chaves necessárias
3. Execute `npm install` para dependências
4. Rode scripts de diagnóstico para validar conexões

### Fluxo de Git
```bash
git status
git add -A
git commit -m "mensagem detalhada [tipo: fix/feature/docs]"
git push
```

### Processo de Mudanças no Banco
1. Criar migration SQL em `/src/lib/db/migrations/`
2. Aplicar via Supabase MCP: `mcp2_apply_migration`
3. Documentar mudanças em `/docs/`
4. Testar impacto em todas as funcionalidades

### Diagnóstico de Problemas
1. Verificar logs do console
2. Executar scripts de teste em `/scripts/`
3. Consultar documentação em `/docs/`
4. Verificar componentes críticos (`UnifiedAuthContext.tsx`, Edge Functions)

## 🚀 Próximos Passos Recomendados

1. **Estabilização**
   - Corrigir problemas críticos de autenticação
   - Padronizar integração com Resend
   - Resolver permissões na tabela guardians

2. **Refatoração**
   - Separar contextos de autenticação por perfil
   - Centralizar serviços e integrações
   - Melhorar tratamento de erros

3. **Testes**
   - Atualizar testes Cypress
   - Aumentar cobertura de testes unitários
   - Documentar casos de teste

4. **Documentação**
   - Consolidar documentação técnica
   - Criar guias de usuário por perfil
   - Documentar procedimentos de manutenção

---

Este guia representa uma síntese das melhores práticas e conhecimento documentado sobre o projeto Locate-Family-Connect. Siga estas diretrizes para garantir continuidade, segurança e evolução sustentável do sistema.
