# agents-skills — composição, execução auxiliar e integração

Fonte: repositório B no commit `3d11c5ff7333dee51b1b764f9e67f407b818684a`. [Inventário integral de arquivos](evidence/skills-inventory.json), [índice por pacote](technical-index.md#índice-do-repositório-agents-skills). `[DOC]` indica intenção prescrita; `[CODE]` indica operação existente nos scripts ou no consumidor Agents. Os scripts administrativos **não foram executados**.

## Definição empírica

Skill é pacote com metadata/instruções e recursos relativos para um assistente externo de autoria/operação. Os três pacotes possuem SKILL.md, guardrails.md, gotchas.md e referências; onboarding acrescenta scripts/templates/samples; operation acrescenta simulação de carga; dev orienta edição de código. Manifest de distribuição declara plugin `agents`, versão1.1.24 e três skills. Não contém engine que transforma esses arquivos em turnos de atendimento. [plugin](sources/agents-skills/.claude-plugin/plugin.json), [marketplace](sources/agents-skills/.claude-plugin/marketplace.json).

| Componente investigado | Existe? | Contrato observado / não presumido |
|---|---|---|
| Metadata | sim | name/description de skill e metadata de pacote; não Agent identity |
| Instructions | sim | procedimentos de setup/dev/operação, inclusive gates de aprovação prescritos |
| Resources | sim | referências, gotchas, guardrails, templates, samples |
| Scripts | sim | Python/TS auxiliares executáveis pelo operador/host |
| Tools | referências a MCP/CLI | não são ToolDefinition concedidas ao agente por instalar skill |
| Examples | sim | exports JSON de agente/import e comandos de operação |
| Dependencies | operacionais/documentais | acesso a serviços/CLI/host; sem dependency resolver runtime de skills encontrado |
| Lifecycle | prescrito | instalar/distribuir → ler → agir via ferramentas externas → validar; host internals UNKNOWN |
| Version | pacote de distribuição | não versão AgentRun nem dependency lock de agente |
| Memória própria | não encontrada | instrução de contexto de trabalho não é store de memória de cliente |

## Caminhos de execução dos recursos auxiliares

### remote.py — exemplo completo, não só nome do script

[CODE, HIGH] CLI `main` parseia flags e chama `read_script`, `remote_command` e `build_argv`. Conteúdo é lido em bytes; fallback traduz caminho MSYS/WSL para Windows; BOM inicial é removido; script vazio é recusado. Nome de container e comando in-container são validados antes da montagem. `build_argv` retorna lista direta para ssh; payload segue stdin de `subprocess.run`, não interpolado no comando local. Capture/stream e timeout/exit code mudam apresentação/controle da saída. [remote.py:47–199](sources/agents-skills/skills/agents-onboarding/scripts/remote.py), [E36](evidence-ledger.md#e 36).

Caller: assistente/operador externo. Input: destino SSH, opções, script-file/stdin e modo container/sudo opcional. Callee: cliente SSH → bash ou comando remoto que lê stdin. State/side effects: **os definidos pelo payload remoto**; podem ser administrativos/destrutivos. Failure: validação local/arquivo/timeout/process exit. Cleanup: processo subprocess e término do helper; não existe rollback universal do script remoto. Segurança: reduzir erro de quoting não faz o payload virar seguro; caller possui autoridade de administração. Não recomendar esse helper como sandbox de tool do CRM.

### gen-onboarding-env.ts — meta-configuração material

[CODE, HIGH] `buildOnboardingEnv` valida prefixo HTTP(S), nomes de papéis e dados adicionais; gera valores aleatórios, constrói URL de migração com papel administrativo e URLs de runtime/checkpointer com papel de aplicação. `main` obtém flags, recusa sobrescrever arquivo existente sem `--force`, serializa e grava o ambiente. Não executado pela pesquisa. [gen-onboarding-env.ts](sources/agents-skills/skills/agents-onboarding/scripts/gen-onboarding-env.ts).

Detalhe importante: o ambiente gerado define `SETUP_TOKEN_REQUIRED=false`; isso é configuração produzida para onboarding, não o default universal do app. [INFERENCE, MEDIUM] Reutilizar esse output fora de uma implantação inicial controlada pode mudar a superfície de setup; sucesso/segurança do deploy não foram validados. Duas URLs/roles provam que scripts de skill podem afetar limites de execução futuros sem ser carregados durante uma conversa.

### Outros auxiliares — catálogo de operações, não certificação de cada branch

| Script | Definição/chamadas inspecionadas | Dependências/efeitos | Cobertura |
|---|---|---|---|
| sshkey.py | cmd_generate/cmd_wait_access → subprocess | ssh-keygen, arquivo de chave e polling SSH | [CODE] entrypoints/subprocess; host real não executado |
| docker-status.py | cmd_status → remote_command → ssh → parse_json_output | consulta de estado de containers remotos | [CODE] caminho de comando/parse; não comprova deploy |
| harbor-login.py | cmd_login → arquivo/segredo → ssh/docker login | persiste autenticação de registry no destino | [CODE] caminho de subprocess; segredo real não fornecido |
| langfuse-verify.py | cmd_ingestion → Request POST → urlopen | teste de ingestão envia lote ao serviço; **não puramente read-only** | [CODE] request/status; não executado |
| langfuse-set-password.py | resolve_password/build_remote_script/run_remote/parse_result | alteração administrativa de senha via script remoto | [CODE] composição/subprocess; branches completos não auditados |
| coolify.py | http/urlopen, run_ssh, cmds token/API/config/create-service | leitura e mutação de serviço/configuração; token administrativo | [CODE] helpers e dispatch localizados; cobertura semântica seletiva |
| chatwoot-admin.py | run_ssh + provision/refresh/id/kanban handlers | inspeção/alteração administrativa de Chatwoot via comandos remotos | [CODE] chamadas e handlers; não usado no runtime Agents |
| portainer-brownfield.py | script adquirido/inventariado | [UNKNOWN] tracing de todos os branches não concluído | cobertura estrutural, não inferir efeitos só pelo nome |
| simulate-load.py | main → pool de threads → run_persona → Chatwoot HTTP → wait_for_reply | cria contatos/conversas, envia mensagens de teste e observa respostas | [CODE] concorrência/I/O; não teste de assertions do pacote |

Os nomes de comandos usados pelo pacote não são recomendação de executar administração de produção. Scripts podem exigir secrets/acessos; o novo CRM deve mantê-los fora do execution plane dos clientes.

## Samples, templates e a ponte real para Agent

[DOC] Sample de clínica demonstra instruções extensas e componentes de integração/conhecimento/mídia; sample de transportadora demonstra HTTP com campos/schema e status esperados. [Samples](sources/agents-skills/skills/agents-onboarding/samples/agents). Exemplos dizem o que autor pretende, não substituem comportamento do import/runtime.

[CODE] Ponte corroborada em A: servidor MCP registra tool administrativa → `agentImport(principal,args)` valida gate e export → default dry-run chama **o próprio import com dryRun:true** → rehearsal revertido fornece warnings reais → aplicar com `dry_run:false` chama import → Agent disabled/test e componentes remapeados → próximos turns passam pelo loader normal. [write-agents.ts:307–387](sources/agents/src/modules/mcp/write-agents.ts), [transfer.ts](sources/agents/src/modules/agents/transfer.ts).

[DOC + CODE] Skill recomenda `prompt_set`; servidor tem `promptSet` em write.ts; resultado altera Agent.systemPrompt. Não há operação equivalente “attach runtime skill file and run” encontrada. Rehearsal de import é implementação observada; aprovação humana exigida pelo pacote continua dependendo de quem opera a tool administrativa — não é prova de aprovação genérica de write tools durante atendimento.

Templates Compose são configuração de implantação de Agents e serviços adjacentes; imagens/ports/volumes expressam topologia pretendida. Não se descreve Redis/ClickHouse ou outros serviços de templates adjacentes como runtime interno de Agents sem caller correspondente.

## Grafo de dependência: conclusão e limites

Files compartilhados entre `.claude/skills` de A e `skills` de B coincidem no snapshot inspecionado; B contém quatro arquivos extras em relação a esses diretórios de skills de A. Não há package dependency runtime de A para B. B referencia APIs/MCP/código de A e infraestrutura externa; integração é autoria/configuração e convenções do host. Importação em runtime de skills do cliente final não foi localizada nos manifests, loader de config, assembly de prompt/tools ou graph.

Não demonstrados: código do CLI distribuidor, política automática do host ao selecionar skill, execution ordering entre várias skills no host, compatibilidade real com todos os assistentes anunciados, garantia de rollout, aprovação efetiva humana em cada operação. Todos permanecem UNKNOWN.

## Discrepância confirmada

[DOC] Operation diz que NATIVE ausente **ou allowlist vazia** habilita todas. [CODE] A constrói Set para lista fornecida e filtra por membership; [] resulta em nenhuma. Conclusão: documentação desatualizada/divergente nesse ponto; não adaptar blueprint com default permissivo por cópia. [B03-adjust:28](sources/agents-skills/skills/agents-operation/references/03-adjust.md), [A native:1389–1391](sources/agents/src/graph/tools/native.ts).

## Reuso independente

[PROPOSAL] Reusar a separação entre autoria guiada, configuração validada e runtime. Não importar instruções de setup, nomes comerciais, prompts de samples nem recursos de marca. Um pacote de capacidade do novo CRM deve compilar para versões/grants/policies explícitos; receitas administrativas permanecem recurso da equipe, com credenciais e autorização fora do atendimento.
