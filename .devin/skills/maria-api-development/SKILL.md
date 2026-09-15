# MarIA CRM API Development

Skill para desenvolvimento de API Fastify no MarIA CRM.

## Quando usar

Use esta skill quando:
- Criando novos endpoints REST
- Implementando rotas com authorization
- Configurando rate limiting
- Adicionando schemas de validação
- Implementando handlers de webhooks
- Configurando SSE/WebSocket (quando necessário)

## Padrões API

### Dependency Injection Pattern
```typescript
// apps/api/src/app.ts
type RouteDependencies = {
  database: {
    operation: (workspaceId: string) => Promise<Result>;
  };
  authorizeWorkspace: (request: FastifyRequest) => Promise<string | undefined>;
};

export function buildApp(dependencies?: RouteDependencies) {
  const app = Fastify({ logger: true });
  
  if (dependencies) {
    // Registrar rota apenas quando dependencies são injetadas
    app.get("/endpoint", handler);
  }
  
  return app;
}
```

### Authorization Pattern
```typescript
async (request, reply) => {
  const workspaceId = await dependencies.authorizeWorkspace(request);
  if (!workspaceId) return reply.code(401).send();
  // Continuar com operação scoped
  return dependencies.database.operation(workspaceId);
}
```

### Schema Validation
```typescript
schema: {
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      required: ["id", "name"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
      },
    },
    401: { type: "null" },
  },
}
```

## Rate Limiting

### Global Plugin
```typescript
app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
```

### Route-Specific Override
```typescript
app.get(
  "/protected",
  {
    config: {
      rateLimit: {
        max: 50,      // Mais restritivo para rotas protegidas
        timeWindow: "1 minute",
      },
    },
  },
  handler
);
```

## Endpoints Implementados

### Current
- `GET /health` - Liveness check (não verifica DB)
- `GET /contacts` - Injectable (requer auth + database dependency)

### Próximos (Phase 0)
- Authentication/authorization endpoints
- CRUD completo de contacts
- Companies CRUD
- Pipelines, stages, deals
- Channels, conversations, messages

## Regras de Segurança

1. **Nunca** expor rotas tenant-owned sem authorization
2. **Sempre** validar workspaceId antes de operações DB
3. **Sempre** usar rate limiting em rotas públicas
4. **Nunca** expor dados raw de DB schema
5. **Sempre** usar schemas OpenAPI/JSON Schema
6. **Webhooks** devem validar authenticity do provider

## Testing Patterns

### Unit Tests
```typescript
// apps/api/test/endpoint.test.ts
import { buildApp } from "../src/app.ts";

test("endpoint returns 401 without auth", async () => {
  const app = buildApp(); // Sem dependencies
  const response = await app.inject({
    method: "GET",
    url: "/protected",
  });
  expect(response.statusCode).toBe(404); // Rota não registrada
});
```

### Integration Tests
```typescript
// apps/api/test/endpoint.integration.test.ts
test("endpoint returns data with auth", async () => {
  const app = buildApp({
    database: { operation: async () => [{ id: "1", name: "Test" }] },
    authorizeWorkspace: async () => "workspace-123",
  });
  const response = await app.inject({
    method: "GET",
    url: "/protected",
  });
  expect(response.json()).toEqual([{ id: "1", name: "Test" }]);
});
```

### E2E Tests
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

## Webhook Patterns

### Meta WhatsApp Webhook
```typescript
app.post("/webhooks/whatsapp/meta", {
  config: { rateLimit: { max: 1000, timeWindow: "1 minute" } },
  schema: {
    body: {
      type: "object",
      properties: {
        object: { type: "string" },
        entry: { type: "array" },
      },
    },
  },
}, async (request, reply) => {
  // 1. Validar signature X-Hub-Signature
  // 2. Normalizar payload
  // 3. Persistir com outbox
  // 4. Retornar 200 rápido
  reply.code(200).send();
});
```

## SSE/WebSocket

### Quando usar SSE (default)
- Server-sent events para updates
- One-way server → client
- Simplifica setup vs WebSocket

### Quando usar WebSocket
- Full duplex necessário
- Real-time bidirectional
- Justificado por caso de uso específico

## Logging

Fastify usa Pino automaticamente:
```typescript
app.log.info({ workspaceId }, "Processing request");
```

## Graceful Shutdown

SIGTERM e SIGINT são tratados automaticamente pelo Fastify:
```typescript
// In server.ts
process.on("SIGTERM", async () => {
  await app.close();
});
```

## References

- `apps/api/src/app.ts`: Padrão de dependency injection
- `apps/api/test/`: Exemplos de testes
- `AGENTS.md §4.5`: Anti-stale human takeover (para conversas)
- `ARCHITECTURE.md`: System boundaries
