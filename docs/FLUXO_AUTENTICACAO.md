# Fluxo de Autenticação, Navegação e Contexto

## 1. Mapa de Navegação das Páginas

```
[Login] ──► [Dashboard]
   │             │
   │             ├─► [ParentDashboard] ──► [StudentInfoPanel] ──► [StudentLocationMap]
   │             │
   │             ├─► [StudentDashboard]
   │             │
   │             ├─► [GuardiansPage] ──► [GuardianManager] ──► [GuardianList]
   │             │
   │             ├─► [ProfilePage]
   │             │
   │             ├─► [AddStudentPage]
   │             │
   │             └─► [DiagnosticTool]
   │
   └─► [Register] ──► [RegisterConfirmation]
   │
   └─► [ForgotPassword]
   │
   └─► [NotFound]
```

---

## 2. Fluxograma do Processo de Autenticação

1. **Usuário acessa Login**
   - Preenche email/senha
   - Chama Supabase Auth (PKCE)
   - Se sucesso: recebe sessão, tokens, user_id

2. **UserContext/AuthContext**
   - Armazena sessão e dados do usuário
   - Busca perfil na tabela `profiles` (via Supabase)
   - Se perfil não existe ou está incompleto, pode redirecionar para cadastro/complemento

3. **Redirecionamento**
   - Se `user_type` = responsável: vai para `ParentDashboard`
   - Se `user_type` = estudante: vai para `StudentDashboard`
   - Se não identificado: pode ir para `ProfilePage` para completar dados

4. **Sessão Persistente**
   - Usa refresh token do Supabase
   - Contextos monitoram validade da sessão e atualizam UI

5. **Logout**
   - Limpa sessão nos contextos e Supabase
   - Redireciona para Login

---

## 3. Mapa de Contexto e Dependências

- **AuthContext**
  - Responsável por login, logout, checagem de sessão, integração com Supabase Auth.
  - Fornece métodos e estado para componentes filhos.

- **UserContext**
  - Carrega dados do perfil do usuário (tabela `profiles`).
  - Atualiza perfil se necessário (ex: email vazio).
  - Disponibiliza dados do usuário para toda a aplicação.

- **Serviços**
  - `studentService.ts`: Busca e atualiza perfis, trata erros, integra com Supabase.
  - `api-service.ts`: Comunicação genérica com backend.

- **Hooks**
  - `useStudentDetails`, `useGuardianData`: Consomem contextos e serviços para fornecer dados prontos para UI.

- **Componentes**
  - Consomem contextos e hooks para renderizar UI reativa ao estado de autenticação e perfil.

- **Integrações**
  - **Supabase**: Autenticação, banco de dados, RLS.
  - **MapBox**: Exibição de mapas e localização.

---

> Para um diagrama visual desse fluxo, solicite o formato desejado (Mermaid, Excalidraw, etc)! 