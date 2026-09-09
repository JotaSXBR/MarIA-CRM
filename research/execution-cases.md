# Oito casos de execução — reconstrução por fronteiras reais

Camada A, commits do [ledger](evidence-ledger.md). `[CODE]` indica cadeia inspecionada; exemplos de input são **fixtures ilustrativos**, não captura de tráfego de produção. Linhas dos arquivos originais são preservadas nos permalinks do ledger. Nenhuma skill de pesquisa foi aplicada a uma instalação real.

## Caso 1 — criar/configurar um agente

**Hipótese:** “criar um agente instancia um runtime autônomo”. **Resultado:** refutada no caminho CRUD: cria configuração persistida, não modelo/grafo. [E02](evidence-ledger.md#e 02), [E18](evidence-ledger.md#e 18).

| Etapa exigida | Trajeto observado |
|---|---|
| Initial caller | cliente REST → `src/api/v1/agents.controller.ts`, POST `/v1/agents`; alternativa MCP `agentCreate` em write-agents |
| Input object | body com name, systemPrompt, modelConfig, settings, mode e refs opcionais; tenant/principal vêm da autenticação, não de um pedido arbitrário do LLM |
| Validation | papel TENANT_ADMIN no controller; schema de transporte; `agentCreateSchema` strict; assert de prompt/settings/model/config/refs e credenciais |
| Transformations | defaults e normalização; `mode` não enviado vira test no serviço; horários/credenciais resolvidos dentro do tenant |
| Objects instantiated | objeto persistido Agent; payloads de audit; **nenhum BaseChatModel/StateGraph** |
| Functions invoked | controller → `createAgent` → `assertAgentCreatable`/parse → `runScopedOn` → `tx.agent.create` → audit |
| LLM request | nenhum |
| State mutation | nova linha Agent e audit; configuração de tools é fluxo separado de replace-the-set |
| Persistence | transação Prisma com app.tenant_id; referências tenant-visíveis |
| Events | audit da criação; armamento de follow-up condicional após criação; tools replacement emite broadcast de configuração |
| Output | representação de agente criado; MCP pode oferecer preview antes de aplicar |
| Errors | validação/credencial/referência → AppError; optimistic expectedUpdatedAt em replace pode resultar 409 |
| Cleanup | commit ou rollback da transação; não há loop residente a terminar |

Configurar tools: `replaceAgentToolSelections:2273–2389` normaliza e bloqueia nomes/Agent; valida grants; troca o conjunto em transação; audit e timestamp; depois broadcast. Publicar uma alteração não congela um snapshot imutável para turnos futuros. Import é outro caminho: valida export format, remapeia recursos, cria Agent disabled/test. [transfer.ts:1073–1350](sources/agents/src/modules/agents/transfer.ts).

## Caso 2 — mensagem simples, sem chamada de ferramenta

**Hipótese:** “um webhook vira diretamente um completion”. **Resultado:** há autenticação, ledger, mirror, gates, possível debounce, ingest, checkpoint e entrega protegida. [E03–E10](evidence-ledger.md#e 03).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | Chatwoot → controller → `receiveChatwootWebhook`; `recordAndProcessChatwootDelivery` iniciado assíncrono |
| Input object | body assinado normalizado; depois RunAgentTurn com tenantId/instanceId/conversationId/inboxId/message e dependências |
| Validation | route token, HMAC, JSON/event; responder binding/generation; incoming renderizável; agent enabled/mode; ownership/test gates |
| Transformations | mensagem/mídia/quote vira texto; leitura de attrs/timezone; prompt override/variante/base; grants e vault |
| Objects instantiated | LoadedAgentConfig, ferramentas concedidas mesmo que não usadas, modelos primary/fallback, StateGraph, callbacks/status, TurnState |
| Functions invoked | process delivery → runAgentTurn → runLoadedTurn → runTurnBody → buildToolset/buildModelAndGraph → graph.invoke |
| LLM request | SystemMessage corrente + janela do checkpoint + HumanMessage atual; schemas se houver ferramentas disponíveis |
| State mutation | checkpoint agrega entrada e AIMessage; watermarks e ownership; flags de turno; claimed reply burst quando enviará |
| Persistence | saver por graphThreadId; AgentThread/Conversation e flow/usage em caminhos próprios |
| Events | status.started, flow generate, callbacks de uso/status; entrega e cleanup |
| Output | modelo produz texto sem tool_calls; runtime reaplica gates e output guardrail; envia texto/áudio; outcome posted ou supressão |
| Errors | falha de modelo propaga pelo generate; TTS pode cair para texto; falha de envio não é falha idêntica a geração |
| Cleanup | finally limpa mapa in-flight, durable turn ownership e status; rollback seletivo de mensagens em turnos recusados |

Linhas conceituais: `runAgentTurn:2285–2411` elegibilidade/load; `runTurnBody:644–1022` construção; `1258–1563` ingest/fence/checkpoint/gate; `1675–1699` invoke; `1792–2187` decisão/entrega; `2188–2266` finally. Esses intervalos são funções reais, não um fluxograma extraído de README.

## Caso 3 — mensagem que solicita uma ferramenta HTTP

**Hipótese:** “o modelo executa a URL”. **Resultado:** modelo retorna nome+args; runtime seleciona e executa função preparada no servidor, com contexto e credenciais separados. [E11–E15](evidence-ledger.md#e 11).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | mesmo Caso 2; em graph agentNode o modelo retorna AIMessage.tool_calls |
| Input object | exemplo conceitual `{id:'call_1', name:'consultar_cep', args:{cep:'01001000'}}`; schema/name reais vêm da definição selecionada |
| Validation | seleção de tool autorizada na config; dedupe; fence do lote; precondition antes do inner invoke; Zod valida args dentro StructuredTool |
| Transformations | ai fields + fixed/context fields; path interpolation codificada; headers/body/query; credencial injetada servidor; URL/origin/host/SSRF |
| Objects instantiated | tool closure no build; ToolNode no graph; runtime config com toolCallId; request e ToolMessage |
| Functions invoked | agentNode → toolsCondition → toolsNode → ToolNode.run/runTool → guarded.invoke → inner.invoke → failableTool callback → fetchBounded |
| LLM request | primeiro request anuncia description/schema via bindTools; segundo inclui AI tool call e ToolMessage correlacionada |
| State mutation | AIMessage/ToolMessage entram no checkpoint; ferramenta pode alterar sistema externo; optional appointment tracking/local flow |
| Persistence | checkpoint separado de side effect; não há ToolCall row genérico transacional neste fluxo |
| Events | tool callbacks start/end/error; flowlog; ack opcional antes da operação; efeitos auxiliares específicos |
| Output | response template ou corpo limitado, prefixado por HTTP status; status esperado pode ser resultado normal |
| Errors | missing arg corrigível vs missing secret/config; timeout/DNS/status; ToolFailure status error; exceção ordinary normalizada por ToolNode |
| Cleanup | fetch bounded/timer cleanup nas helpers; tool scope termina; runtime continua até decisão final/failure; nenhum rollback HTTP genérico |

Ordem crítica: a precondition envolve `invoke`, então ela pode recusar antes de a validação inner executar; o builder ainda expõe o schema original. Se precondition permite, `StructuredTool` parseia **antes** da função que faz efeito. Dizer simplesmente “o LLM valida” é incorreto. [precondition:49–94](sources/agents/src/graph/tools/precondition.ts), [dependência](dependency-runtime.md).

Para CODE, substitua transporte pela fila → Worker → QuickJS → corpo armazenado; limites 20k chars código, 32k input, 64k contexto, 1 s, memória 32 MiB, stack 256 KiB. Para MCP, servidor oferece tools, subset e namespace são aplicados, invocation passa pelo adapter; OAuth e cache são por conexão/tenant. Credenciais e permissões do servidor externo são fronteira adicional, não herança automática das do usuário humano.

## Caso 4 — “executar um agente com skill”

**Hipótese:** “agents-skills é carregado ao iniciar o turno”. **Resultado:** não há esse caminho nas fontes inspecionadas. O caso deve ser reformulado como **autoria guiada por skill, seguida de execução normal**. [E34–E36](evidence-ledger.md#e 34).

| Etapa | Evidência / limite |
|---|---|
| Initial caller | assistente de implantação/desenvolvimento/operação externo; seleção automática do host é UNKNOWN |
| Input object | SKILL.md e referências + dados fornecidos pelo operador; sample JSON opcional |
| Validation | instruções prescrevem preview/aprovação; MCP runtime valida args/schema/role/scopes; host cumprimento da instrução não comprovado |
| Transformations | assistente adapta configuração/prompt; `agentImport` traduz export; `promptSet` altera prompt; grants por agentToolsSet |
| Objects instantiated | no Agents, Agent/config e componentes importados; não Skill runtime |
| Functions invoked | instrução B → cliente MCP externo → servidor MCP A → write-agents.agentImport/agentCreate ou write.promptSet → serviços de domínio |
| LLM request | eventual LLM do assistente externo é UNKNOWN; após configuração, request do atendimento segue Caso 2 |
| State mutation | prompt/settings/tools gravados por API/MCP; scripts podem administrar infraestrutura se executados pelo operador |
| Persistence | configuração Agents; arquivos do pacote no host externo; ausência de Skill row observada |
| Events | audit das mutações e eventuais eventos normais de configuração |
| Output | agente configurado/importado ou código/infra alterados; nenhuma saída runtime atribuível a skill_id |
| Errors | import inválido/refs/credenciais/scopes; procedimentos descrevem cuidados, mas não engine de retry de skill |
| Cleanup | transações dos serviços; lifecycle do host/CLI externo UNKNOWN |

Código de ponte real: [mcp/write-agents.ts:316–387](sources/agents/src/modules/mcp/write-agents.ts) valida export, faz rehearsal e aplica import; [server.ts](sources/agents/src/modules/mcp/server.ts) registra tools e transport; [write.ts](sources/agents/src/modules/mcp/write.ts) implementa promptSet. As palavras “dry-run” no pacote B são corroboradas por ramos de código do MCP, mas não constituem aprovação geral de ferramentas de atendimento.

## Caso 5 — múltiplas etapas

**Hipótese:** “há workflow porque há várias chamadas”. **Resultado:** há loop agent/tools no turno e automações específicas via jobs, mas não se demonstrou engine de workflow de negócio genérica/versionada. [E09](evidence-ledger.md#e 09), [E21](evidence-ledger.md#e 21).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | runtime cria grafo; graph START → agent |
| Input object | estado MessagesAnnotation, tools, limits, stillWanted, callbacks, fallback |
| Validation | cada hop normaliza histórico; cada tool valida próprios args; fence antes do lote |
| Transformations | janela/contexto; tool-call count desde último Human; instrução soft/hard; protocolo skip_reply |
| Objects instantiated | grafo/ToolNode por turno; ToolMessages por resultado; mesmas closures compartilhadas por hops |
| Functions invoked | agent → toolsCondition → tools → agent, até END/cancel/error |
| LLM request | em cada hop, novo SystemMessage + observações acumuladas; depois do hard limit, binding reduzido/sem tools |
| State mutation | sequência de AI/Tool messages; flag fallback sticky; cancel tool boundary; handoff/attachments por efeito |
| Persistence | checkpoints entre supersteps; efeitos externos já executados não são revertidos por erro posterior |
| Events | geração/tools/usage/status por iteração |
| Output | resposta final, silêncio ou stand-down; limite não define plano de negócios versionado |
| Errors | falha em hop posterior pode deixar hop anterior persistido e side effect concluído |
| Cleanup | runtime finally; política de scheduler caso caller seja job; sem compensação genérica |

`ToolNode` pode executar chamadas do mesmo hop em paralelo. O teto é verificado contando resultados depois da chamada anterior: não reservar antecipadamente quota atômica por tool. [INFERENCE, MEDIUM] Um lote maior que o saldo pode exceder o teto de efeitos antes do próximo check; a conclusão de algoritmo não é teste de side effect de produção.

## Caso 6 — recuperar/persistir contexto e compactar memória

**Hipótese:** “o banco guarda a mesma lista que foi enviada ao modelo”. **Resultado:** falso quando janela limita input; compactação é operação persistente distinta. [E19](evidence-ledger.md#e 19), [E20](evidence-ledger.md#e 20), [E31](evidence-ledger.md#e 31).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | turno: buildModelAndGraph → getCheckpointer; compactação: scheduler MEMORY_COMPACT |
| Input object | graph thread tenant:instance:ci:contactInbox, fallback tenant:instance:conversation; job informa escopo/atendimento |
| Validation | tenant-prefix nos entrypoints pertinentes; enabled/reopened/busy; IDs do prefixo antes do rewrite |
| Transformations | turno só recorta input; compactor seleciona attendance fechada, filtra transcript, resume, gera head com summaries |
| Objects instantiated | PostgresSaver/pool singleton; graph state accessor; modelo summarizer; HumanMessage head + RemoveMessage |
| Functions invoked | getState/invoke; runMemoryCompact → summarizeAttendance → upsert summary → fila → getState → updateState |
| LLM request | turno recebe head histórico; summarizer recebe SystemMessage específico + transcript limitado |
| State mutation | summary novo; substituição seletiva de prefixo; mensagens novas preservadas; watermarks/leases administrados separadamente |
| Persistence | AttendanceSummary antes de rewrite de checkpoint; commits diferentes |
| Events | job/flowlog/memory stages; error de resumo deixa thread intacto |
| Output | memória compactada para próximos turns; não precisa produzir mensagem pública |
| Errors | model fail, busy, prefix changed, reopened, DB fail; adia/falha conforme ramo; reutiliza resumo já salvo quando aplicável |
| Cleanup | fila/lease termina; job completa/reagenda/falha; não se inventa atomicidade entre stores |

Sem DB, testes de rewrite distribuído não foram executados nesta pesquisa. Testes de seleção de histórico e summarizer com modelos scripted foram executados no recorte. Isso sustenta contrato local, não elimina risco de race persistente.

## Caso 7 — falha de LLM

**Hipótese:** “qualquer erro dispara fallback e o cliente sempre recebe resposta”. **Resultado:** fallback é seletivo e pode falhar; entrega depende de estado da conversa. [E32](evidence-ledger.md#e 32), [E06–E07](evidence-ledger.md#e 06).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | agentNode → runModelCall |
| Input object | closure invoke primary, labels, callbacks; fallback opcional utilizável |
| Validation | providerFailure/statusOf/empty completion; disponibilidade de credencial de fallback |
| Transformations | erro normalizado; classificação timeout/transient; labels/uso passam a indicar modelo efetivo |
| Objects instantiated | erro/ProviderFailure; fallback model já preparado quando configurado; closure sticky do turno |
| Functions invoked | primary.invoke → classifier → fallback.run se elegível; onFallback/onFallbackFailed; else throw |
| LLM request | primary; possivelmente fallback para mesmo contexto com adaptação de provider; não retry irrestrito de 401/config |
| State mutation | checkpoint de hops anteriores pode permanecer; fallbackHasTheTurn=true após failover |
| Persistence | runtime catch examina checkpoint para saber se inputMessageId já foi folded in; callbacks registram falha/uso |
| Events | flow generate error, fallback/retry callbacks, logs; nota privada/failed-turn por caminhos específicos |
| Output | fallback pode produzir resultado; se falha, turno pode terminar sem resposta pública; handoff pendente pode ter sido entregue |
| Errors | fallback relança se falhar; caller delivery/job administra retry/failed state; não repetir como se nenhum efeito tivesse ocorrido |
| Cleanup | finally termina status/inflight/lease; erro de cleanup é warning conforme ramo |

É importante separar **retry do transporte/modelo**, **retry de turno pelo job** e **reentrega de webhook**. São budgets e identidades diferentes; um único contador genérico esconderia duplicação de efeitos.

## Caso 8 — falha de ferramenta

**Hipótese:** “erro de ferramenta aborta sempre o grafo”. **Resultado:** normalmente vira observação ao LLM; alguns efeitos podem ter ocorrido antes. [E15](evidence-ledger.md#e 15), [E37](evidence-ledger.md#e 37).

| Etapa | Trajeto observado |
|---|---|
| Initial caller | ToolNode.runTool após AI tool_calls |
| Input object | name/id/args; tool runtime config; estado de conversa nas closures |
| Validation | desconhecida → erro; schema inválido → ToolInputParsingException; precondition pode recusar sem executar |
| Transformations | ToolFailure vira ToolMessage error; exceção ordinária vira texto `Error...` pelo ToolNode; recusa de precondition é normal ToolMessage |
| Objects instantiated | erro ou marker ToolFailure; ToolMessage correlacionada |
| Functions invoked | tool.invoke → wrapper/func → falha; catch ToolNode ou retorno failableTool; graph próximo agent |
| LLM request | próxima rodada inclui erro/recusa; modelo escolhe corrigir, tentar outra ação ou responder |
| State mutation | ToolMessage persistida; side effect remoto talvez já concluído; handoff pode já ter mudado status |
| Persistence | checkpoint e logs; sem rollback genérico de operação externa |
| Events | tool error vs refusal info/warn; side-effect phase log em handoff |
| Output | resultado de erro ao modelo ou resultado parcial apresentado como sucesso por ferramenta específica |
| Errors | GraphInterrupt especial é relançado pela biblioteca; isto não prova uso de human-approval interrupt pelo app |
| Cleanup | função/tool recursos locais; runtime continua ou finally se erro propaga |

Contrato demonstrado por `tool-failure.test.ts`: mesma mensagem, status error, id/nome preservados; chamada plain args retorna string. Contrato de handoff em `tools.test.ts`: assignment pode falhar depois de status aberto, ainda retornando handoff e registrando fase assign. Esse achado exige `effect_state` explícito na proposta.

## Reconstrução do request — o que sabemos e o que não sabemos

[CODE] Forma abstrata real do input de grafo em runtime.ts:1675–1699:

```text
graph.invoke(
  { messages: [optional HumanHandbackMessage,
                HumanMessage(id=inputMessageId,
                             content=renderedText,
                             additional_kwargs=conversationStamp)] },
  { configurable: { thread_id: graphThreadId },
    callbacks: [usage/langfuse..., status, toolLogger] }
)
```

[CODE] Forma abstrata real do request do agentNode após ler state:

```text
modelWithSelectedTools.invoke([
  SystemMessage(compiledPromptForThisHop),
  ...normalizedAndWindowedCheckpointMessages
])
```

[INFERENCE, HIGH] Exemplo didático compatível, **não dump de rede**, segundo hop de uma consulta:

```text
system: <prompt efetivo + grounding se habilitado + attrs/agenda + MCP + budget>
human: Qual é o endereço para este CEP?
assistant: tool_calls=[{id: call_1, name: consultar_cep, args: {cep: ...}}]
tool: tool_call_id=call_1, status=success, content="HTTP 200\n..."
tools: [schemas e descriptions previamente selecionados]
```

Metadata de conversationStamp é usada pelo app/checkpointer; sua tradução exata para cada wire não deve ser presumida. Model adapters podem remover/transformar campos, mudar endpoint e tratar content blocks. Somente execução instrumentada por provider permitiria produzir payload HTTP real completo e comparar bytes sem expor segredos. Isso permanece UNKNOWN, não substituído pelo exemplo acima.
