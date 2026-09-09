# Modelo lógico — dicionário e invariantes do produto novo

**[PROPOSAL] Todo este arquivo descreve C, o novo CRM.** Não é schema observado no Fazer Agents nem backend inferido do CRM-Modelo. O modelo lógico antecede escolha de ORM/banco. Campos abaixo são núcleo necessário para iniciar design físico; índices, constraints e operações críticas são especificados, sem fingir que isto já é migration pronta.

## Convenções transversais

`ID` = identificador interno opaco; não telefone/email/id do canal. `OrgID` = tenant de segurança e cobrança. `WorkspaceID` = compartimento operacional dentro da organização. `Revision` = inteiro monotônico de controle otimista. Dinheiro = quantia decimal exata + moeda; tokens/bytes = inteiros não negativos; timestamps armazenam instante UTC, agendas conservam também timezone IANA e intenção local.

Toda entidade tenant-scoped carrega `organization_id`; entidades operacionais carregam também `workspace_id`. Toda FK operacional referencia chave candidata composta `(organization_id, workspace_id, id)`; cross-workspace só por relação de compartilhamento explicitamente autorizada, nunca FK acidental sem escopo. IDs enviados pelo cliente são referências a resolver, não autoridade de acesso.

Campos transversais em entidades mutáveis: `id, organization_id, workspace_id?, revision, created_at, updated_at, created_by_principal_id`. Soft-delete somente onde reativação faz sentido; remoção/anonimização obedece política de retenção. Registros financeiros/audit/attempts são append-only com correções compensatórias. Conteúdo publicado de versões é imutável e endereçável por hash; rascunhos são separados.

### Matriz de substituições das hipóteses originais

| Hipótese | Decisão lógica | Motivo |
|---|---|---|
| Lead | `LeadProfile` de Contact, separado de Deal | contato pode ser lead qualificado sem negócio e ter múltiplos negócios |
| AgentMessage | `RunMessage` | mensagem interna do modelo não é mensagem pública de canal |
| AgentEvent | projeção filtrada de `DomainEvent` + timeline | evita dois logs concorrentes de verdade |
| Prompt | `PromptTemplate` + `PromptVersion` | reuso e rendering versionáveis; conteúdo do AgentVersion pode embutir versão |
| ToolCredential | `CredentialBinding` para ToolBinding | evita duplicar segredo por ferramenta |
| Memory | `MemoryFact` + `ConversationSummary` + policies | fato explícito e resumo lossy têm contratos diferentes |
| WorkflowStep | `WorkflowNode` (definição) + `WorkflowStepRun` | uma definição pode ter várias execuções/iterações |
| Automation | `Trigger`/`Schedule` que acionam Agent ou Workflow | não criar segundo motor de execução com garantias diferentes |
| Event | `DomainEvent` + `OutboxDelivery` | fato ocorrido e tentativa de entrega não são a mesma coisa |
| User como autor de agente | `Principal` humano ou service principal | agente deve ter autoridade própria, não simular usuário admin |
| Skill scripts livres | `AuthoringRecipe` fora do runtime ou ToolVersion sandboxada | separar implantação de infraestrutura de capacidades do cliente |

## IAM e organização

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Organization | name, slug, status, data_region, retention_policy_id, billing_account_id | tenant raiz; suspension bloqueia novos efeitos e preserva leitura autorizada/exports; deletion vira workflow rastreado |
| Workspace | organization_id, name, slug, timezone, status | unique(org,slug); não movimentar registros de workspace via update cego |
| User | identity_subject, normalized_email, display_name, status | identidade global; não contém permissões tenant implícitas; email não é PK |
| Principal | kind=user/service/agent, user_id?, organization_id?, status | um agente executor não recebe sessão humana; service principal pertence a uma org |
| Membership | user_id, organization_id, workspace_id?, status, invitation_id? | FK workspace da mesma org; membership de org não concede todos workspaces automaticamente |
| Role | organization_id, scope_kind, name, system_template? | papéis locais podem derivar template; alterações auditadas e revisionadas |
| Permission | key, resource_kind, action, constraints_schema | catálogo de capacidades sem grants por texto livre do LLM |
| RolePermission | role_id, permission_id, constraints | unique(role,permission,constraints hash); constraints só restringem |
| RoleAssignment | principal/membership_id, role_id, scope_ref | autorização efetiva depende de principal ativo e membership válido |
| APIKey | principal_id, key_hash, prefix, scopes, expires_at, revoked_at | segredo mostrado uma vez; lookup por prefix, comparação segura; nunca usar key como tenant selector |
| Session | user_id, hashed_token, expires_at, revoked_at, auth_strength | revoke/rotation; acesso workspace revalidado em operações e reconnect |
| Invitation | organization/workspace, email, role_ids, token_hash, expiry | aceite não ultrapassa direitos de quem convidou; uso único |
| Environment | workspace_id, name, kind=test/staging/production | credenciais/deployments/quotas distinguem ambiente; dados reais só por permissão explícita |
| PolicyVersion | scope_ref, policy_document, hash, created_by | conteúdo imutável; publicação aponta versão efetiva; deny vence allow |

Command examples: inviteMember, assignRole, revokeApiKey, suspendWorkspace. Events: membership.activated, access.revoked, workspace.suspended. **Nenhum evento inclui token/secret.** Auditoria registra autor, delegação e alvo.

## CRM

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Contact | name, locale, owner_principal_id?, status, consent_summary_ref | pessoa/contato interno; merge é operação com lineage, não delete+recreate |
| ContactIdentity | contact_id, kind=phone/email/channel, normalized_value, verified_at, external_account_id? | identidade por fonte/canal; unicidade definida por escopo, não globalmente por nome; conflitos exigem resolução |
| Company | name, legal_identifier?, domain?, owner | identificadores opcionais com origem; entidades homônimas não fundidas automaticamente |
| ContactCompany | contact_id, company_id, relationship, is_primary | N:N; no máximo uma primária por contact onde política exigir |
| LeadProfile | contact_id, lifecycle, qualification_score?, score_policy_version?, evidence_refs, qualified_at | unique(workspace,contact); score não muda estágio de Deal implicitamente |
| Deal | contact_id?, company_id?, pipeline_id, stage_id, title, value, currency, owner, status, stage_entered_at, won_at?, lost_reason? | stage pertence ao pipeline; pelo menos contato ou empresa; won/lost exige regra de transição e histórico |
| Pipeline | name, currency_policy, archived_at | arquivar preserva negócios; ordenação de stages transacional |
| Stage | pipeline_id, name, position, kind=open/won/lost, probability? | position única no pipeline; mover Deal gera event com before/after |
| DealStageHistory | deal_id, from_stage?, to_stage, actor, reason, event_id | append-only; fonte de duração/conversão, não inferir pelo updated_at |
| Task | title, assignee_principal_id, due_at?, timezone?, status, related_contact/deal/conversation refs | lifecycle open/in_progress/done/canceled; alvo relacionado deve estar no mesmo workspace |
| Note | author_principal_id, body_ref/body, visibility, related_entity_ref | note interna não é mensagem pública; edits têm revision/audit |
| Tag | name, color_token, archived_at | unique(workspace,normalized_name); cor não representa política |
| TagAssignment | tag_id, typed_target_id, assigned_by | unique(tag,target); FK tipada ou tabelas join por recurso para preservar escopo |
| CustomFieldDefinition | target_kind, key, type, validation, visibility_policy, indexed | key estável; mudança de tipo exige migração; segredo não vira custom field |
| CustomFieldValue | definition_id, typed_target_id, typed_value | validação determinística servidor; projection JSON possível, mas não bypass de schema |
| ConsentRecord | contact_id, channel/purpose, status, source, captured_at, evidence_ref, expires_at? | revogação invalida próximo envio quando aplicável; não deduzir consentimento de existência do contato |

Commands: upsertContactIdentity, mergeContacts, qualifyLead, createDeal, moveDeal, closeDeal, assignTask. Toda write de agente usa os mesmos serviços de domínio e validações do humano. Event consumer não pode mover novamente o Deal sem novo command idempotente.

## Messaging

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Channel | type, capability_version, connection_id, external_account_id | adaptador de transporte; enum de capacidades inclui texto/mídia/template/ack/order; id interno |
| Inbox | name, channel_id, routing_policy_version, team_id?, status | unidade de fila; canal pode servir múltiplas regras/inboxes se adapter permitir explicitamente |
| Conversation | inbox_id, contact_id?, status, owner_kind, owner_principal_id?, ownership_epoch, episode_no, last_message_seq | status e dono separados; takeover incrementa epoch; agente só envia se epoch autorizado |
| Participant | conversation_id, principal_id/contact_identity_id, role, joined_at, left_at? | autor precisa participar ou ter permissão server-side; snapshots de nome não substituem identidade |
| Message | conversation_id, sequence, author_ref, direction, visibility, content_blocks, client_message_id?, source_delivery_id? | unique(conversation,sequence); interna/pública explícita; edição/remoção via revision/event; recebido não é gerado |
| Attachment | message_id?, object_ref, content_hash, media_type, size, scan_status, visibility | quarantine antes de servir; signed URL curta; metadados não dão acesso por si |
| InboundReceipt | channel_id, provider_event_id, body_hash, received_at, verified_signature, processing_status | unique(connection,event_id); ACK somente após receipt durável; mesmo id/body divergente vira incidente |
| MessageIntent | conversation_id, requested_by, run_id?, content_ref, expected_ownership_epoch, state, idempotency_key | intenção persistida antes do envio; cancelamento antes de dispatch possível; não equivale a Message entregue |
| MessageDeliveryAttempt | intent_id, attempt_no, provider_message_id?, request_hash, status, response_code, started_at, ended_at | transporte at-least-once com dedupe/reconciliação; timeout após send pode ser unknown |
| MessageReceipt | message_id/provider_message_id, kind=accepted/delivered/read/failed, provider_time, receipt_id | receipts podem chegar fora de ordem; state monotônico por contrato de canal, preservar fatos tardios |
| ConversationAssignmentHistory | conversation_id, from_owner, to_owner, epoch, reason, actor | append-only; audita humano→IA e IA→humano |
| NotificationPreference | principal_id, event_kind, delivery_channel, enabled, digest_policy | não é grant de acesso; payload filtrado pela autorização atual |
| Notification | recipient_principal_id, event_id, redacted_payload, read_at? | unique(recipient,event,purpose); acesso revalidado ao abrir |

Commands: receiveMessage, requestSendMessage, claimConversation, handoffConversation, resolveConversation. Um agent run pode terminar e seu MessageIntent ainda estar queued ou unknown; UI deve exibir ambos. Mudar ownership não cancela retroativamente mensagens já aceitas pelo provedor.

## Agentes e modelos

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Agent | name, purpose, owner, archived_at, default_environment_id | identidade estável; não contém config mutável usada sem snapshot |
| AgentDraft | agent_id, revision, editable_spec, validation_report | mutável por autor autorizado; publicação exige testes/políticas |
| AgentVersion | agent_id, version_no, content_hash, instructions_ref, model_policy_ref, dependency_lock, context_policy, limits, created_by | unique(agent,version); conteúdo imutável; sem segredo; dependencies fixadas por id/version/hash |
| AgentDeployment | agent_id, agent_version_id, environment_id, status, deployment_revision, routing/trigger_binding, effective_at | ativação CAS; cada run fixa versão e revision; rollback altera ponteiro para nova execução, não run passado |
| AgentPrincipalBinding | agent/deployment_id, service_principal_id, policy_version | execução tem principal próprio e escopo por ambiente; publish não pode elevar além do autor |
| AgentRun | deployment_id, agent_version_id, dependency_lock_hash, trigger_ref, input_ref, conversation_id?, expected_epoch?, state, status_revision, budget_reservation_id, lease_epoch, cancel_requested_at?, parent_workflow_run_id? | identidade durável; unique(workspace,request_key); transição CAS; terminal imutável, reexecução vira novo run com link |
| AgentStep | run_id, sequence, kind, state, input_ref, output_ref?, started_at?, ended_at?, error_code? | unique(run,sequence); planejamento persistido antes de efeito; tentativa não substitui step |
| StepAttempt | step_id, attempt_no, worker_id, fence_epoch, deadline, result_ref, error_class | unique(step,attempt); completion aceita só fence atual; resultado tardio preservado para reconciliação |
| RunCheckpoint | run_id, checkpoint_no, cursor, state_ref, manifest_hash, pending_effect_refs, engine_version | append-only; somente estado necessário para continuar; não serializar conexão/secret/closure |
| RunMessage | run_id, step_id?, role, ordered_index, content_ref, tool_call_ref?, provenance, visibility_policy | transcript interno; não emitir como Message pública sem command explícito |
| ContextManifest | run_id, step_id, prompt_version, ordered_sources, source_revisions, token_estimates, truncations, hashes, trust_labels | reprodutibilidade da montagem; conteúdo sensível pode expirar, hash/proveniência seguem política |
| PromptTemplate | name, schema, scope, description | template reutilizável, não comando de sistema que ignora política |
| PromptVersion | template_id, version, body, variable_schema, content_hash | immutable; rendering escaping/validation definidos; unknown variable em publish falha |
| ModelEndpoint | provider_kind, model_id, connection_ref, capabilities, capability_verified_at, region | capacidade declarada precisa teste de contrato; não prometer uniformidade por nome |
| ModelPolicyVersion | preferred_endpoint, fallback_rules, output_schema?, timeout, max_tokens, data_policy | allowlist de endpoint/região e fallback; fallback nunca amplia dados autorizados |
| ModelCall | step_id, endpoint_snapshot, attempt_no, request_ref, response_ref, tokens_in/out, usage_status, latency, provider_request_id? | request/response redigidos/encriptados; custo estimado e confirmado separados |
| ApprovalRequest | run/step/tool_call_id, action_digest, target_refs, policy_version, approver_constraints, expires_at, state | aprovação vincula digest+versão+escopo; alteração invalida; concessão expirada/revogada não executa |
| ApprovalDecision | approval_id, principal_id, decision, reason, decided_at, authentication_context | append-only; proibir autoaprovação onde política exigir separação de deveres |

Eventos de run ficam em DomainEvent (agent.run.started/completed etc.) e timeline derivada. Não criar AgentEvent com outra numeração/verdade. Transcript de modelo pode conter raciocínio de ferramenta e observações, mas o produto não requer nem presume acesso a chain-of-thought privado do provider.

## Ferramentas e credenciais

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Tool | name, owner, category, visibility_scope, archived_at | identidade estável; não assumir nome LLM como ID |
| ToolDraft | tool_id, revision, spec, tests | mutável; publishing valida schema, efeitos, credenciais e egress |
| ToolVersion | tool_id, version, input_schema, output_schema, executor_kind, artifact_digest, effect_class, resource_requirements, timeout, idempotency_contract | immutable; efeito classificado e executor fixado; migration incompatível exige nova versão |
| ToolBinding | agent_version/skill_version_id, tool_version_id, alias, allowed_operations, resource_selector, policy_ref, credential_binding_id? | alias único no dependency lock; grants só reduzem; selector não vem livre de output LLM |
| Credential | owner_scope, secret_handle, encryption_key_ref, type, status, expires_at?, rotation_generation | banco guarda handle/ciphertext protegido; nenhum segredo no prompt/export; revogação consulta atual |
| CredentialBinding | connection/tool_binding/environment, credential_id, allowed_audience, allowed_scopes, resource_selector | mesma org; compartilhamento entre workspaces é grant explícito e auditado; não copia valor |
| ToolCall | run_id, step_id, tool_binding_snapshot, action_digest, canonical_args_ref, effect_key, policy_decision_ref, outcome, effect_state | unique(scope,effect_key); retries usam a mesma identidade de operação; args alterados criam nova operação |
| ToolCallAttempt | tool_call_id, attempt_no, worker/fence, request_hash, response_ref?, started/ended_at, status | append-only; tentativa uncertain não vira success sem receipt/reconcile |
| ToolResult | tool_call_id, output_ref, schema_version, outcome_code, effect_receipts, safe_model_view, observed_at | output validado/limitado; texto não eleva permissão; PII filtrada por consumer |
| PolicyDecision | principal, action_digest, evaluated_policy_versions, allow/deny/approval, reason_codes, evaluated_at | auditável; decisão vencida é reavaliada antes de efeito; negações não expõem recurso oculto |
| EffectReceipt | effect_key, target_system, external_id?, before_revision?, after_revision?, proof_ref, status | prova operacional, não somente texto LLM; external ambiguous exige reconciliation |

Classes: pure sem I/O externo; read sem mutação declarada; write reversível/compensável quando possível; destructive com impacto irreversível; external/internal são **eixos ortogonais** a efeito, não enum mutuamente exclusivo. Tool interno write continua sujeito ao mesmo domínio/política; ferramenta read pode vazar dados e exige escopo.

## Skills e conhecimento/memória

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Skill | name, description, owner_scope, visibility | pacote reutilizável de capacidade, não identidade que executa sozinha |
| SkillDraft | skill_id, revision, manifest, validation | mutável; authoring separado de instalação |
| SkillVersion | skill_id, version, instructions_ref, tool_requirements, knowledge_refs, workflow_refs, policy_constraints, resources, config_schema, compatibility, hash | conteúdo imutável; dependencies acíclicas ou rejeitadas; sem segredo/código arbitrário implícito |
| SkillInstallation | skill_version_id, organization/workspace, approved_by, config, state | instalar não concede tools/credenciais automaticamente; upgrade explícito |
| AgentSkillBinding | agent_version_id, installation_id, configuration_snapshot, precedence_slot | scope efetivo = interseção de políticas; conflitos sem resolution explícita impedem publish |
| KnowledgeBase | name, owner_scope, access_policy, embedding_profile, retention_policy | isolamento por workspace e grants; modelo/dimensão/index versionados |
| KnowledgeDocument | kb_id, source_ref, source_version, content_hash, object_ref, status, classification, published_revision | pending→quarantined/processing→ready/failed; documento removido precisa sair de busca e caches |
| KnowledgeChunk | document_id, revision, ordinal, text_ref, embedding_ref, citation_offsets, visibility | retrieval só usa chunks da revisão publicada/permitida; provenance até fonte |
| KnowledgeIngestionRun | document_revision, parser_version, chunker_version, embed_model, cursor, status | idempotente por document hash+pipeline version; retries não duplicam chunks |
| RetrievalRecord | run/step, query_ref, kb_scope, document_revisions, scores, filter_policy, result_hash | registra o que foi considerado/apresentado, sem expor resultados não autorizados |
| MemoryPolicyVersion | scope_kind, sources_allowed, write_approval, retention, relevance, redaction | separa memória de contato/conversa/agente; nenhuma expansão cross-tenant |
| MemoryFact | subject_ref, predicate, value_ref, evidence_refs, confidence, valid_from/to, expires_at, status, policy_version | fato é assertion revisável; confirmação/contradição/revogação explícitas; origem tool/user identificada |
| ConversationSummary | conversation/episode_id, range_start/end, source_hash, summary_ref, model/prompt_version, quality_state | derivado lossy com cobertura temporal; não é verdade autoritativa de saldo/permission |
| MemoryRevision | memory_fact_id, revision, reason, author, previous_ref | correção auditável; delete/retention propagam aos índices dependentes |

SkillVersion pode recomendar tools, conhecimento ou workflow, mas o compilador resolve **grants efetivos**, não concatena privilégios. `requires` não é `allowed`. Org library compartilha definição, não dados nem secrets do workspace produtor.

## Workflows e automações

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Trigger | target=deployment/workflow_version, event_kind?, filter_spec, principal_binding, enabled, debounce/dedupe_policy, causal_limit | evento só solicita execução; não carrega autoridade livre; self-trigger loops limitados |
| Workflow | name, owner, archived_at | identidade; engine não embutido no front |
| WorkflowDraft | workflow_id, revision, graph_spec, validation | edição com CAS; canvas é projeção do spec |
| WorkflowVersion | workflow_id, version, typed_graph, input/output_schema, dependency_lock, limits, hash | immutable; nodes/edges/schemas validados; loops somente explícitos e limitados |
| WorkflowNode | version_id, node_key, kind, config, input_bindings, next_edges | componente lógico da versão; node key estável dentro da versão, não ID de execução |
| WorkflowRun | version_id, trigger_receipt, input_ref, state, cursor, budget, parent/correlation, engine_ref | durável, unique(trigger identity,version,target); output imutável terminal |
| WorkflowStepRun | workflow_run_id, node_key, iteration, state, input/output_ref, agent_run/tool_call_ref? | unique(run,node,iteration); waits e branch decisions persistidos |
| WaitSubscription | workflow_step_run_id, correlation_key, expected_event_kind, deadline, consumed_event_id? | event match tenant-scoped; só uma resolução vence timeout/event/cancel |
| Schedule | target_ref, timezone, local_rule, next_fire_at, misfire_policy, catchup_limit, enabled | DST explícito, exec key schedule+planned_instant; atraso não dispara backlog ilimitado |
| ScheduleOccurrence | schedule_id, planned_instant, trigger_request_id, state | unique(schedule,instant); mudança de timezone não duplica ocorrência existente |

Não criar tabela AutomationRun paralela: automação por regra inicia AgentRun ou WorkflowRun. Schedule dispara TriggerRequest com principal/policy bind, não executa ferramenta diretamente sem ledger.

## Integrações

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| Integration | key, adapter_version, capability_manifest, auth_methods | catálogo de código/contrato do conector, não conta conectada |
| Connection | integration_id, workspace_id, environment_id, state, config, credential_binding_id, health | identidade de instalação; scope health e credential atuais; revoked impede novas chamadas |
| ExternalAccount | connection_id, provider_account_id, display_name, capabilities | unique(connection,external id); vínculo não confere acesso a outra org |
| ExternalObjectMapping | connection_id, object_kind, external_id, internal_id, provider_revision, sync_cursor | unique(connection,kind,external id); preserva nossa PK ao trocar provider |
| WebhookEndpoint | connection/subscription_ref, route_token_hash, signature_scheme, signing_key_handle | rota opaca + verificação; secrets fora de logs |
| WebhookSubscription | event_kinds, endpoint_ref, signing_credential, filter, status | entrega outbound por assinatura e escopo; não receber eventos ocultos |
| WebhookDelivery | subscription_id, event_id, attempt_no, status, next_attempt_at, response_summary | dedupe e DLQ; HMAC timestamp/nonce quando protocolo permitir; replay autorizado |
| SyncRun | connection_id, cursor_before/after, direction, status, counts/errors | checkpoint só avança após persistir lote; reconciliação periódica separada de webhook |

## Plataforma e dados financeiros

| Entidade | Campos específicos essenciais / relações | Invariantes e lifecycle |
|---|---|---|
| DomainEvent | event_id, organization/workspace, aggregate_type/id/revision, type, schema_version, actor, correlation_id, causation_id, occurred_at, payload | append-only; transaction junto da mutação; sem segredo; ordem por agregado, não global |
| OutboxDelivery | event_id, destination, state, attempts, next_attempt_at, claim_epoch | unique(event,destination); at-least-once; publisher pode reenviar |
| ConsumerReceipt | consumer_id, event_id, processed_at, result_ref | unique(consumer,event); dedupe na mesma transação da projeção/ação local |
| AuditLog | actor/effective_principal, scope, action, target, before/after hashes, reason, policy_decision, trace_id | trilha não usada para replay de negócio; append-only, retenção e acesso restritos |
| UsageRecord | source_effect/model_call_id, metric, quantity, unit, rate_version, quality=estimated/confirmed, occurred_at | unique(source,metric,revision); correções novas linhas/reversal; sem double billing por retry |
| BudgetReservation | scope, run_id, reserved_units/cost, expires_at, state | reserva atômica impede overspend concorrente; reconcile de uso incerto |
| Subscription | organization_id, plan_version, period, status, external_billing_ref | entitlements versionados; revogação/suspensão não apaga evidência financeira |
| Entitlement | subscription/override, capability, limit, effective_range | produto aplica servidor; cliente apenas apresenta; overrides auditados |
| BillingAdjustment | usage_ref, amount_delta, currency, reason, actor | compensação explícita, nunca alterar consumo histórico em silêncio |

## Índices, constraints e transações mínimas

| Operação | Constraints/índices lógicos | Unidade transacional |
|---|---|---|
| Receber evento de canal | unique(connection,provider_event_id); lookup body_hash | receipt+message+conversation revision+domain event; ou receipt durável antes de normalize assíncrono |
| Mover negócio | stage FK composta do pipeline; index(workspace,pipeline,stage,status) | valida revision → update deal → stage history → event → audit |
| Assumir conversa | compare revision/ownership_epoch; index(inbox,status,owner,last_activity) | update owner+epoch → assignment history → event |
| Criar run | unique(workspace,request_key), index(state,next_wakeup) | fixar versions/lock+budget reserve+run+event |
| Aprovar efeito | digest+policy+target revision; unique decisão efetiva por request | approval decision → step runnable+event; executor revalida antes de efetuar |
| Executar tool interna | unique(effect_key); resource revision | policy → mutation do domínio+effect receipt+event; tool result vincula receipt |
| Entregar evento | unique(consumer,event) | consumer receipt+projeção/command local; commit antes de ACK |
| Ingerir documento | unique(document_hash,pipeline_version,scope) | publish revision após chunks prontos; busca não lê meia ingestão |
| Metering | unique(model_call/effect,metric,revision) | append usage+settle reservation; retries não repetem lançamento |

## Autoridade e retenção por classe

Definições/versionamento: autores/publicadores separados conforme plano; dados sem segredo; histórico preservado enquanto runs referenciam. Execução: service principal do deployment com escopo mínimo; transcript protegido e expurgável por política sem corromper metadados de auditoria. CRM/messaging: usuários e tools autorizadas via mesmos serviços; anexos e conteúdo podem ter retenção diferente de IDs/eventos. IAM/credenciais: apenas administradores apropriados e broker; segredo não é recurso legível pelo LLM. Financeiro/audit: acesso restrito, retenção própria definida com responsáveis de compliance; não afirmar prazos legais universais neste blueprint.

Esse modelo sustenta requisitos de CRM completo sem tornar memória ou workflow pré-condição para cadastrar um contato ou receber uma mensagem. Agentes usam o domínio; não são donos exclusivos do domínio.
