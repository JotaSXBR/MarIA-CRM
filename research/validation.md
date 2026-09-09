# Revisão crítica final e estado da pesquisa

Data: 2026-09-09. Esta revisão distingue **integridade do artefato**, **evidência de código** e **validação dinâmica**. Passar o validador Markdown/Mermaid não comprova comportamento de software nem segurança de produção.

## Resultado objetivo

- Dois snapshots completos adquiridos, com commits, árvores e hashes de todos os arquivos versionados; fontes preservadas sem alterações.
- Cinco volumes com 90 seções numeradas, 20 diagramas Mermaid, oito casos de execução, dicionário lógico, índice técnico e 38 registros críticos de evidência.
- Imagens públicas do CRM-Modelo baixadas, abertas e interpretadas; duas animações analisadas por quadros; três CTAs públicos clicados sem enviar formulário.
- Código central e implementação delegada de ToolNode/StructuredTool inspecionados; contratos testados com limitações descritas abaixo.
- Blueprint próprio de CRM/messaging/IAM/agents/tools/skills/workflows/eventos/realtime/dados/segurança/observability, sem dependência obrigatória de outro CRM.

**Limite de completude:** aquisição/inventário integral foi realizado; auditoria semântica integral de cada módulo/linha de A não foi realizada. O índice marca módulos apenas estruturais como UNKNOWN/LOW. Banco/RLS/checkpoints distribuídos e providers reais não foram exercitados. Áreas autenticadas do CRM-Modelo não foram acessadas. Assim, o entregável está consolidado para revisão e início do design técnico, mas não deve ser apresentado como cumprimento irrestrito de toda exigência de auditoria integral ou como validação de produção.

## Testes: resultado sem arredondar para verde

| Artefato | Resultado |
|---|---|
| [Suíte geral](evidence/tests-suite.log) | exit 1; milhares de casos pass/skipped e 36 ocorrências fail no log; contagem não deduplicada |
| [Recorte central](evidence/tests-focused.log) | 352 testes, 351 pass, 1 fail; 9 arquivos; 801 assertions |
| [Sandbox repetido isoladamente](evidence/tests-sandbox-repeat.log) | 1 pass; falha inicial não reproduzida isoladamente |
| [Duas suítes estáticas repetidas](evidence/tests-static-repeat.log) | 62 testes, 61 pass, 1 timeout; i18n passou |
| [Scanner estático com timeout 20 s](evidence/tests-static-time-budget.log) | 1 pass em aproximadamente 5,9 s; antes excedia orçamento de 5 s |

Conclusão: timeout do scanner foi distinguido de assertion failure nesse ambiente; não houve alteração da implementação para obter pass. Falha intermitente de sandbox/i18n requer investigação se relevante à adoção. Não se atribuem automaticamente todas as falhas gerais ao ambiente. Bun usado 1.3.14 difere do pin 1.4.2. `ALLOW_NO_DB=1` permitiu skips; nenhum provider real ou Chatwoot foi chamado com credencial real para e 2e. Models de testes são scripted/mocks onde especificado pelo próprio teste.

## Autoauditoria solicitada

| Gate | Verificação realizada | Resultado / limite |
|---|---|---|
| Unsupported claims | claims centrais têm E/path/symbol/lines e call chain; testes separados | corrigidos caminhos/ranges; grupos sem tracing marcados UNKNOWN |
| Architecture contamination | A no Volume I; CRM-Modelo UI no II; C explicitamente proposto no IV/V | nenhum banco/engine privado atribuído ao CRM-Modelo |
| Documentation bias | runtime native[] comparado à instrução B; defaults de serviço comparados ao schema | código prevalece; docs/marketing não sustentam garantias |
| Naming inference | dashboard.png e notifications.png abertos visualmente | primeiro é inbox, segundo preferências; nomes não viraram descrição de runtime |
| Missing call chain | casos 1–8 e ledger; ToolNode dependency source capturado | host de skills/CLI e módulos não aprofundados permanecem UNKNOWN |
| UI hallucination | cada tela tem ID/URL/acesso/evidência/limite | authenticated agent config/analytics/integrations marcados UNAVAILABLE |
| Technology-first design | domínio/invariantes antes de storage; ADR Requirement/Candidate/Why/Tradeoffs/Alternatives/Lock-in/Cost/Decision | decisões condicionais não tratadas como stack instalada |
| Generic AI architecture | síntese depende de handoff parcial, native allowlist, MCP system context, history window e summary rewrite observados | ligações P01–P10 sustentam redesign; proposta genérica inevitável não é fingida como observação |
| Test overclaim | logs e repetições preservados; nenhuma expressão “suíte verde” como resultado | suíte geral falhou, DB skipped, execução externa desconhecida |
| Scope/permissions | não alterou fontes, não enviou formulários, não executou helpers administrativos de B | somente aquisição, leitura, captura pública e testes locais |

Correções concretas da revisão: fonte realtime estava registrada com diretório incorreto; ajustada para `src/api/features/realtime/realtime.service.ts`. Intervalos que ultrapassavam EOF em sete registros foram corrigidos. Nome de tool administrativa corrigido para `prompt_set`. Índice expandido para separar API features e incluir os quatro grupos de distribuição/skills B. Comentário de lane serial não foi usado para concluir segurança multi-replica. Essas correções constam nos geradores e no resultado final, não só nesta nota.

## Definition of Done —20 perguntas respondidas com escopo

| # | Pergunta | Resposta rastreável |
|---|---|---|
| 1 | O que é Agent? | registro de configuração + config carregada + grafo por turno, não classe autônoma única; [§6](volume-i.md#6-agent-internal-model), E02/E05/E08 |
| 2 | Como é instanciado? | CRUD persiste; runtime constrói SDK/tools/grafo; [Caso 1](execution-cases.md), E02/E05 |
| 3 | Como instruções chegam ao LLM? | loader/compose/interpolate/context MCP → SystemMessage novo no agentNode; E08/E09/E10/E16 |
| 4 | Como contexto é montado? | fontes ordenadas + checkpoint normalizado/janelado + entrada; [§10](volume-i.md#10-context-assembly); bytes wire reais UNKNOWN |
| 5 | Como ferramentas são registradas? | AgentToolSelection refs → builders → merge/dedupe/precondition → bindTools; E11/E12/E18 |
| 6 | Como modelo pede ferramenta? | AIMessage.tool_calls com name/id/args; toolsCondition; [Caso 3](execution-cases.md) |
| 7 | Como executa? | ToolNode → wrapper → StructuredTool schema parse → função; [dependência instalada](dependency-runtime.md) |
| 8 | Como resultado retorna? | ToolMessage correlacionada/status → estado do grafo → próximo invoke; E09/E15 |
| 9 | O que é Skill? | pacote de autoria/operação com instruções/recursos/scripts; [forensics B](skills-forensics.md) |
| 10 | Como Skill afeta Agent? | indiretamente ao orientar MCP/API/import/prompt ou edição de código; nenhum loader por turno encontrado; Caso 4 |
| 11 | Relação entre repos? | conteúdo compartilhado/vendorizado e procedimentos; sem package runtime dependency; [§14](volume-i.md#14-cross-repository-relationships) |
| 12 | Onde há estado? | request, closures, mirror, app DB e checkpoint; E05/E19/E33; [§16](volume-i.md#16-state) |
| 13 | Onde há memória? | histórico por thread + AttendanceSummary/head; KB e attrs são coisas distintas; E19/E20/E38 |
| 14 | Como run começa/termina? | trigger/gates → runtime/grafo → decisão/entrega/supressão/error → finally; Caso 2/5/7 |
| 15 | Como erros percorrem? | validação HTTP, classifier/fallback, ToolMessage/throw, partial delivery e cleanup; [§21](volume-i.md#21-error-handling), Casos 7/8 |
| 16 | Padrões essenciais? | definição vs run, geração vs delivery, policy seam, memória vs contexto, effects; [P01–P10](volume-iii.md) |
| 17 | Detalhes específicos? | Chatwoot IDs, Bun/Elysia, dois nós LangGraph, limites/markers, defaults; [§46](volume-iii.md#46-implementation-specific-decisions) |
| 18 | Padrões CRM-Modelo? | contexto comercial na inbox, ownership, copiloto, preview/config/output; [§43](volume-ii.md#43-ux-principles); telas não vistas excluídas |
| 19 | Como virar arquitetura independente? | CRM/messaging próprios + versioned control plane + durable execution/effect ledger; [Volume IV](volume-iv.md) |
| 20 | Como sustentar CRM completo? | entidades/invariantes e fronteiras próprias, extensão governada, fases e 28 critérios de aceite; [modelo](domain-model.md), [§90](volume-v.md#90-acceptance-criteria) |

As respostas acima sustentam o blueprint, mas não convertem UNKNOWNs em evidência. A pergunta “foi analisado manualmente todo arquivo de runtime, em todos os callers?” permanece **não**; a pergunta “foram adquiridos/inventariados ambos os repositórios completos?” é **sim**.

## Validação mecânica e reprodução

[Relatório estrutural](evidence/artifact-validation.json): verifica 90 seções únicas nos cinco volumes, pelo menos 20 diagramas, fences, existência de links locais e validade dos intervalos de arquivos do ledger. [Mermaid](evidence/mermaid-validation.json):20 diagramas parseados com Mermaid 11.17.2; valida sintaxe, não layout visual de cada renderer.

Scripts preservados: [inventário/leitor](inspect.mjs), [gerador do índice](build-index.mjs), [ledger](build-ledger.mjs), [captura pública](capture-crm-modelo.mjs), [quadros](capture-animations.mjs), [test runner](run-tests.mjs), [código de dependência](capture-dependency-code.mjs), [validador](validate-artifact.mjs), [parser Mermaid](parse-diagrams.mjs), [livro unificado](build-book.mjs). São ferramentas da pesquisa, não código do CRM.

Alguns scripts referenciam diretórios temporários e a instalação Playwright disponível neste ambiente; para reproduzir em outra máquina, ajustar esses caminhos e instalar versões equivalentes antes de executar. Os snapshots/commits/hashes são a referência portátil. Logs `stdout` e `stderr` foram capturados em buffers separados e concatenados; não usar sua ordem global como timeline de threads. Não executar scripts administrativos B para “reproduzir a pesquisa”: eles têm efeitos externos e não foram necessários.

## Trabalho adicional necessário para auditoria integral

1. Ambiente DB descartável com papel runtime correto, migrations/pgvector e pin Bun 1.4.2; rodar suíte completa e classificar falhas remanescentes.
2. Tracing profundo de módulos atualmente apenas indexados (IAM/auth completo, cada conector/toolpack, retenção e mídia, entre outros), documentando callers/callees/error paths individuais.
3. E2e local de webhook→Chatwoot simulado→checkpoint→delivery, com fault injection em todas as janelas de persistência e múltiplos processos.
4. Contract/canary por provider com dados sintéticos e budgets autorizados; capturar payloads redigidos reais e capacidades.
5. Acesso autorizado adicional ao CRM-Modelo para telas não disponíveis e testes de navegação/estados/acessibilidade; sem isso manter UNAVAILABLE.
6. Pentest/review independente antes de live tools/tenancy/billing; blueprint e teste unitário não substituem essa etapa.

Nenhuma dessas pendências foi ocultada por extensão narrativa, quantidade de diagramas ou confiança HIGH em outra parte da cadeia.
