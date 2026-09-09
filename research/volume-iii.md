# Volume III — Architectural Synthesis

Este volume faz a passagem de evidência para decisão. `[CODE]/[UI]` identifica o padrão observado; `[INFERENCE]` interpreta sua consequência; `[PROPOSAL]` redesenha para o produto independente. O índice/testes não autorizam copiar garantias não demonstradas.

## 45. Essential principles discovered

### P01 — configuração não é execução

Observed pattern: [CODE] Agent row → LoadedAgentConfig → modelos/tools/grafo por turno. Problem being solved: reusar uma definição comercial em conversas diferentes. Mechanism: loader resolve referências/contexto, builders instanciam objetos efêmeros. Strength: construção centralizada. Weakness: referências mutáveis dificultam replay exato. Hidden coupling: settings, grants, prompt, modelos e credenciais resolvidos em momentos específicos. Scaling implications: custo de montagem/MCP pode crescer por turno; cache precisa conhecer tenant e versão. Reusable concept: separar definição, snapshot e run. Recommended redesign: [PROPOSAL] AgentVersion imutável + Deployment com revision + dependency lock persistido no Run. [E02](evidence-ledger.md#e 02), [E05](evidence-ledger.md#e 05), [E08](evidence-ledger.md#e 08).

### P02 — geração e entrega são operações distintas

Observed pattern: [CODE] runtime gera, revalida ownership e só então envia; anexos/TTS/handoff têm caminhos próprios. Problem being solved: humano assume conversa enquanto LLM está em voo. Mechanism: flags/fences/watermarks/claims e outcomes parciais. Strength: evita algumas respostas obsoletas. Weakness: checkpoints e envio remoto não são atômicos. Hidden coupling: IDs e semântica Chatwoot. Scaling implications: múltiplos workers exigem fencing persistente, não só closures. Reusable concept: decisão do agente não é comprovante de entrega. Recommended redesign: [PROPOSAL] MessageIntent + MessageDeliveryAttempt + owner epoch, e `run.completed` distinto de `message.delivered`. [E04](evidence-ledger.md#e 04), [E07](evidence-ledger.md#e 07).

### P03 — merge único de ferramentas é ponto de política

Observed pattern: [CODE] várias origens convergem antes de bindTools; precondition aplicada depois de dedupe. Problem being solved: comportamento comum sem duplicar guard por adapter. Mechanism: wrapper de invoke preserva schema e evita callbacks duplos. Strength: ponto único de enforcement. Weakness: regras por nome e dedupe silencioso parcial reduzem clareza. Hidden coupling: nomes em prompt/preconditions/integration instances. Scaling implications: catálogo grande aumenta schemas, tokens e latência de discovery. Reusable concept: normalize → authorize → expose → execute. Recommended redesign: [PROPOSAL] ToolBinding com identidade estável e alias único, validação de conflito antes de publicação e executor com política determinística. [E11](evidence-ledger.md#e 11), [E18](evidence-ledger.md#e 18).

### P04 — uma recusa não é uma falha de infraestrutura

Observed pattern: [CODE] precondition retorna recusa normal; ToolFailure tem status error; handoff pode ser parcial. Problem being solved: não paginar operador por regra funcionando nem mascarar erro real. Mechanism: observações distintas e side-effect phase logs. Strength: separa decisão de falha. Weakness: nem toda tool distingue parcialidade no resultado ao LLM. Hidden coupling: status textual/status técnico e ToolFlowLogger. Scaling implications: retries sem taxonomia duplicam efeitos. Reusable concept: outcome e effect_state separados. Recommended redesign: [PROPOSAL] result discriminado `success/refused/failed/unknown_effect`, com `none/committed/partial/unknown` para efeitos, código estável e orientação de retry. [E15](evidence-ledger.md#e 15), [E37](evidence-ledger.md#e 37).

### P05 — contexto enviado não é todo estado persistido

Observed pattern: [CODE] janela de input não remove checkpoint; compactor faz rewrite separado. Problem being solved: histórico crescente encarece chamadas sem perder todo contexto. Mechanism: estimativa e cortes por fronteira humana; summaries com prefix verification. Strength: preserva protocolo e separa custo de persistência. Weakness: budget ignora system/tools e resumo é lossy. Hidden coupling: markers e timestamps de attendance. Scaling implications: storage cresce independentemente do contexto; compaction concorre com turns/ingest. Reusable concept: context compiler com políticas explícitas por fonte. Recommended redesign: [PROPOSAL] manifest de contexto, budget total por provider, provenance e summaries não destrutivos sobre eventos originais sujeitos à retenção. [E20](evidence-ledger.md#e 20), [E31](evidence-ledger.md#e 31).

### P06 — conhecimento remoto não deve virar autoridade

Observed pattern: [CODE] MCP server instructions são anexadas ao SystemMessage. Problem being solved: fornecer protocolo/contexto de ferramenta ao modelo. Mechanism: discovery + getInstructions + concatenação. Strength: integração descritiva flexível. Weakness: conteúdo de terceiro entra em nível privilegiado. Hidden coupling: confiança no administrador do MCP e no servidor. Scaling implications: alterações remotas mudam prompts sem release de Agent. Reusable concept: metadata de integração é útil, mas precisa de origem/confiança. Recommended redesign: [PROPOSAL] descriptions aprovadas e versionadas; outputs rotulados não confiáveis; políticas nunca podem ser relaxadas pelo texto; não injetar instruções remotas diretamente como system. [E16](evidence-ledger.md#e 16).

### P07 — skill de autoria não precisa ser skill de runtime

Observed pattern: [DOC + CODE] B guia implantação/configuração e possui scripts/templates/samples; A executa a configuração resultante. Problem being solved: repetir setup e operação especializados. Mechanism: pacote de instruções consumido por assistente externo, seguido de MCP/API/script. Strength: reutiliza conhecimento operacional sem acoplar pacote ao atendimento. Weakness: procedimentos podem divergir do código, como allowlist vazia. Hidden coupling: versões do sample, MCP e app. Scaling implications: governança de conteúdo e compatibilidade substitui problemas de throughput. Reusable concept: pacote de capacidade/autoria com artefatos versionados. Recommended redesign: [PROPOSAL] distinguir AuthoringRecipe de RuntimeSkill; no CRM, SkillVersion declarativa compilada em dependências permitidas, sem scripts de SSH como capacidade de atendimento. [E34–E36](evidence-ledger.md#e 34).

### P08 — scheduler não é workflow engine

Observed pattern: [CODE] jobs duráveis, registry e handlers especializados. Problem being solved: debounce/follow-up/memory/recovery fora do request. Mechanism: DB claims+reaper+backoff e dispatcher. Strength: pouca infraestrutura adicional. Weakness: lógica de dependência/espera fica nos handlers; runtime app e job lifecycle crescem juntos. Hidden coupling: tipos de job, gates de conversa e configuração atual. Scaling implications: fairness, polling e hot rows. Reusable concept: tarefas diferidas têm identidade, estado e ownership persistidos. Recommended redesign: [PROPOSAL] iniciar com contratos duráveis mínimos, mas usar engine durável para workflow arbitrário e espera humana; não chamar cron de workflow. [E21](evidence-ledger.md#e 21).

### P09 — realtime é projeção, não fonte da verdade

Observed pattern: [CODE] publisher Bun local; logs assíncronos; outbound deliveries separadas. Problem being solved: atualizar UI e integrar sistemas. Mechanism: três caminhos com garantias distintas. Strength: simplicidade e baixa latência local. Weakness: reconnect/fanout/replay não são resolvidos por publish local. Hidden coupling: processo que recebe mutação e conexões nele. Scaling implications: duas réplicas já mudam a topologia. Reusable concept: evento durável antes de fanout. Recommended redesign: [PROPOSAL] outbox transacional, cursor de delivery, projeção reconciliável no cliente; nunca tratar token de LLM transmitido como mensagem entregue. [E23–E25](evidence-ledger.md#e 23).

### P10 — contexto comercial e ownership precisam estar na UX

Observed pattern: [UI] CRM-Modelo mostra conversa/contato/negócio e humano/IA juntos; automação tem input/config/output. Problem being solved: operador precisa entender quem age e com quais dados. Mechanism: painéis contextuais, banner e preview de nó. Strength: reduz navegação e torna ação situada. Weakness: densidade e ausência visível de autoridade/proveniência em certos assets. Hidden coupling: nomes de contatos podem ser ambíguos; tabs não garantem estado backend. Scaling implications: grandes listas/dados sensíveis exigem paginação e escopo por campo. Reusable concept: IA opera sobre os mesmos objetos do humano, com responsabilidade identificável. Recommended redesign: [PROPOSAL] usar contexto compartilhado e controles de aprovação/timeline; manter design visual próprio. [SYN-04/05/09/10](volume-ii.md).

## 46. Implementation-specific decisions

[CODE] São decisões particulares de A, não propriedades essenciais de agentes: Bun/Elysia; LangGraph de dois nós; PostgresSaver em schema separado; thread derivado de IDs Chatwoot; 13 natives padrão; exports JSON formato1; `vault:<id>`; compactação de attendance em até 20 summaries; CODE QuickJS em Worker; regra específica de reasoning OpenAI; NATIVE ausente concede defaults. [E09](evidence-ledger.md#e 09), [E13](evidence-ledger.md#e 13), [E17](evidence-ledger.md#e 17), [E19](evidence-ledger.md#e 19), [E30](evidence-ledger.md#e 30).

[PROPOSAL] Reutilizar os problemas que essas escolhas resolvem, não os valores/nomes como dogma. O CRM novo não usará IDs externos como PK de domínio nem herdará default permissivo de tools. Limites serão políticas medidas e versionadas.

## 47. Strengths of analyzed architecture

[INFERENCE, HIGH] A demonstra cuidado operacional além do loop LLM: late ingest, handback, ownership, silêncio, partial delivery, tool effects, tenant scope, compaction protegida, classificação de provider errors e numerosos testes regressivos. Essas forças são sustentadas por branches e assertions concretas, não pela existência de pastas “guardrails” ou “memory”. [Volume I, §§8–25](volume-i.md).

[INFERENCE, MEDIUM] B reduz fricção de operação ao associar procedimentos a samples/scripts e ao recomendar preview. A correspondência de arquivos com A pode reduzir drift em parte do conteúdo; a contradição da allowlist prova que esse benefício não é garantia. [§13–14](volume-i.md).

[UI] CRM-Modelo fornece evidência de integração de tarefas comerciais e atendimento numa experiência coerente; não se transforma essa observação em avaliação de confiabilidade ou escalabilidade técnica. [Volume II](volume-ii.md).

## 48. Weaknesses

| Fraqueza delimitada | Evidência | Consequência arquitetural |
|---|---|---|
| Configuração mutável sem dependency snapshot de run | Agent schema + loader | replay e explicação histórica incompletos |
| Runtime de atendimento muito concentrado | runtime.ts + webhook.ts call chains | mudanças em entrega/gates podem repercutir em múltiplos triggers |
| Efeitos distribuídos sem commit único | graph vs Chatwoot vs local state | partial/unknown exige protocolo explícito |
| Controles de falha abertos em pontos sensíveis | tool boundary e analyzer | disponibilidade e segurança têm tradeoff diferente em cada gate |
| Instruções externas elevadas no prompt | MCP section | superfície de injection privilegiada |
| Métrica de token não cobre request inteiro | history-window/token-count | limite operacional não impede context overflow total |
| Workflow de negócio não generalizado | handlers específicos; schema | ampliar casos exige novo código/estado especializado |
| Realtime local e log best-effort | publisher/flowlog | não sustenta replay/fanout sozinho |

Não se afirma que o produto falhe em produção por causa desses pontos. São propriedades observáveis e riscos derivados, com validação pendente onde indicado.

## 49. Coupling

[CODE] Acoplamento dominante: Chatwoot define inbox, contato, conversa, status, ownership, webhook, bot identity e entrega; runtime e native tools materializam essas APIs. Trocar apenas o cliente HTTP não cria CRM independente: é preciso substituir domínio, identity mappings, messaging e gates. [E03–E07](evidence-ledger.md#e 03), [E37](evidence-ledger.md#e 37).

[INFERENCE, HIGH] Outros acoplamentos: nomes de tools atravessam prompt/grant/precondition; provider details atravessam model config/factory/context filtering; markers de mensagens conectam ingest/handback/compactação; PostgreSQL app e checkpoint têm papéis/contratos diferentes. Blueprint precisa explicitar essas fronteiras como contratos, não recriar o mesmo emaranhado com novos nomes.

## 50. Scaling considerations

| Dimensão | Gargalo/race inferível | Medição necessária antes de decidir infraestrutura |
|---|---|---|
| Turns concorrentes | pools Prisma/pg, provider semaphore, MCP discovery | queue delay, pool wait, active calls, p95 por tenant |
| Conversa quente | diversos eventos/ingest/send/compact sobre mesmo thread | conflitos, retries, response superseded, duplicate effect |
| Contexto crescente | tokens/schema/tool outputs | bytes e tokens por fonte; taxa de overflow |
| Jobs | polling/claims/reaper/fairness | oldest job age e starvation por tipo/tenant |
| Múltiplas réplicas | publisher local; filas locais não globais | delivery de evento cross-instance e races de ownership |
| Conhecimento | embedding calls/index e isolamento | retrieval recall e filtros antes de scoring |
| Logs e usage | writes assíncronos e volume | loss rate, backpressure, retenção/custo |

[PROPOSAL] Nenhum desses requisitos obriga Kafka, Redis ou Kubernetes desde o primeiro dia. Primeiro estabelecer consistência, SLOs e métricas; adicionar componente quando seu requisito e sua recuperação estiverem especificados.

## 51. Reusable abstractions

[PROPOSAL] Abstrações mínimas justificadas: immutable definition; deployment binding; run/step/checkpoint; execution principal; context manifest; tool binding/policy/result; delivery intent/receipt; conversation ownership epoch; domain event/outbox; reusable skill package; durable workflow; memory provenance; tenant-scoped resource reference; provider capability descriptor.

Cada uma corresponde a um problema visto: configuration drift, partial effect, ambiguity of ownership, truncated context, mixed tool origins, local realtime ou authoring/runtime mismatch. Não são entidades criadas apenas porque nomes constavam na missão; o dicionário do Volume IV renomeia e elimina redundâncias.

## 52. Concepts to avoid copying

[PROPOSAL] Não copiar:

- domínio CRM subordinado a IDs/status de outro CRM;
- permissão de tools por ausência de registro;
- nomes de tools como identidade única durável;
- `SKILL.md` administrativo/SSH como pacote executável de cliente;
- conhecimento/resultado remoto promovido a system authority;
- um campo `success=true` que esconde partial effect;
- log assíncrono como registro de execução ou ledger financeiro;
- default de retry de workflow que repete writes sem chave/reconciliação;
- “memória” como sinônimo de qualquer dado disponível;
- UI/branding/assets proprietários ou telas não observadas;
- algoritmo de score/política de canal inferidos de marketing;
- garantias de bibliotecas não verificadas na versão instalada.

A partir do próximo volume, toda arquitetura é **proposta para produto novo**, não descrição de A ou B.
