# Plano de Implementação do Docker para Locate-Family-Connect

## 1. Objetivos
- Padronizar o ambiente de desenvolvimento
- Facilitar o setup inicial para novos desenvolvedores
- Garantir consistência entre ambientes (dev, staging, prod)
- Simplificar o deploy da aplicação

## 2. Arquitetura Proposta

### 2.1 Serviços a serem Containerizados
1. Frontend React
2. Supabase Local (para desenvolvimento)
3. Redis (cache opcional)

### 2.2 Estrutura de Arquivos
```
docker/
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── supabase/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docker-compose.yml
```

## 3. Implementação Passo a Passo

### 3.1 Frontend
1. Criar Dockerfile para o frontend
   - Baseado em node:18-alpine
   - Instalar dependências com pnpm
   - Configurar build com Vite
   - Expor porta 3000

2. Configurar variáveis de ambiente
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_MAPBOX_TOKEN
   - VITE_RESEND_API_KEY

### 3.2 Supabase Local
1. Usar imagem oficial do Supabase
2. Configurar volumes para persistência
3. Configurar variáveis de ambiente
   - DB_PASSWORD
   - JWT_SECRET
   - AUTH_JWT_SECRET

### 3.3 Redis (Opcional)
1. Usar imagem oficial do Redis
2. Configurar volume para persistência
3. Configurar rede Docker

## 4. Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./docker/frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=http://supabase:54321
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - VITE_MAPBOX_TOKEN=${MAPBOX_TOKEN}
      - VITE_RESEND_API_KEY=${RESEND_API_KEY}
    depends_on:
      - supabase

  supabase:
    image: supabase/supabase
    ports:
      - "54321:54321"  # Database
      - "54322:54322"  # Realtime
      - "54323:54323"  # Auth
      - "54324:54324"  # Storage
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_JWT_SECRET=${AUTH_JWT_SECRET}
    volumes:
      - supabase_data:/var/lib/postgresql/data
      - supabase_config:/var/lib/supabase/config

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  supabase_data:
  supabase_config:
  redis_data:
```

## 5. Configuração de Ambiente

### 5.1 Arquivo .env
```env
# Frontend
VITE_SUPABASE_URL=http://supabase:54321
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_RESEND_API_KEY=your_resend_key

# Supabase
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
AUTH_JWT_SECRET=your_auth_jwt_secret
```

## 6. Comandos Úteis

```bash
# Build e iniciar todos os serviços
docker-compose up --build

# Build e iniciar em modo detached
docker-compose up --build -d

# Parar todos os serviços
docker-compose down

# Remover volumes
docker-compose down -v

# Ver logs
docker-compose logs -f

# Entrar no container do frontend
docker-compose exec frontend sh
```

## 7. Considerações de Segurança
1. Nunca commitar arquivos .env com credenciais
2. Usar variáveis de ambiente para configuração sensível
3. Configurar volumes para persistência de dados
4. Usar rede Docker isolada

## 8. Próximos Passos
1. Implementar Dockerfile para frontend
2. Configurar docker-compose.yml
3. Testar ambiente local
4. Documentar setup completo
5. Implementar CI/CD com Docker

## 9. Benefícios Esperados
- Ambiente de desenvolvimento consistente
- Setup mais rápido para novos desenvolvedores
- Facilidade de testes locais
- Simplificação do deploy
- Isolamento de dependências
- Melhor controle de versões

## 10. Cronograma Sugerido
1. Semana 1: Implementação do Dockerfile e docker-compose
2. Semana 2: Testes locais e ajustes
3. Semana 3: Documentação e CI/CD
4. Semana 4: Deploy e monitoramento

## 11. Recursos Necessários
- Docker e Docker Compose instalados
- Espaço em disco para volumes
- Conhecimento básico de Docker
- Acesso aos serviços externos (Mapbox, Resend, etc.)
