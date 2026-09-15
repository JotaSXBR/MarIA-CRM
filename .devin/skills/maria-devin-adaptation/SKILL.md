# MarIA CRM Devin Adaptation

Skill para adaptar operações do Devin ao contexto específico do MarIA CRM.

## Contexto

O MarIA CRM tem requisitos específicos que diferem de projetos padrão:
- Multi-tenant com RLS obrigatório
- Control Plane ≠ Execution Plane
- Durable agent execution
- Codex com agentes especializados
- AGPL-3.0-only license

## Diferenças Codex vs Devin

### Codex (Existentes)
- **explorer** (gpt-5.6-luna, read-only): Buscas e documentação
- **reviewer** (gpt-5.6-sol, read-only): Revisão crítica
- **worker** (gpt-5.6-terra, write): Implementação scoped

### Devin (Esta Skill)
Devin opera como agente generalista com as skills especializadas:
- `maria-dev-setup`: Setup e comandos de desenvolvimento
- `maria-database-rls`: Operações DB e RLS
- `maria-api-development`: Desenvolvimento de API
- `maria-testing`: Estratégia de testes

## Mapeamento de Responsabilidades

### O que Devin DEVE fazer
- Executar comandos pnpm/docker
- Editar código seguindo padrões do projeto
- Rodar testes e verificar resultados
- Criar skills e configurações para Devin
- Seguir AGENTS.md como contrato principal

### O que Devin NÃO deve fazer
- Ignorar invariantes de segurança do AGENTS.md
- Usar modelos que não sejam o default do Devin
- Criar subagentes sem justificativa clara
- Trabalhar diretamente em main branch
- Relaxar controles de segurança

## Adaptação de Padrões

### Subagentes
**Codex**: Usa 3 agentes especializados (explorer, reviewer, worker)
**Devin**: Usa skills especializadas + subagentes apenas quando necessário

Quando usar subagentes no Devin:
- Tarefas independentes que podem rodar em paralelo
- Exploração de código complexa que precisa de contexto isolado
- Revisão crítica de mudanças de segurança

### Model Routing
**Codex**: Configurado com modelos específicos por agente
**Devin**: Usa modelo default do sistema, respeitando restrições

Não tentar mudar modelos - use o modelo padrão do Devin.

### Sandbox Mode
**Codex**: `workspace-write` ou `read-only` por agente
**Devin**: Sandbox é controlado pelo sistema, não pela skill

Siga os mesmos princípios:
- Read-only para exploração e revisão
- Write para implementação com escopo claro

## Eliminação de Incompatibilidades

### Remover do Contexto
1. **Codex-specific configs**: `.codex/` é específico para Codex CLI
2. **Model-specific instructions**: Devin usa seu próprio modelo
3. **Agent spawn logic**: Devin tem seu próprio sistema de subagentes
4. **Billing/cost concerns**: Não relevante para operação do Devin

### Manter
1. **AGENTS.md**: Contrato principal de engenharia
2. **ARCHITECTURE.md**: Arquitetura do sistema
3. **HANDOFF.md**: Checkpoint de desenvolvimento
4. **Stack versionada**: Node 24.21.0, pnpm 11.26.0, etc.
5. **Invariantes de segurança**: RLS, tenant isolation, etc.

## Fluxo de Trabalho Sugerido

### Para Tarefas Simples
1. Invocar skill relevante (ex: `maria-api-development`)
2. Ler documentação da skill
3. Executar tarefa seguindo padrões
4. Rodar testes relevantes
5. Verificar com `pnpm verify`

### Para Tarefas Complexas
1. Ler AGENTS.md para entender invariantes
2. Usar `maria-dev-setup` para verificar ambiente
3. Invocar skills relevantes em paralelo
4. Implementar mudanças de forma incremental
5. Rodar testes específicos antes de `pnpm verify`
6. Usar subagentes para exploração paralela se justificado

### Para Code Review
1. Ler diff completo
2. Invocar `maria-testing` para verificar testes
3. Invocar `maria-database-rls` para mudanças de DB
4. Verificar invariantes de segurança
5. Rodar `pnpm verify` completo

## Regras Específicas para Devin

### 1. Segurança Primeiro
- Antes de qualquer mudança, verificar impactos em RLS/tenancy
- Mudanças em auth/authz requerem verificação extra
- Novos tools MCP precisam de aprovação humana

### 2. Commands
- Preferir comandos pnpm sobre comandos diretos (npm, node)
- Usar Docker Compose para DB local, não instalação direta
- Nunca usar `drizzle-kit push` em staging/production

### 3. Git
- Nunca trabalhar em main
- Criar branches para features
- Commits devem seguir padrão do projeto
- PRs precisam de evidence (testes, risks, assumptions)

### 4. Dependencies
- Adicionar apenas quando necessário
- Preferir versões publicadas há pelo menos 7 dias
- Usar pnpm add em vez de editar package.json manualmente
- Verificar licenças e security

### 5. Testing
- Todo novo recurso precisa de testes
- Tenant-owned features precisam de cross-tenant tests
- Integration tests usam Testcontainers, não mocks
- Rodar `pnpm verify` antes de considerar completo

## Próximos Passos de Desenvolvimento

### Phase 0 (Atual)
1. ✅ Database foundation com RLS
2. ✅ API Fastify básica
3. ✅ Web app React básico
4. ⏳ Autenticação e autorização
5. ⏳ CRUD completo de contacts
6. ⏳ Web CRM flows

### Order Sugerida
1. Autenticação (WorkOS AuthKit)
2. Runtime role provisioning
3. Membership authorization
4. Contacts CRUD completo
5. Companies CRUD
6. Web UI para contacts/companies
7. Pipelines e deals
8. Channels e messaging
9. Agent runtime

## References

- `AGENTS.md`: Contrato principal (NORMATIVE)
- `ARCHITECTURE.md`: Arquitetura do sistema
- `HANDOFF.md`: Checkpoint atual
- `README.md`: Visão geral
- Skills específicas: `maria-dev-setup`, `maria-database-rls`, `maria-api-development`, `maria-testing`
