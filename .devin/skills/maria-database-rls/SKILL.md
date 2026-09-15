# MarIA CRM Database & RLS Operations

Skill para operações de banco de dados e Row Level Security (RLS) do MarIA CRM.

## Quando usar

Use esta skill quando:

- Criando ou modificando schemas Drizzle
- Escrevendo migrations SQL
- Implementando operações com `withWorkspace()`
- Testando RLS e tenant isolation
- Trabalhando com transactions scoped

## Padrões RLS Críticos

### Workspace-Scoped Transactions

```typescript
// SEMPRE usar withWorkspace para operações tenant-scoped
const result = await database.withWorkspace(workspaceId, async (tx) => {
  // tx está automaticamente scoped pelo workspace_id
  return tx.select().from(contacts);
});
```

### Regras RLS

- Toda tabela tenant-owned usa PostgreSQL RLS
- `workspace_id` é o boundary canônico
- `FORCE ROW LEVEL SECURITY` é obrigatório
- Runtime roles NUNCA têm `BYPASSRLS`
- Context é setado apenas dentro de transactions com `SET LOCAL`

### Validation Pattern

```typescript
// withWorkspace valida automaticamente:
// 1. workspaceId é UUID válido
// 2. Role não é superuser
// 3. Role não tem BYPASSRLS
// 4. Context é transaction-local (SET LOCAL)
```

## Operações Database

### Schema Changes

1. Modificar `packages/database/src/schema.ts`
2. Gerar migration com Drizzle Kit (quando configurado)
3. NEVER usar `drizzle-kit push` em staging/production
4. Testar RLS em `packages/database/test/rls.integration.test.ts`

### Cross-Tenant Tests

Cada novo recurso tenant-owned requer:

- Teste positivo: workspace acessa seus próprios dados
- Teste negativo: workspace não acessa dados de outro workspace
- Teste de cleanup: context não vaza para pooled connections

## Migrations

### Gerar Migration

```bash
# Quando Drizzle Kit estiver configurado
pnpm drizzle-kit generate
```

### Expand/Contract Pattern

Para mudanças destructivas:

1. Expand: adicionar nova coluna/índice
2. Deploy
3. Migrate data
4. Contract: remover coluna/índice antigo
5. Deploy

## Testing Patterns

### Integration Tests

```typescript
// packages/database/test/rls.integration.test.ts
test("feature respects RLS", async () => {
  // 1. Setup com admin role
  // 2. Criar dados em workspace A e B
  // 3. Testar com runtime role (sem BYPASSRLS)
  // 4. Verificar isolamento entre workspaces
  // 5. Verificar que context não vaza
});
```

### Runtime Role Setup

```sql
-- Role para application runtime
CREATE ROLE maria_runtime LOGIN PASSWORD 'secret'
NOSUPERUSER NOBYPASSRLS;

-- Grants mínimos
GRANT USAGE ON SCHEMA public TO maria_runtime;
GRANT SELECT, INSERT, UPDATE ON table_name TO maria_runtime;
```

## Regras de Segurança

1. **Nunca** usar superuser em application runtime
2. **Nunca** conceder BYPASSRLS para runtime roles
3. **Sempre** validar UUID de workspaceId
4. **Sempre** usar transactions com SET LOCAL
5. **Sempre** testar cross-tenant negative cases
6. **Nunca** expor DB schema diretamente para UI

## Common Operations

### List Contacts

```typescript
const contacts = await database.listContacts(workspaceId);
```

### Custom Query Scoped

```typescript
const result = await database.withWorkspace(workspaceId, (tx) =>
  tx.execute(sql`SELECT * FROM companies WHERE active = true`),
);
```

### Insert Scoped

```typescript
await database.withWorkspace(workspaceId, (tx) =>
  tx.insert(contacts).values({ name: "New Contact" }),
);
```

## Debugging RLS

### Verificar RLS Status

```sql
SELECT
  c.relname,
  r.rolsuper,
  r.rolbypassrls,
  c.relforcerowsecurity
FROM pg_roles r
CROSS JOIN pg_class c
WHERE r.rolname = current_user
  AND c.relname = 'table_name';
```

### Verificar Context Atual

```sql
SELECT current_setting('app.workspace_id', true) as workspace_id;
```

## References

- `packages/database/src/index.ts`: Implementação de withWorkspace
- `packages/database/src/schema.ts`: Schemas Drizzle
- `packages/database/drizzle/`: Migrations SQL
- `packages/database/test/rls.integration.test.ts`: Tests RLS
- `AGENTS.md §4.1`: Tenant isolation invariants
