# MarIA CRM Testing Strategy

Skill para estratégia de testes no MarIA CRM.

## Quando usar

Use esta skill quando:
- Escrevendo testes unitários
- Criando testes de integração
- Implementando testes E2E
- Debugging test failures
- Configurando Testcontainers
- Escrevendo testes de RLS/tenant isolation

## Stack de Testes

- **Vitest 5** - Runner de testes
- **Testcontainers** - Integração com Docker (PostgreSQL)
- **Playwright** - Browser automation (quando implementado)

## Tipos de Testes

### Unit Tests
**Scope**: Funções/pure logic sem dependências externas
**Location**: `package/test/*.test.ts`
**Execution**: `pnpm test`

```typescript
// packages/database/test/database.test.ts
test("validates UUID format", () => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(uuid.test("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
});
```

### Integration Tests
**Scope**: Integração com dependências reais (DB, APIs)
**Location**: `package/test/*.integration.test.ts`
**Execution**: `pnpm test:integration`
**Requirements**: Docker Desktop rodando

```typescript
// packages/database/test/rls.integration.test.ts
import { PostgreSqlContainer } from "@testcontainers/postgresql";

test("RLS isolates workspaces", async () => {
  const container = await new PostgreSqlContainer(image).start();
  // Setup database com admin role
  // Testar com runtime role (sem BYPASSRLS)
  // Verificar isolamento entre workspaces
  await container.stop();
});
```

### E2E Tests
**Scope**: Sistema completo sobre HTTP/Docker
**Location**: `apps/api/test/*.e2e.test.ts`
**Execution**: `pnpm test:e2e`
**Requirements**: Build completo + dependencies

```typescript
// apps/api/test/server.e2e.test.ts
test("built server responds over HTTP", async () => {
  const app = buildApp();
  const address = await app.listen({ port: 0 });
  const response = await fetch(`${address}/health`);
  expect(await response.json()).toEqual({ status: "ok" });
  await app.close();
});
```

## Padrões de Teste

### Testcontainers Setup
```typescript
const image = "postgres:18.6-bookworm@sha256:digest";
let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer(image).start();
  // Setup schema, roles, test data
}, 120000); // Timeout maior para containers

afterAll(async () => {
  await container?.stop();
}, 30000);
```

### RLS Testing Pattern
```typescript
test("tenant isolation enforced", async () => {
  // 1. Setup dados em workspace A e B
  await admin.query("INSERT INTO contacts (workspace_id, name) VALUES ($1, 'A')", [workspaceA]);
  await admin.query("INSERT INTO contacts (workspace_id, name) VALUES ($1, 'B')", [workspaceB]);
  
  // 2. Testar acesso com runtime role
  const contactsA = await database.listContacts(workspaceA);
  expect(contactsA).toHaveLength(1);
  expect(contactsA[0].name).toBe("A");
  
  // 3. Testar cross-tenant rejection
  await expect(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(sql`UPDATE contacts SET workspace_id = ${workspaceB}`)
    )
  ).rejects.toMatchObject({ cause: { code: "42501" } }); // permission denied
});
```

### Transaction Cleanup Test
```typescript
test("context does not leak on pooled connection", async () => {
  await database.withWorkspace(workspaceA, async (tx) => {
    await tx.execute(sql`INSERT INTO contacts (workspace_id, name) VALUES ($1, 'Test')`, [workspaceA]);
    throw new Error("rollback");
  });
  
  // Verificar que context foi limpo
  const setting = await runtime.query(
    "SELECT current_setting('app.workspace_id', true) as workspace_id"
  );
  expect(setting.rows[0].workspace_id).toBe("");
  
  // Verificar que rollback funcionou
  const count = await runtime.query("SELECT COUNT(*) FROM contacts");
  expect(count.rows[0].count).toBe("0");
});
```

## Command Gates

### Pre-PR Verification
```bash
pnpm verify  # Executa todos os gates
```

### Individual Gates
```bash
pnpm test              # Unit tests
pnpm test:integration  # Integration tests (requer Docker)
pnpm test:e2e          # E2E tests
```

## Debugging Test Failures

### Integration Tests
1. Verificar Docker Desktop está rodando
2. Verificar WSL integration (Windows)
3. Verificar portas não estão em uso
4. Aumentar timeout se necessário

### RLS Tests
1. Verificar role não tem BYPASSRLS
2. Verificar FORCE ROW LEVEL SECURITY está ativo
3. Verificar policies estão criadas
4. Verificar context está sendo setado com SET LOCAL

### E2E Tests
1. Verificar build passou
2. Verificar portas não estão em uso
3. Verificar graceful shutdown funciona

## Test Organization

```
packages/database/
├── test/
│   ├── database.test.ts           # Unit tests
│   └── rls.integration.test.ts    # Integration tests (RLS)

apps/api/
├── test/
│   ├── config.test.ts             # Unit tests
│   ├── health.integration.test.ts # Integration tests
│   └── server.e2e.test.ts         # E2E tests

apps/web/
├── test/
│   └── app.test.tsx               # Unit tests (React)
```

## Regras Importantes

1. **Todo novo recurso tenant-owned** requer cross-tenant negative tests
2. **Integração com DB** usa Testcontainers, nunca mocks
3. **RLS** deve ser testado com runtime role real (sem BYPASSRLS)
4. **Transaction cleanup** deve ser verificado
5. **E2E tests** testam sistema completo, não unidades isoladas
6. **Timeouts** devem ser ajustados para operations lentas (containers)

## Performance

- Testcontainers pode ser lento (startup de container)
- Considerar reuse de containers quando possível
- Paralelizar testes independentes
- Usar cache do Turbo para testes determinísticos

## References

- `packages/database/test/rls.integration.test.ts`: Exemplo completo de RLS testing
- `apps/api/test/server.e2e.test.ts`: Exemplo de E2E testing
- `AGENTS.md §3`: Definition of Done (testes são obrigatórios)
