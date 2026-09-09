# Registro de evidências críticas

Cada registro é uma descoberta delimitada, não uma certificação de segurança. HIGH = código/call chain inspecionado; não significa deploy validado. Registros documentais B provam instrução de autoria, não execução do consumidor externo. Dependências instaladas têm evidência separada no Volume I.

<a id="e01"></a>
## E01

ID: E01  
Claim: API, websocket publisher e workers são compostos no processo; signals param timers e encerram processo.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/index.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/index.ts#L34-L255)  
Symbol: `bootstrap`  
Lines: 34-255  
Caller: Bun process  
Callee: app.listen; registerJobHandler; start workers; stop workers  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não é comprovado drain integral de chamadas externas em voo.  
Open questions: Quem garante término dos writes antes de process.exit?

<a id="e02"></a>
## E02

ID: E02  
Claim: Agente é criado como registro tenant-scoped; defaults do serviço enabled=true e mode=test; modelo não instanciado nesse passo.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/agents/service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/agents/service.ts#L1184-L1356)  
Symbol: `createAgent`  
Lines: 1184-1356  
Caller: agents.controller POST /v1/agents; MCP authoring  
Callee: parseInput; assertAgentCreatable; runScopedOn; tx.agent.create; audit  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Configuração persistida é distinta da instância de modelo/grafo por turno.  
Open questions: Não há snapshot imutável de AgentVersion no schema.

<a id="e03"></a>
## E03

ID: E03  
Claim: Receiver verifica token/HMAC, parseia e normaliza; controller inicia registro/processamento sem await antes de ACK.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/chatwoot/webhook.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/chatwoot/webhook.ts#L1234-L1338)  
Symbol: `receiveChatwootWebhook; recordAndProcessChatwootDelivery`  
Lines: 1234-1338  
Caller: src/api/v1/chatwoot.controller.ts:23-72  
Callee: resolveRouteToken; verifySignature; claimDelivery; processChatwootDelivery  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: [INFERENCE] Existe janela de crash entre ACK e claim persistido, apesar de recuperação dos registros já existentes.  
Open questions: Crash nessa janela não foi injetado; cache/refresh de rota podem consultar banco.

<a id="e04"></a>
## E04

ID: E04  
Claim: Mensagem renderizável e binding elegível são necessários; checks de mensagem mais nova e watermark influenciam entrega.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/runtime.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/runtime.ts#L2285-L2498)  
Symbol: `runAgentTurn`  
Lines: 2285-2498  
Caller: processChatwootDelivery  
Callee: loadAgentConfig; runLoadedTurn; advanceHandledWatermark  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Responder não equivale a simplesmente invocar o modelo.  
Open questions: Races cross-process não validadas com DB neste ambiente.

<a id="e05"></a>
## E05

ID: E05  
Claim: Turno constrói estado mutável de anexos/handoff, closures de fencing, ferramentas e grafo.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/runtime.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/runtime.ts#L579-L1022)  
Symbol: `runLoadedTurn; runTurnBody`  
Lines: 579-1022  
Caller: runAgentTurn; debounce handler  
Callee: buildToolset; buildModelAndGraph; buildCallbacks; status reporter  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não é instância de uma classe Agent autônoma persistente.  
Open questions: Cobertura dos outros entrypoints é seletiva.

<a id="e06"></a>
## E06

ID: E06  
Claim: Histórico existente/attendance boundaries e guardrails precedem invoke com HumanMessage e thread_id.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/runtime.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/runtime.ts#L1258-L1798)  
Symbol: `graph invocation path`  
Lines: 1258-1798  
Caller: runTurnBody  
Callee: drain ingest; markTurnOwning; graph.getState; graph.updateState; graph.invoke  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Checkpoint e entrada atual são combinados pelo grafo; transação SQL não permanece aberta no LLM.  
Open questions: Sem provider real e sem DB, caminho completo não foi executado aqui.

<a id="e07"></a>
## E07

ID: E07  
Claim: Saída pode ser suprimida, entregue parcialmente ou transferida; finally limpa in-flight e ownership.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/runtime.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/runtime.ts#L1792-L2266)  
Symbol: `delivery and cleanup`  
Lines: 1792-2266  
Caller: graph.invoke result  
Callee: deliverText; guardrails; attachment delivery; clear turn ownership  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Efeito externo e checkpoint não são uma transação única.  
Open questions: Exatamente uma entrega externa não é garantia demonstrada.

<a id="e08"></a>
## E08

ID: E08  
Claim: Prompt efetivo escolhe override, variante ou Agent.systemPrompt; acrescenta grounding, variáveis e contexto de atributos/agendamento.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/prepare.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/prepare.ts#L335-L832)  
Symbol: `loadAgentConfig`  
Lines: 335-832  
Caller: runtime; playground; memory  
Callee: agent.findFirst; vault resolution; loadToolSelections; composeSystemPrompt; interpolatePrompt  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Descrição de Agent no banco é configuração; LoadedAgentConfig contém credenciais resolvidas por execução.  
Open questions: Conteúdo final varia por tenant/conversa/tempo; não há prompt universal.

<a id="e09"></a>
## E09

ID: E09  
Claim: Grafo agent↔tools itera; normaliza SystemMessage; limite por resultados após último Human; tools boundary pode recusar lote.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/graph.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/graph.ts#L441-L711)  
Symbol: `agentNode; toolsNode; StateGraph`  
Lines: 441-711  
Caller: buildModelAndGraph  
Callee: selectHistoryWindow; bindTools; runModelCall; ToolNode.invoke; toolsCondition  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Limite não é scheduler nem workflow de negócio; paralelismo do lote pode ultrapassar teto antes do próximo check.  
Open questions: [INFERENCE] Overshoot não foi medido com side effects reais.

<a id="e10"></a>
## E10

ID: E10  
Claim: Prompt base é concatenado com grounding condicional; variáveis conhecidas interpoladas; desconhecidas permanecem.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/prompt.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/prompt.ts#L23-L304)  
Symbol: `composeSystemPrompt; buildPromptVars; interpolatePrompt`  
Lines: 23-304  
Caller: loadAgentConfig  
Callee: sanitizePromptValue; time/calendar formatting  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Texto de skill não é automaticamente inserido neste pipeline.  
Open questions: Dados externos ainda podem conter conteúdo adversarial.

<a id="e11"></a>
## E11

ID: E11  
Claim: Ferramentas convergem em lista única, nome único e wrappers de precondição depois do merge.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/prepare.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/prepare.ts#L943-L1325)  
Symbol: `buildToolset`  
Lines: 943-1325  
Caller: runTurnBody; playground  
Callee: loadMcpTools; native/document/HTTP/code/toolpack/RAG builders; dropDuplicateToolNames; applyToolPreconditions  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Grants e unicidade são fronteiras relevantes; nomes ainda são coupling de prompts/precondições.  
Open questions: Colisões removidas com warning podem alterar capacidade esperada.

<a id="e12"></a>
## E12

ID: E12  
Claim: Selections persistidas distinguem NATIVE/HTTP/MCP/RAG/INTEGRATION/DOCUMENT/CODE.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/assemble.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/assemble.ts#L153-L460)  
Symbol: `loadToolSelections`  
Lines: 153-460  
Caller: loadAgentConfig  
Callee: agentToolSelection.findMany; relation mapping  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não são Skill records; são grants/conexões/definições.  
Open questions: Versões das dependências não são congeladas por run.

<a id="e13"></a>
## E13

ID: E13  
Claim: Ausência de seleção NATIVE permite conjunto padrão; enabledTools=[] explicitamente permite nenhum nativo.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/native.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/native.ts#L1370-L1392)  
Symbol: `buildNativeTools`  
Lines: 1370-1392  
Caller: buildToolset  
Callee: 13 native builders; filter by Set  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Contradiz instrução operacional de B que equipara allowlist vazia a todas.  
Open questions: Legacy migrations/config podem afetar grants históricos, não esse filtro.

<a id="e14"></a>
## E14

ID: E14  
Claim: Argumentos estruturados viram request com contexto/secret injection; origem/host e SSRF verificados; resultado é texto limitado.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/http.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/http.ts#L522-L931)  
Symbol: `buildHttpTool`  
Lines: 522-931  
Caller: buildHttpTools; ToolNode  
Callee: schema parser; credential resolver; template interpolation; assertSafeOutboundUrl; fetchBounded; toolFailure  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: HTTP status esperado pode ser resultado normal; ferramenta não é proxy HTTP irrestrito sem governança.  
Open questions: DNS check e fetch não demonstram pinning da resolução; TOCTOU não explorado.

<a id="e15"></a>
## E15

ID: E15  
Claim: Falha marcada retorna ToolMessage status=error quando há tool_call_id; chamada plain args devolve string.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/failure.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/failure.ts#L1-L54)  
Symbol: `failableTool; toolFailure`  
Lines: 1-54  
Caller: HTTP/CODE/RAG builders  
Callee: LangChain tool wrapper; ToolMessage  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Erro voltado ao modelo não é necessariamente exceção do turno.  
Open questions: Ver também tratamento de exceções no ToolNode instalado.

<a id="e16"></a>
## E16

ID: E16  
Claim: MCP tools são conectadas, filtradas por allowlist e namespaced; server instructions entram no system prompt.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/mcp.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/mcp.ts#L241-L444)  
Symbol: `buildMcpContextSection; loadMcpTools`  
Lines: 241-444  
Caller: buildToolset; buildModelAndGraph  
Callee: MultiServerMCPClient; getTools; OAuth refresh; namespace filter  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: [INFERENCE] Instruções remotas nesse nível ampliam risco de injection/poisoning.  
Open questions: Nenhum ataque foi executado; confiança no servidor é requisito externo.

<a id="e17"></a>
## E17

ID: E17  
Claim: Código salvo executa em Worker+QuickJS com limites de tempo/memória/stack e fila; não é ferramenta nativa run_code.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/code-sandbox.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/code-sandbox.ts#L24-L280)  
Symbol: `runSandboxedCode`  
Lines: 24-280  
Caller: buildCodeTool / invokeCodeTool  
Callee: Worker; queue; timer; terminate; QuickJS worker  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Sandbox restringe API JS exposta; não equivale a isolamento de processo/VM para todo tipo de ferramenta.  
Open questions: Um teste de orçamento falhou no ambiente; não prova escape.

<a id="e18"></a>
## E18

ID: E18  
Claim: Substituição de grants é transacional com checagem opcional de updatedAt e validação de referências.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/agents/service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/agents/service.ts#L2273-L2389)  
Symbol: `replaceAgentToolSelections`  
Lines: 2273-2389  
Caller: REST/MCP configuration  
Callee: transaction locks; normalizeGrants; deleteMany; createMany; audit; broadcast  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Controle otimista de edição não é versionamento imutável de deployment.  
Open questions: Publicação realtime pode ser best-effort.

<a id="e19"></a>
## E19

ID: E19  
Claim: Histórico do grafo persiste em schema langgraph; thread pode usar contactInbox em vez de conversation id.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/checkpointer.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/checkpointer.ts#L24-L95)  
Symbol: `getCheckpointer; resolveGraphThreadId`  
Lines: 24-95  
Caller: buildModelAndGraph  
Callee: PostgresSaver.setup; pg.Pool; tenant thread prefix  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Memória conversacional pode atravessar atendimentos da mesma relação contato/inbox.  
Open questions: Isolamento de langgraph depende de controles de aplicação; não demonstrada RLS igual às tabelas Prisma.

<a id="e20"></a>
## E20

ID: E20  
Claim: Resumo é salvo antes de rewrite; prefixo é revalidado sob fila; até 20 resumos alimentam memory head; mudanças/busy adiam.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/memory/compact.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/memory/compact.ts#L176-L750)  
Symbol: `runMemoryCompact`  
Lines: 176-750  
Caller: MEMORY_COMPACT handler  
Callee: summarizeAttendance; attendanceSummary.upsert; graph.updateState; RemoveMessage  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Resumo de atendimento é memória persistida derivada, não vector memory generalizada.  
Open questions: Atomicidade entre stores não existe; recovery/reuse mitigam parte da janela.

<a id="e21"></a>
## E21

ID: E21  
Claim: Jobs persistidos executam com claims e concorrência de lotes; handlers despachados por registry local.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/scheduler/worker.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/scheduler/worker.ts#L231-L370)  
Symbol: `runClaimed; runSchedulerTick`  
Lines: 231-370  
Caller: startup timers  
Callee: claimDue; handlers; complete/fail/reschedule; Promise.allSettled  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Scheduler existe; não há motor genérico de workflow versionado demonstrado.  
Open questions: Escala/fairness entre réplicas requer teste de carga com DB.

<a id="e22"></a>
## E22

ID: E22  
Claim: Busca usa KBs autorizadas/modelo compatível e embedding fora da transação SQL.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/rag/service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/rag/service.ts#L35-L79)  
Symbol: `searchKnowledge`  
Lines: 35-79  
Caller: search_knowledge tool  
Callee: resolve embedding credentials; embed; scoped vector SQL  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Conhecimento recuperado é resultado de ferramenta, não toda base injetada automaticamente.  
Open questions: Qualidade de retrieval e vazamento semântico não medidos.

<a id="e23"></a>
## E23

ID: E23  
Claim: Realtime usa conexões/tópicos e publisher local ao processo.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/api/features/realtime/realtime.service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/api/features/realtime/realtime.service.ts#L22-L200)  
Symbol: `publisher and broadcast helpers`  
Lines: 22-200  
Caller: services; src/index.ts  
Callee: Bun server.publish; JSON.stringify  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não foi localizado fanout cross-replica ou cursor durável de replay nesse caminho.  
Open questions: Infraestrutura externa de produção não está acessível.

<a id="e24"></a>
## E24

ID: E24  
Claim: Cria entregas PENDING por assinatura com envelope persistido.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/webhooks/outbound/service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/webhooks/outbound/service.ts#L16-L52)  
Symbol: `emitOutbound`  
Lines: 16-52  
Caller: domain callers with scoped tx  
Callee: webhookSubscription.findMany; outboundWebhookDelivery.createMany  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Há mecanismo outbound durável; não prova event sourcing de todos os agregados.  
Open questions: Atomicidade depende de caller usar a mesma transação da mutação.

<a id="e25"></a>
## E25

ID: E25  
Claim: Log é write assíncrono rastreado, redigido e com falha capturada; withFlowStage relança erro de operação.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/flowlog/service.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/flowlog/service.ts#L105-L212)  
Symbol: `emitFlowEvent; withFlowStage`  
Lines: 105-212  
Caller: runtime/callbacks/tool handlers  
Callee: writeFlow; runScopedOn; executionLog.create; alert dispatch  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Observabilidade não deve ser confundida com commit durável de AgentStep.  
Open questions: Queda de processo pode perder writes pendentes.

<a id="e26"></a>
## E26

ID: E26  
Claim: Create injeta tenant e transação configura contexto para RLS; plano fleet tem contexto separado.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/lib/tenancy/multi-tenant.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/lib/tenancy/multi-tenant.ts#L65-L219)  
Symbol: `runScopedOn; asSuperAdminOn`  
Lines: 65-219  
Caller: domain services  
Callee: Prisma extension; set_config tenant context; transaction  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Segurança exige papel runtime correto e migrations RLS, não só filtro TypeScript.  
Open questions: Testes DB/RLS não executados aqui; ver scripts/db-bootstrap.sql.

<a id="e27"></a>
## E27

ID: E27  
Claim: Guard verifica URL e IPs resolvidos; opções de desenvolvimento alteram aceitação de privados/HTTP.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/lib/ssrf.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/lib/ssrf.ts#L209-L267)  
Symbol: `assertSafeOutboundUrl`  
Lines: 209-267  
Caller: HTTP tools and outbound clients  
Callee: URL parse; DNS lookup all addresses; address validation  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Controle de configuração importa; não declarar proteção absoluta contra SSRF.  
Open questions: [INFERENCE] Gap entre lookup e conexão precisa teste dedicado.

<a id="e28"></a>
## E28

ID: E28  
Claim: Falha de análise é registrada e retorna unanalyzed: política efetiva é fail-open nesse ponto.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/guardrails/analyze.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/guardrails/analyze.ts#L238-L315)  
Symbol: `analyzeText`  
Lines: 238-315  
Caller: runtime input/output gate  
Callee: structured/raw verdict invocation; runModelCall; readVerdict  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Guardrail LLM não substitui autorização determinística fail-closed.  
Open questions: Modos/chamadores podem decidir tratamento adicional; não generalizar para todo gate.

<a id="e29"></a>
## E29

ID: E29  
Claim: SPA possui superfícies de agentes, recursos e operação próprias de A.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/client/App.tsx](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/client/App.tsx#L1-L289)  
Symbol: `App routing`  
Lines: 1-289  
Caller: client entrypoint  
Callee: BrowserRouter; protected layouts; pages  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Essas rotas não são evidência das rotas internas do CRM-Modelo.  
Open questions: Detalhes de cada página não auditados linha a linha.

<a id="e30"></a>
## E30

ID: E30  
Claim: Factory tem branches por provider, baseURL e adaptações de reasoning/tools Gemini.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/models.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/models.ts#L178-L285)  
Symbol: `createChatModel`  
Lines: 178-285  
Caller: buildModelAndGraph; fallback builder  
Callee: ChatOpenAI; ChatAnthropic; ChatGoogleGenerativeAI; ChatDeepSeek  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: BaseChatModel abstrai invoke, mas parâmetros/transportes não são uniformes.  
Open questions: Sem requests autenticados reais; capacidades variam por modelo.

<a id="e31"></a>
## E31

ID: E31  
Claim: Recorta só input por estimativa e preserva última unidade humana mesmo se ultrapassa budget.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/history-window.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/history-window.ts#L49-L110)  
Symbol: `selectHistoryWindow`  
Lines: 49-110  
Caller: agentNode  
Callee: countMessageTokens callback; human-boundary selection  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não é limite estrito do request total e não remove mensagens persistidas.  
Open questions: System prompt e schemas de tools ficam fora desse orçamento.

<a id="e32"></a>
## E32

ID: E32  
Claim: Timeout/estados transitórios/empty completion podem ativar fallback; indiscriminadamente qualquer erro não.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/model-fallback.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/model-fallback.ts#L28-L54)  
Symbol: `isFallbackWorthy`  
Lines: 28-54  
Caller: agentNode/runModelCall handling  
Callee: providerFailure; statusOf; transient classifier  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Quando disponível, primary retries=0 e timeout45s; fallback fica sticky no turno.  
Open questions: Transportes diferem em suporte a timeout; Google não recebe timeout nesse factory.

<a id="e33"></a>
## E33

ID: E33  
Claim: Contador de holders+epoch protege uso do thread contra rewrite; fila local é outra camada.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/thread-claim.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/thread-claim.ts#L59-L250)  
Symbol: `markTurnOwning; leases`  
Lines: 59-250  
Caller: runtime; ingest; compaction  
Callee: durable thread columns; epoch; renewal; holder count  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Não chamar esse lease de mutex exclusivo de todos os turnos.  
Open questions: Garantia distribuída completa requer examinar fences de cada caller e testes DB.

<a id="e34"></a>
## E34

ID: E34  
Claim: Skill instrui um assistente de implantação a importar JSON e configurar prompt do agente.  
Status: [DOC] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: B — agents-skills@3d11c5ff7333dee51b1b764f9e67f407b818684a  
Path: [skills/agents-onboarding/references/08-agent-import.md](https://github.com/fazer-ai/agents-skills/blob/3d11c5ff7333dee51b1b764f9e67f407b818684a/skills/agents-onboarding/references/08-agent-import.md#L1-L66)  
Symbol: `agent import procedure`  
Lines: 1-66  
Caller: SKILL.md route  
Callee: agent_import; prompt_set via external assistant MCP  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: [DOC] Meta-layer de autoria, não skill executada no atendimento.  
Open questions: Mecanismo de injeção pelo host de coding assistant não consta no repositório.

<a id="e35"></a>
## E35

ID: E35  
Claim: Texto equipara allowlist vazia a todas as nativas, divergente do filtro runtime de A.  
Status: [DOC] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: B — agents-skills@3d11c5ff7333dee51b1b764f9e67f407b818684a  
Path: [skills/agents-operation/references/03-adjust.md](https://github.com/fazer-ai/agents-skills/blob/3d11c5ff7333dee51b1b764f9e67f407b818684a/skills/agents-operation/references/03-adjust.md#L1-L48)  
Symbol: `native allowlist guidance`  
Lines: 1-48  
Caller: agents-operation SKILL.md  
Callee: operator MCP configuration  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: [DOC] Usar código/tests para [] versus ausência.  
Open questions: Confirmar intenção editorial com mantenedores não feito.

<a id="e36"></a>
## E36

ID: E36  
Claim: Script operacional prepara argumento SSH e envia arquivo/comando; não carrega runtime de cliente.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: B — agents-skills@3d11c5ff7333dee51b1b764f9e67f407b818684a  
Path: [skills/agents-onboarding/scripts/remote.py](https://github.com/fazer-ai/agents-skills/blob/3d11c5ff7333dee51b1b764f9e67f407b818684a/skills/agents-onboarding/scripts/remote.py#L1-L199)  
Symbol: `SSH execution helper`  
Lines: 1-199  
Caller: external coding assistant/operator CLI  
Callee: argparse; subprocess.run; ssh  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: [CODE] Skill pode ter código auxiliar, além de instruções e recursos.  
Open questions: Não executado porque teria efeitos de administração externos.

<a id="e37"></a>
## E37

ID: E37  
Claim: Status pode mudar antes de assignment; assignment failure é registrado e resultado ainda pode indicar handoff.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/graph/tools/native.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/graph/tools/native.ts#L288-L444)  
Symbol: `handoff_to_human`  
Lines: 288-444  
Caller: ToolNode  
Callee: private note; toggleStatus; assignConversation; side effect logger  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Efeito parcial exige contrato mais rico no novo produto.  
Open questions: Não demonstrado rollback remoto; tests/tools.test.ts:840–870 corroboram.

<a id="e38"></a>
## E38

ID: E38  
Claim: Resumo separa falas, exclui resultados de tools/markers e limita transcript; erro deixa thread intacto.  
Status: [CODE] observado no snapshot  
Confidence: HIGH para o comportamento delimitado; inferências/unknowns não herdam prova de execução  
Repository: A — agents@f1194d4dfd069982752a12f812e82a188f7dd898  
Path: [src/modules/memory/summarize.ts](https://github.com/fazer-ai/agents/blob/f1194d4dfd069982752a12f812e82a188f7dd898/src/modules/memory/summarize.ts#L143-L285)  
Symbol: `summarizeAttendance`  
Lines: 143-285  
Caller: runMemoryCompact  
Callee: transcript filtering; SystemMessage; HumanMessage; model  
Evidence: implementação referenciada; validação cruzada na seção 25 e no anexo de casos  
Interpretation: Resumos perdem informação por desenho; preservar proveniência é proposta.  
Open questions: Qualidade factual de resumo real não avaliada.

