# Volume V — Engineering Plan

**[PROPOSAL] Plano para implementar o produto novo.** Decisões abaixo são propostas técnicas fundamentadas nos requisitos/achados, não alterações realizadas no código-fonte dos projetos pesquisados. Não há autorização implícita para contratar serviços ou implantar produção.

## 79. Architecture decisions

### ADR-01 — domínio próprio, monólito modular e processos especializados

Requirement: CRM/messaging próprios, transações coerentes e equipe capaz de evoluir sem custo inicial de dezenas de serviços. Candidate: um código modular com API/realtime, workers de execução e ingestão em processos/deploys separados. Why: preserva ownership de domínio e simplifica operações transacionais. Tradeoffs: fronteiras precisam de testes para não virar imports/SQL cruzados livres; escala por componente tem granularidade limitada. Alternatives: microsserviços por domínio; monólito único sem workers separados. Lock-in: baixo de infraestrutura, moderado de desenho interno. Operational cost: baixo/médio comparado a malha de serviços. Decision: baseline aprovado como proposta; dividir serviços somente por requisitos medidos de isolamento/carga/equipe, não por nome de módulo.

### ADR-02 — persistência transacional

Requirement: atomicidade de estado+evento, integridade entre tenants, CAS, jobs e consultas comerciais. Candidate: PostgreSQL em versão suportada, com escopo composto, papel runtime restrito e RLS. Why: satisfaz requisitos relacionais e permite outbox sem segundo banco obrigatório. Tradeoffs: RLS exige disciplina de papel/contexto e testes; vetores/jobs/analytics podem competir com OLTP. Alternatives: outro banco relacional com enforcement equivalente; banco separado por tenant em tiers específicos. Lock-in: moderado em SQL/RLS/vector; domínio não exporta ORM. Operational cost: médio com HA/backups, sobe com isolamento dedicado. Decision: PostgreSQL baseline; versão e serviço físico fixados em ADR operacional após restore/load spike. Não assumir que RLS cobre owner/BYPASSRLS. [Documentação primária](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

### ADR-03 — runtime do backend

Requirement: APIs e adapters assíncronos, ecossistema TypeScript, suporte previsível, CPU pesada fora da API. Candidate: Node.js LTS + TypeScript; HTTP framework escolhido por spike de contratos/observability/streaming. Why: runtime estável de integração, sem necessidade de herdar Bun do projeto observado. Tradeoffs: não presumir vantagem de throughput; parsers/conversões precisam de workers/processos. Alternatives: Bun/Elysia, Go, JVM, Python com workers — exigem avaliação de equipe e bibliotecas. Lock-in: moderado no ecossistema TS, menor se DTOs/domínio não dependerem do framework. Operational cost: baixo/médio; dependente do perfil de I/O e workers. Decision: Node LTS como baseline de referência, sem pin patch neste documento; CI deve fixar release suportada. Em 9/9/2026 a página oficial lista Node 24 como LTS e 26 como Current; produção não deve escolher Current só por ser maior. [Releases oficiais](https://nodejs.org/en/about/previous-releases).

### ADR-04 — durabilidade de agents e workflows

Requirement: sobreviver a restart durante LLM/tool, esperar aprovação/evento e impedir retry cego de efeito. Candidate: Temporal para orquestração durável, com activities finas e ledger de domínio próprio. Why: requisitos de timers/esperas/replay seriam caros de construir integralmente. Tradeoffs: infraestrutura/serviço adicional, disciplina de determinismo, history/versioning e dupla integração com banco. Alternatives: engine DB-backed próprio limitado, sem canvas genérico no MVP; outro engine durável com garantias equivalentes demonstradas. Lock-in: médio/alto no SDK/history, reduzido por spec de workflow e activities de domínio independentes. Operational cost: médio/alto self-hosted; gerenciado depende de cotação e volume, não estimado aqui. Decision: arquitetura de referência prefere engine durável; adoção de Temporal condicionada ao spike de restart/approval/replay/unknown-effect antes de live automation. Se não aprovado, restringir escopo em vez de chamar loop em memória de durável. [Workflows](https://docs.temporal.io/workflows), [activities](https://docs.temporal.io/activities), [retry](https://docs.temporal.io/encyclopedia/retry-policies).

Fronteira de autoridade: engine é dono do cursor/timers de orquestração; aplicação é dona de autorização, effects, approvals, budgets e resultados gravados. AgentRun/WorkflowRun expõem projeção operacional com revision/as_of; sincronização por comandos idempotentes e reconciler. Não dois motores decidindo independentemente o próximo efeito. Uma activity repetida primeiro consulta step/effect_key e retorna resultado já salvo; não chama LLM/HTTP de novo se receipt já existe. Janela “provider respondeu, resultado não salvo” exige tratamento explícito — durabilidade do engine não elimina cobrança/efeito externo incerto.

### ADR-05 — frontend

Requirement: inbox interativa, tabelas/kanban, builder versionado, formulários e realtime reconciliável. Candidate: React/TypeScript com routing e query cache definidos em spike; design system próprio acessível. Why: composição de view models e componentes compartilhados de domínio. Tradeoffs: React sozinho não oferece arquitetura de routing/cache e montar do zero pode criar framework ad hoc. Alternatives: Vue/Svelte ou framework React integrado conforme SSR/routing; nenhum escolhido por popularidade. Lock-in: médio na UI; contratos API e domínio independentes. Operational cost: baixo para assets estáticos, maior se adicionar SSR/BFF sem necessidade. Decision: React é baseline candidato; spike deve provar navegação, cache por tenant, conflitos e reconnect antes de consolidar stack. [Tradeoffs oficiais](https://react.dev/learn/build-a-react-app-from-scratch).

### ADR-06 — eventos e realtime

Requirement: state+event atômicos, consumers idempotentes, dois gateways recebendo mudanças e recuperação de gaps. Candidate: outbox/receipts em PostgreSQL + dispatcher; transporte de fanout escolhido por teste. Why: define garantias antes do broker. Tradeoffs: polling/lag/retention/carga e gerenciamento de cursors; feed por usuário pode custar. Alternatives: CDC ou broker durável dedicado; Redis pub/sub apenas para efêmero/fanout com resync, nunca ledger único. Lock-in: baixo no envelope, moderado no transporte. Operational cost: inicial baixo/médio; broker dedicado só com requisito medido. Decision: outbox obrigatória, broker não obrigatório no primeiro slice; teste cross-replica é gate de produção. API de broker/CDC específica ainda não escolhida, portanto não se prescreve configuração de produto sem pesquisa própria.

### ADR-07 — conhecimento, arquivos e busca

Requirement: arquivos grandes/quarantine, busca autorizada e retrieval vetorial com provenance. Candidate: object storage compatível com API S3; texto transacional inicialmente; pgvector como candidato de índice vetorial. Why: separa bytes, metadados e retrieval e reduz quantidade inicial de stores. Tradeoffs: ACL/retention entre stores, migração de embedding e competição com OLTP. Alternatives: storage cloud nativo, search/vector dedicado depois de benchmark. Lock-in: baixo/médio para objetos e metadata; embeddings são reconstituíveis se origem/versionamento preservados. Operational cost: armazenamento+egress+embedding; custos exatos requerem volume/cotação. Decision: modelo lógico aprovado; escolha de serviço e pgvector condicionadas a recall/isolamento/load spike. Não copiar dimensão 1536 do projeto observado como requisito universal.

### ADR-08 — observabilidade e financeiro

Requirement: tracing distribuído, diagnóstico de causalidade, metering confiável. Candidate: OpenTelemetry para telemetry + ledger UsageRecord próprio. Why: troca de backend de traces sem substituir faturamento. Tradeoffs: cardinalidade/PII, overhead/sampling e collectors; tracing amostrado não pode ser fonte financeira. Alternatives: SDK proprietário para traces; logs apenas (insuficientes para correlação completa). Lock-in: baixo no protocolo de telemetry; financeiro independente. Operational cost: proporcional ao volume/retention/sampling; medir antes de enviar prompts inteiros. Decision: OpenTelemetry baseline para spans/links; payloads sensíveis por referência e controles próprios. [Conceitos primários](https://opentelemetry.io/docs/concepts/signals/traces/).

### ADR-09 — ferramentas e credenciais

Requirement: ferramentas de várias origens sem elevação de privilégio e com efeito auditável. Candidate: catálogo versionado, bindings explícitos, policy engine determinístico e broker de credenciais; zero shell do host ao agente. Why: corrige ambiguidade observada entre grants, nome de tool, precondition e partial success. Tradeoffs: mais objetos/UX de aprovação; setup inicial mais exigente. Alternatives: callbacks ad hoc com token em config; rejeitada para writes externos multi-tenant. Lock-in: baixo no contrato ToolResult/schema, médio no executor. Operational cost: broker/policy e eventual sandbox isolado. Decision: obrigatório; nenhuma write tool externa live sem idempotency/reconciliation contract.

### ADR-10 — skills

Requirement: capacidades reutilizáveis sem confundir pacote administrativo e runtime. Candidate: SkillVersion declarativa compilada no AgentVersion; AuthoringRecipe separada. Why: incorpora aprendizado de B sem carregar scripts de implantação em atendimento. Tradeoffs: compatibility resolver, conflitos e UX de instalação. Alternatives: prompts copiados manualmente; plugins de código irrestrito. Lock-in: baixo se manifest exportável, médio no solver. Operational cost: baixo/médio, principalmente governança/evals. Decision: catálogo básico após Agent Core; marketplace público e código arbitrário excluídos do MVP.

## 80. MVP

MVP é um recorte operacional completo, não todas as telas anunciadas. Deve permitir que uma equipe pilote atendimento/vendas com CRM próprio e um agente governado.

| Vertical slice | Entrega mínima | Evidência de aceite |
|---|---|---|
| Tenancy/IAM | org/workspace, login, membership/papéis, API keys restritas | usuário A nunca lê/escreve B por API, query, file, cache ou realtime |
| CRM | contacts/companies, pipeline/deal, task/note/tag | histórico e evento de mudança; conflitos de edição tratados |
| Messaging | webchat ou um canal oficial selecionado, inbox/conversa, anexos básicos, humano responde | receipt durável/dedupe; send status verdadeiro e recovery |
| Agents | draft/version/deployment, um provider adapter validado, prompt/context assembly, runs/steps | versão fixada, custos/timeline, restart e cancel |
| Tools | read de CRM/KB e writes internos limitados (task/note/handoff) | policy/effect receipt; nenhuma tool irrestrita |
| Humano+IA | takeover/devolver, copilot draft e approval mínima | epoch impede próximo envio obsoleto; sem false delivery |
| Operação | logs/trace, audit, quotas, budgets, backup/restore | incident drill e reconciler de efeitos desconhecidos |

Mesmo MVP precisa do ledger de efeitos; pode adiar canvas genérico, mas não inventar atomicidade onde HTTP não oferece. Primeiro canal não escolhido neste documento porque conta/regra/custo/mercado alvo não foram fornecidos. Webchat próprio é alternativa que permite validar domínio sem credencial externa de messaging.

## 81. MVP exclusions

Sem marketplace público de skills; sem execução de código arbitrário pelo cliente; sem browser automation genérica; sem prospecção em massa; sem dezenas de providers/canais; sem voice telephony nativa; sem multi-agent autônomo aberto; sem custom workflow loops ilimitados; sem treinamento de modelos; sem analytics financeiro/atribuição avançados; sem billing monetário automático antes de usage ledger reconciliado; sem multi-região ativo-ativo.

Exclusão não retira IDs/contratos de extensão: Skill/Workflow podem entrar depois sem redesenhar Message, ToolCall e AgentVersion. Segurança, tenant isolation e receipts não são “hardening opcional de fase final”.

## 82. Phase 2

Agent Platform: SkillVersion/installation/resolver; knowledge ingestion com citations e ACL; MemoryFact/summary policies; workflows com branch/wait/approval; schedules/follow-up e causal loop protection; segundo provider/canal por contract tests; catálogo MCP governado; avaliações comparativas de versões; analytics de run/tool/conversão com causalidade limitada e explícita.

Gate: MVP demonstrou ownership/race/restart e metering. Publicar skill não pode ampliar grant sem revisão; publicar workflow não altera run suspenso; deletion de documento retira retrieval sem esperar expurgo completo. Canvas pode ser introduzido quando spec/engine/API já forem testados, não antes.

## 83. Phase 3

Production Hardening ampliado: SLOs contratuais, HA/restore automatizado, observability de custo e fairness, billing integrado, quotas por plano, retention/deletion export, audit avançado, conectores adicionais, sandbox de código segregado se houver demanda validada, read models analíticos dedicados, opções de isolamento premium e multi-região apenas após requisito real.

Segurança/observability começam na Foundation e são aprofundadas aqui. Nenhum cliente piloto deve depender de “faremos isolamento depois”.

## 84. Dependencies

| Entrega | Depende de | Não deve depender de |
|---|---|---|
| CRM básico | IAM/tenant DB/event contracts | LLM, skill engine ou outro CRM |
| Inbox | Message/Receipt/Channel/Conversation ownership | Agent habilitado |
| AgentRun | Version/Deployment/Principal/Budget/Checkpoint | canvas visual de workflow |
| Tool write interna | commands de domínio/policy/effect ledger | SQL gerado pelo LLM |
| Tool externa | Connection/CredentialBinding/egress/reconciliation | segredo no prompt |
| Skill | versões estáveis de tools/prompts/policies | scripts administrativos de B |
| Workflow | step durability/waits/approvals/idempotency | browser aberto |
| Realtime multi-replica | outbox/envelope/cursors/auth | memória local única |
| Billing | usage source IDs e reconciliação | callback de trace amostrado |
| Analytics de efeito comercial | eventos CRM e autoria | mera contagem de respostas LLM |

Dependências externas a resolver com o responsável do produto: canal/conta piloto, modelo/provider e região de dados, autenticação corporativa desejada, orçamento operacional, SLOs comerciais e política de retenção. Até lá, testes usam dados sintéticos e adapters locais.

## 85. Technical risks

| Risco | Impacto | Probabilidade inicial | Mitigação / experimento de decisão |
|---|---|---|---|
| Activity repetida duplica side effect | alto | alta sem contrato | fault injection antes/depois de provider acceptance e DB commit |
| Config drift em run | alto | alta com refs mutáveis | hash lock e rejeição de versão alterada |
| Dois donos da orquestração | alto | média | engine cursor vs domain effects documentados; reconciler testado |
| Contexto ultrapassa limite | médio/alto | alta com tools/KB | orçamento total e fixtures com tool schemas longos |
| Provider capabilities mudam | médio/alto | média | capability canary e adapter contract tests |
| Workflow loops/causalidade | alto | média | bounded loops, dedupe e limit de cadeia |
| Front cache/realtime mistura scope | crítico | média | switch-workspace/reconnect negative tests |
| Event schema quebra consumidor | médio | média | compat tests e dual-version rollout |
| Migração replay incompatível | alto | média | replay corpus de histories antes de deploy |
| Falhas locais dos testes A mal interpretadas | médio para pesquisa | presente | manter logs; não herdar “suíte verde” nem diagnosticar tudo como ambiente |

## 86. Security risks

Prioridade P0: cross-tenant data, credenciais fora de scope, write sem policy, aprovação reusada com args diferentes, SSRF para metadata, código de cliente no host, takeover sem fencing. P1: malicious tool output, prompt injection com data exfil, leak em traces/previews, duplicação de efeito após timeout, índices/search desatualizados após revoke.

Plano de validação: dois tenants com registros homônimos/IDs semelhantes; principal de agente menos privilegiado que operador; servidor MCP malicioso sintético; HTTP endpoint com redirects/DNS variáveis em rede de teste; docs com instruções adversariais; alteração de policy/credential/owner durante aprovação. Sem pentest ofensivo em serviços de terceiros.

Gate de segurança: nenhuma autorização baseada apenas em prompt; nenhuma credencial em model context; nenhum recurso de outro tenant em resultados/counts/snippets; nenhuma destructive action sem action-specific approval; eventos/logs não carregam segredos. Falha em qualquer gate bloqueia live execution daquela capability.

## 87. Scaling risks

Medir hot conversation contention, queue starvation, fanout de eventos, volume de transcript/tool output, egress de arquivos, cardinalidade telemetry, embedding throughput e tempo de restore. Quota por tenant impede um workflow infinito saturar todos. Backpressure retorna estado queued/throttled e retry_after, não faz memory buffer ilimitado.

Escala horizontal de API exige fanout/reconnect e cache scoped; de workers exige fencing/receipts; do DB exige índices/partições/read models; do knowledge exige filtro ACL eficiente. “Adicionar réplica” sem esses contratos não é plano de escala.

Load test proposto: ramp de 1→50 msg/s, burst200/s, um tenant com 80% da carga, uma conversa recebendo sequência concorrente, provider com latência/picos429/503 e janela de conexão interrompida. Medir SLIs definidos no §76 e validar invariantes, não apenas requests/s.

## 88. Open questions

| Pergunta | Quem deve decidir / evidência faltante | Default provisório |
|---|---|---|
| Segmento comercial inicial e workflow principal | produto/cliente piloto | atendimento e qualificação com task/handoff, sem cobrança autônoma |
| Primeiro canal e fornecedor | acesso à conta/regras/custo | webchat próprio para validação técnica |
| Data region/retention/compliance | responsável de dados e jurídico | não transferir entre regiões sem decisão; dados sintéticos no teste |
| Autenticação corporativa/SSO | clientes alvo | interface de identity adapter, autorização própria |
| Autonomia de writes | negócio/segurança | read e writes internos limitados; externos com aprovação/reconciliation |
| Stack de engine durável | spike operacional/equipe/orçamento | referência Temporal condicionada a gates |
| Ownership de memória entre agentes | produto/finalidade/privacidade | workspace+subject com policy explícita |
| Critério de sucesso da qualificação | cliente/dataset | score com evidências e revisão; nenhuma promessa de conversão |
| Política de efeito desconhecido | integration contract | pausar e reconciliar, não retry cego |
| Cobertura integral dos módulos A | pesquisa adicional/tempo de audit | marcar estrutura vs tracing; não alegar integral manual |
| Testes DB/RLS e providers A | ambiente dedicado e credenciais sintéticas | UNKNOWN dinâmico, fonte estática preservada |
| Áreas privadas CRM-Modelo | acesso autorizado/demo adicional | UNAVAILABLE - DO NOT INFER |

## 89. Implementation sequence

### Foundation

1. ADRs e schema logical review; fixtures de dois tenants; API error/idempotency/event contracts.
2. IAM, membership/principals/policies, banco com isolamento e migrations; object store metadata/quarantine interface.
3. DomainEvent/outbox/receipts e audit; shell frontend org/workspace; query-cache scoping; telemetry mínima.
4. Spike de durabilidade: matar worker em step/approval; replay; effect unknown; escolher engine e congelar contrato.

Exit: tenant negative tests, migration/restore smoke e outbox dedupe passam. Nada externo live.

### CRM Core

5. Contacts/identities/companies e merge controlado; pipelines/stages/deals com history; tasks/notes/tags/custom fields básicos.
6. Conversation/message/participant/attachment/receipt; webchat ou adapter piloto; inbox master-detail e send ledger.
7. Ownership epoch, handoff, delivery reconciliation; realtime cross-replica e reconnect.

Exit: equipe humana opera sem LLM e sem CRM externo; nenhuma mensagem duplicada nos fault cases suportados; unknown cases visíveis.

### Agent Core

8. AgentDraft/Version/Deployment, principals/bindings, provider adapter e ContextManifest.
9. AgentRun/Step/Attempt/checkpoint/budgets, cancel/timeout, model/tool failures.
10. Tool catalogue/read + writes internos delimitados; approval/effect receipts; playground sem efeitos por default.
11. Agent builder/test/deploy/run timeline e copilot interno; eval suite de segurança/contexto/comportamento.

Exit: oito casos análogos ao anexo executados no sistema próprio, incluindo restart/partial/unknown; versões fixadas e custos conciliados.

### Agent Platform

12. Knowledge ingestion/retrieval/provenance; memória versionada/retention.
13. SkillVersion/resolver/install; workflows duráveis/triggers/schedules; canvas input/config/output.
14. Integrações externas versionadas e credenciais; connector contracts; analytics de domínio/agent.

Exit: approved workflow retoma após restart sem duplicar efeito; policy revocation aplicada durante wait; KB deletion elimina acesso.

### Production Hardening

15. SLO/load/isolation drills, HA/restore, DR, rate limits e fairness, audit retention.
16. Billing/usage reconciliation, planos/quotas e alertas; rollout/canary/rollback versionados.
17. Security review independente; operador/documentação de incidentes; piloto controlado antes de autonomia ampliada.

Estimativas de calendário/custo ficam abertas: tamanho/experiência da equipe, canal e infraestrutura não foram informados. A sequência especifica dependências e gates, evitando prazo inventado.

## 90. Acceptance criteria

| ID | Cenário executável no produto novo | Resultado obrigatório |
|---|---|---|
| AC01 | Usuário A tenta ler/write/list/search/file/realtime de B | deny sem existência/PII vazada; audit adequado |
| AC02 | Worker roda sem scope ou com papel privilegiado errado | startup/operation falha segura |
| AC03 | Publicar AgentVersion e editar draft em paralelo | run continua hash original; conflito de draft detectado |
| AC04 | Trocar deployment enquanto run está ativo | só runs novos mudam; antigo registra versão exata |
| AC05 | Mensagem inbound duplicada/reordenada | uma receipt canônica por identidade; ordering/dedupe comprovados |
| AC06 | Crash após ACK inbound | receipt permite recuperar mensagem; zero ACK sem persistência mínima |
| AC07 | Humano assume durante LLM/tool | próximos efeitos/envios revalidam epoch; in-flight incerto exposto |
| AC08 | Tool args inválidos/desconhecida | nenhuma função efetora executada; erro de protocolo rastreado |
| AC09 | Tool read falha transitoriamente | retry limitado com budget; refusal não vira incident indevido |
| AC10 | Tool write aceita e conexão cai antes da resposta | não repetir cego; status unknown/reconcile; receipt confirma efeito |
| AC11 | Worker morre após gravar output antes de engine ACK | replay retorna resultado salvo, não chama provider de novo |
| AC12 | Aprovação muda args/target/policy ou expira | decisão antiga inválida; novo review exigido |
| AC13 | Cancelamento durante wait/LLM/send | sem novos efeitos; terminal só após esclarecer pendências |
| AC14 | Provider429/503/401/schema inválido | classificação correta; fallback só elegível e autorizado |
| AC15 | System/tools/history excedem contexto | budget total respeitado ou falha explícita; política não truncada |
| AC16 | RAG/tool output contém instrução de exfiltração | policy/egress bloqueiam; fixture não recebe secret |
| AC17 | Skill requer grant extra/ciclo/alias duplicado | publicação recusada com explicação de conflito |
| AC18 | Workflow aguarda evento antes/depois de restart | uma resolução; timeout/event/cancel CAS comprovado |
| AC19 | Trigger reage ao próprio efeito em ciclo | limite causal/dedupe contém cadeia e reporta motivo |
| AC20 | Gateway recebe evento duplicado e gap após reconnect | cache converge; resync quando necessário; sem mistura de workspace |
| AC21 | Dois gateways e mutação em réplica diferente | todos clientes autorizados recebem ou ressincronizam |
| AC22 | Delete/revoke de KB/memória com cache/index atrasado | acesso negado imediatamente; expurgo rastreado |
| AC23 | Callback de usage duplicado e retry real de LLM | não duplicar mesmo receipt; contabilizar tentativa extra comprovada |
| AC24 | Collector de trace indisponível | operação degradada conforme policy; ledger/audit obrigatório preservados |
| AC25 | Restore de backup com pending outbox/effects | reconciliação antes de retomar writes; sem replay massivo de envios |
| AC26 | Navegação por teclado/inbox mobile/conflict409 | operação possível e foco correto; draft não perdido silenciosamente |
| AC27 | Nenhum serviço Fazer/CRM-Modelo/Chatwoot disponível | CRM, webchat e Agent Core próprios continuam funcionais |
| AC28 | Operador abre run antigo | versions/context provenance/steps/effects/custo ou expiração explícita, sem interpretação vaga |

Aceite não é checkbox documental: cada AC precisa de teste automatizado ou drill reproduzível com log/receipt, responsável e resultado. Segurança/invariantes bloqueiam release; metas de performance são revistas somente por decisão registrada, não porque teste falhou.
