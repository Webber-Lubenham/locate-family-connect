# Relatório de Integração Mobile/Web - Locate-Family-Connect

**Data:** 06/05/2025  
**Versão:** 1.0  
**Autor:** Equipe de Desenvolvimento

## 1. Visão Geral

Este documento descreve como o aplicativo mobile "Monitor" (MVP) integrará com a plataforma web "Sistema Monitore", utilizando a mesma infraestrutura Supabase e mantendo total compatibilidade de dados e funcionalidades.

## 2. Arquitetura de Integração

### 2.1 Modelo de Integração

A integração entre as plataformas segue o modelo **"Backend Compartilhado, Frontend Especializado"**, no qual:

- **Backend Compartilhado**: Ambas as plataformas utilizam o mesmo projeto Supabase (`rsvjnndhbyyxktbczlnk`), incluindo banco de dados PostgreSQL, autenticação, políticas RLS e Edge Functions.
  
- **Frontend Especializado**: 
  - Web: React + TypeScript + TailwindCSS (SPA)
  - Mobile: React Native + Expo (aplicativo nativo)

### 2.2 Diagrama de Componentes

```
├── Infraestrutura Supabase (Compartilhada)
│   ├── Autenticação PKCE
│   ├── Banco de Dados PostgreSQL
│   ├── Edge Functions 
│   │   └── share-location
│   └── Row Level Security (RLS)
│
├── Aplicativo Web "Sistema Monitore"
│   ├── Autenticação (UnifiedAuthContext)
│   ├── Dashboards por perfil
│   └── Integração com MapBox (web)
│
└── Aplicativo Mobile "Monitor" 
    ├── Autenticação (AuthContext)
    ├── Dashboards nativos por perfil
    ├── Acesso a GPS nativo
    └── Mapas nativos (react-native-maps)
```

## 3. Compartilhamento de Dados

### 3.1 Modelo de Dados Compartilhado

Ambas as plataformas compartilham as mesmas tabelas:

- `profiles`: Dados de perfil do usuário
- `guardians`: Relações entre estudantes e responsáveis
- `locations`: Histórico de localizações
- `auth_logs`: Logs de autenticação e diagnóstico

### 3.2 Sincronização de Dados

- **Tempo Real**: Alterações no banco de dados são imediatamente refletidas em ambas as plataformas
- **Cache Offline (Mobile)**: O app mobile implementa cache local via AsyncStorage para operações offline
- **Resolução de Conflitos**: Timestamps são usados para determinar a versão mais recente dos dados

## 4. Fluxos de Autenticação

### 4.1 Autenticação Unificada

Ambas as plataformas implementam o fluxo PKCE do Supabase Auth:

1. Web: Gerenciado pelo `UnifiedAuthContext.tsx`
2. Mobile: Gerenciado pelo `AuthContext.tsx` com suporte para AsyncStorage

### 4.2 Sessões Compartilhadas

- As sessões são gerenciadas independentemente em cada plataforma
- Os tokens JWT gerados são universais e funcionam em todos os endpoints
- Perfis de usuário (student/parent) são reconhecidos de forma idêntica

## 5. Funcionalidades Principais

### 5.1 Compartilhamento de Localização

**Web**:
- Usa `navigator.geolocation` do browser
- Compartilha via função `save_student_location` e aciona Edge Function

**Mobile**:
- Usa `expo-location` para acesso nativo ao GPS
- Maior precisão através de API nativa
- Compartilha usando a mesma função RPC `save_student_location`
- Invoca a mesma Edge Function para envio de emails

### 5.2 Visualização de Mapa

**Web**:
- Mapbox para visualização
- Carregamento de tiles via web

**Mobile**:
- `react-native-maps` integrado com Google Maps
- Renderização nativa para melhor performance
- Mesmo modelo de dados de localização

## 6. Aspectos Técnicos

### 6.1 Credenciais Compartilhadas

```
SUPABASE_URL=https://rsvjnndhbyyxktbczlnk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...truncado...L0T4
```

Estas credenciais são usadas em ambos os projetos para garantir acesso à mesma infraestrutura.

### 6.2 Diferenças de Implementação

| Aspecto | Web | Mobile |
|---------|-----|--------|
| Armazenamento | localStorage | AsyncStorage |
| Geolocalização | navigator.geolocation | expo-location |
| Mapas | MapBox JS SDK | react-native-maps |
| UI | TailwindCSS + Radix | React Native StyleSheet |
| Notificações | Web Push API (futuro) | Push Notifications (futuro) |

### 6.3 Segurança Compartilhada

As mesmas políticas RLS protegem os dados em ambas as plataformas:

- Autenticação obrigatória para operações
- Guardians só podem ver localizações compartilhadas
- Estudantes só podem compartilhar suas próprias localizações

## 7. Integração com Serviços Externos

### 7.1 Resend API

Ambas as plataformas utilizam o Resend para envio de emails:

- Domínio: `sistema-monitore.com.br`
- Chave da API centralizada na Edge Function `share-location`
- Emails de compartilhamento seguem o mesmo template

## 8. Plano de Evolução

### 8.1 Fase 1 (MVP atual)
- ✅ Autenticação PKCE
- ✅ Compartilhamento e visualização de localização
- ✅ Compatibilidade com banco de dados

### 8.2 Fase 2 (Próxima versão)
- Notificações push para alertas em tempo real
- Geofencing nativo para áreas seguras
- Modo offline robusto com sincronização

### 8.3 Fase 3 (Futuro)
- Comunicação em tempo real entre responsáveis e estudantes
- Rastreamento em background
- Integração com serviços de emergência

## 9. Conclusão

A integração entre o aplicativo mobile "Monitor" e o "Sistema Monitore" web foi projetada para maximizar a reutilização de infraestrutura e garantir consistência de dados e funcionalidades. Esta abordagem permite:

1. Desenvolvimento paralelo sem duplicação de lógica de negócios
2. Experiência do usuário especializada para cada plataforma
3. Manutenção simplificada com uma única fonte de verdade (Supabase)
4. Segurança consistente através de políticas RLS compartilhadas

Esta estratégia de integração fornece uma base sólida para evolução contínua do ecossistema Locate-Family-Connect, garantindo escalabilidade e facilidade de manutenção.
