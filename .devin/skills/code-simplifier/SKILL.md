# code-simplifier

Skill Devin adaptada do plugin oficial da Anthropic. Analisa código recentemente modificado e propõe refinamentos de clareza, consistência e manutenibilidade, preservando funcionalidade e seguindo os contratos do projeto.

## Quando usar

- Após modificações em arquivos TypeScript/JavaScript/ESM.
- Quando o desenvolvedor solicitar revisão de clareza e simplificação sem mudar comportamento.
- Como etapa de leitura/revisão, não como substituto de testes ou segurança.

## Escopo e regras

1. **Preservar funcionalidade**: nunca alterar o que o código faz; apenas como faz.
2. **Seguir o contrato do repositório**: `AGENTS.md` e `ARCHITECTURE.md` têm precedência sobre estilos genéricos.
3. **Preferências do projeto**:
   - TypeScript 7 strict + ESM.
   - Fastify 5, Drizzle ORM 0.45.2, node-postgres, React 19 + Vite 8.
   - Padrões de injeção de dependência do `apps/api/src/app.ts`.
   - Transações scoped por workspace via `withWorkspace()` e RLS obrigatória.
4. **Clareza acima de brevidade**:
   - Evitar ternários aninhados; preferer `if/else` ou `switch`.
   - Nomear variáveis e funções de forma explícita.
   - Consolidar lógica relacionada sem combinar responsabilidades distintas.
5. **Não aplicar mudanças sem aprovação**: esta skill é usada para ler, sugerir e reportar. Alterações só ocorrem quando o desenvolvedor aprovar explicitamente.

## Processo de análise

1. Listar arquivos recentemente modificados na sessão/branch atual.
2. Ler os trechos alterados, imports e contratos adjacentes.
3. Identificar oportunidades de simplificação:
   - complexidade desnecessária;
   - duplicação ou abstração redundante;
   - nomes confusos;
   - violação de padrões do projeto.
4. Verificar que cada sugestão mantém a funcionalidade original.
5. Reportar sugestões com referências de arquivo/linha e, quando pertinente, exemplos de código.
