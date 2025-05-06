# Locate-Family-Connect Mobile (MVP)

Este é o MVP (Produto Mínimo Viável) da versão mobile do Locate-Family-Connect, focado nas funcionalidades essenciais de autenticação e compartilhamento de localização.

## Estrutura

A estrutura do projeto mobile segue o mesmo padrão do projeto web, com adaptações específicas para React Native:

```
mobile/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contexts do React (autenticação, etc.)
│   ├── hooks/          # Hooks personalizados (principalmente useLocationSharing)
│   ├── lib/            # Bibliotecas e utilitários (configuração do Supabase)
│   ├── screens/        # Telas do aplicativo
│   └── utils/          # Funções utilitárias
├── App.tsx             # Ponto de entrada do aplicativo
└── package.json        # Dependências do projeto
```

## Pré-requisitos

1. Node.js 16+ e npm/yarn
2. Expo CLI (`npm install -g expo-cli`)
3. Um dispositivo físico com Expo Go ou um emulador Android/iOS

## Instalação e Configuração

Para configurar o ambiente de desenvolvimento e completar o MVP, siga estas etapas:

### 1. Iniciar um projeto Expo

```bash
# Na raiz do projeto Locate-Family-Connect
npx create-expo-app -t blank-typescript mobile-app

# Mover os arquivos para a estrutura correta
cp -r mobile/* mobile-app/
cd mobile-app
```

### 2. Instalar dependências necessárias

```bash
npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage
npm install react-native-maps
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install expo-location
npm install react-native-dotenv
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto mobile:

```
EXPO_PUBLIC_SUPABASE_URL=https://rsvjnndhbyyxktbczlnk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4
```

### 4. Criar o arquivo App.tsx principal

Crie um arquivo `App.tsx` na raiz do projeto:

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

// Contextos
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Telas
import LoginScreen from './src/screens/LoginScreen';
import StudentDashboard from './src/screens/StudentDashboard';
// Adicionar GuardianDashboard mais tarde

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, loading, userType } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userType === 'student' ? (
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        ) : (
          // Placeholder para dashboard de responsável - a ser implementado em versão futura
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

## Testes em Desenvolvimento

Para testar o MVP, execute:

```bash
npx expo start
```

Isso iniciará o servidor de desenvolvimento Expo. Você pode então:

1. Escanear o QR code com o aplicativo Expo Go no seu dispositivo Android/iOS
2. Pressionar 'a' para abrir no emulador Android (se configurado)
3. Pressionar 'i' para abrir no simulador iOS (se estiver no macOS)

## Próximos Passos

Após o MVP, expanda o aplicativo com:

1. **Dashboard para Responsáveis**: Implementar visualização de localizações compartilhadas
2. **Notificações Push**: Para alertas de compartilhamento
3. **Modo Offline**: Melhorar o gerenciamento de dados offline e sincronização
4. **Geofencing**: Adicionar zonas seguras e alertas de entrada/saída

## Integração com o Projeto Web

Esta versão mobile utiliza:

1. A mesma base de dados Supabase do projeto web
2. As mesmas funções RPC PostgreSQL para operações críticas
3. A mesma Edge Function `share-location` para envio de emails
4. As mesmas políticas RLS para segurança

Isso garante consistência entre as plataformas e reduz duplicação de código de backend.
