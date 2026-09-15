# MarIA CRM Development Setup

Skill para configurar e manter o ambiente de desenvolvimento do MarIA CRM.

## Quando usar

Use esta skill quando:
- Configurando o ambiente de desenvolvimento pela primeira vez
- Precisando verificar se o ambiente está configurado corretamente
- Executando comandos de desenvolvimento e verificação
- Configurando banco de dados local com Docker

## Comandos Principais

### Setup Inicial
```bash
# Verificar Node.js version
node --version  # Deve ser 24.21.x

# Verificar pnpm version
pnpm --version  # Deve ser 11.26.0

# Instalar dependências
pnpm install

# Formatar código
pnpm fmt

# Executar verificação completa
pnpm verify
```

### Desenvolvimento
```bash
# Iniciar dev servers (API:3000, Web:5173)
pnpm dev

# Executar verificação individual
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration  # Requer Docker
pnpm test:e2e
pnpm build
```

### Banco de Dados Local
```bash
# Iniciar PostgreSQL local
docker compose -f docker/compose.yaml up -d --wait

# Acessar psql
docker compose -f docker/compose.yaml exec postgres psql -U maria_admin -d maria

# Parar PostgreSQL
docker compose -f docker/compose.yaml down
```

## Requisitos

- Node.js 24.21.0 LTS (usar nvm use se necessário)
- pnpm 11.26.0 (via Corepack)
- Docker Desktop (para testes de integração)
- Docker Desktop WSL integration habilitado (no Windows)

## Stack Versionada

Todas as dependências são versionadas explicitamente:
- TypeScript 7.0.x (strict mode)
- Fastify 5.x
- React 19.2.x
- Vite 8.2.x
- Drizzle ORM 0.45.2
- PostgreSQL 18.6
- Oxlint type-aware
- Prettier 3.9.0

## Arquitetura de Monorepo

- **apps/api**: Fastify REST API
- **apps/web**: React + Vite SPA
- **packages/database**: Drizzle ORM + RLS
- **[futuros]**: auth, contracts, domain, ai-gateway, agent-runtime, messaging, etc.

## Regras Importantes

1. Nunca trabalhar diretamente em `main`
2. Sempre rodar `pnpm verify` antes de commitar
3. Seguir os invariantes de segurança definidos em AGENTS.md
4. Preservar RLS e transaction cleanup
5. Usar `withWorkspace()` para operações scoped
6. Testes de integração requerem Docker

## Troubleshooting

### Formatação
```bash
pnpm fmt  # Formata automaticamente
```

### Type errors
```bash
pnpm typecheck  # Verifica TypeScript strict
```

### Integration tests falhando
- Verificar se Docker Desktop está rodando
- Verificar WSL integration (Windows)
- Verificar se não há portas conflitantes

### Build falhando
```bash
pnpm clean  # Limpa caches do Turbo
pnpm build  # Rebuild
```

## References

- `AGENTS.md`: Contrato de engenharia e segurança
- `ARCHITECTURE.md`: Arquitetura do sistema
- `HANDOFF.md`: Checkpoint de desenvolvimento atual
- `README.md`: Visão geral do projeto
