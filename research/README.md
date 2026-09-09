# CRM agent-native — investigação e blueprint independente

Pesquisa realizada em 9 de setembro de 2026. Idioma: português. Artefato de engenharia; não é implementação do novo CRM nem certificação de segurança dos produtos pesquisados.

Nota do repositório público: clones integrais de terceiros em `sources/` e capturas binárias/HTML do
CRM-Modelo em `evidence/crm-modelo/` permanecem somente no arquivo local de pesquisa. Eles não são
redistribuídos pelo MarIA CRM. Os documentos autorais, hashes, inventários, commits fixados e links
para as fontes públicas permanecem versionados para permitir auditoria e reprodução.

## Comece pelo índice e pela evidência

Para leitura em um único arquivo: [Blueprint completo, com sumário das 90 seções](blueprint-completo.md).

1. [Índice técnico completo dos arquivos e módulos](technical-index.md).
2. [Registro de evidências críticas, com commits, linhas e call chains](evidence-ledger.md).
3. [Volume I — engenharia reversa, seções 1–26](volume-i.md).
4. [Oito casos de execução e reconstrução do request](execution-cases.md).
5. [Volume II — produto e interface CRM-Modelo, seções 27–44](volume-ii.md).
6. [Volume III — síntese arquitetural, seções 45–52](volume-iii.md).
7. [Volume IV — arquitetura independente, seções 53–78](volume-iv.md).
8. [Dicionário lógico de entidades e invariantes](domain-model.md).
9. [Volume V — decisões e plano de engenharia, seções 79–90](volume-v.md).
10. [Revisão crítica e critérios de encerramento](validation.md).
11. [Forensics complementar do agents-skills](skills-forensics.md).

## Fronteira entre as três arquiteturas

| Camada | Natureza | Conclusão delimitada |
|---|---|---|
| A — Fazer Agents | Código e testes adquiridos | Aplicação de agentes conversacionais integrada ao Chatwoot; registro Agent + configuração carregada + grafo por turno. Não é um CRM independente completo. |
| B — CRM-Modelo | Site, imagens e animações públicos | Referência visual de CRM, atendimento, copiloto e automações. Implementação privada e rotas autenticadas não demonstradas. |
| C — novo produto | Proposta deste trabalho | CRM e messaging próprios; control plane versionado; execution plane durável; ferramentas com autoridade e efeitos explícitos. Sem dependência obrigatória dos três produtos. |

`agents-skills` é chamado **repositório B** no registro de fontes; não confundir com **camada B de produto/UX**, que é CRM-Modelo.

## Escopo realmente alcançado

[CODE] Foram adquiridos todos os arquivos versionados dos dois snapshots: 1.605 arquivos em agents e 66 em agents-skills. Árvores, hashes, imports e exports estão nos [inventários](evidence/agents-inventory.json) e [árvore de skills](evidence/skills-tree.txt). Os caminhos centrais foram lidos em implementação e cruzados com callers, callees e testes.

[UNKNOWN] Isso **não equivale a uma auditoria semântica manual de todas as 577 mil linhas de A**. O índice distingue inspeção estrutural de tracing profundo. A exigência literal de análise integral de cada módulo permanece parcialmente aberta. Não houve banco de teste configurado, credenciais de LLM, instância real de Chatwoot ou acesso autenticado ao CRM-Modelo. Esses limites não foram preenchidos por inferência.

[TEST] A execução geral terminou com código 1. O recorte central executou 352 testes: 351 passaram e 1 falhou; o teste falho passou isoladamente. O relatório não declara a suíte verde. Ver [resultados](volume-i.md#25-tests-and-behavioral-validation).

## Snapshots reproduzíveis

| Fonte | Commit / captura | Material local |
|---|---|---|
| [fazer-ai/agents](https://github.com/fazer-ai/agents) | `f1194d4dfd069982752a12f812e82a188f7dd898` | [source](sources/agents), [árvore](evidence/agents-tree.txt), [inventário](evidence/agents-inventory.json) |
| [fazer-ai/agents-skills](https://github.com/fazer-ai/agents-skills) | `3d11c5ff7333dee51b1b764f9e67f407b818684a` | [source](sources/agents-skills), [inventário](evidence/skills-inventory.json) |
| [CRM-Modelo](https://crm-modelo.local/) | captura pública em 2026-09-09; sem commit | [DOM e URLs de assets](evidence/crm-modelo/surface.json), [ações observadas](evidence/crm-modelo/actions.json) |

Os assets públicos preservados são evidência de pesquisa, não recursos autorizados para compor o produto novo. Não reutilizar branding, textos comerciais ou imagens no CRM.

## Convenção de leitura

`[CODE]` implementação; `[TEST]` contrato exercitado/inspecionado, com execução discriminada; `[DOC]` instrução/documentação/configuração declarativa; `[UI]` aparência ou interação efetivamente observada; `[INFERENCE]` interpretação limitada; `[PROPOSAL]` desenho novo; `[UNKNOWN]` evidência insuficiente. HIGH/MEDIUM/LOW qualificam a afirmação, não a segurança geral do sistema.

As decisões tecnológicas foram consultadas com Context7 e documentação primária. A skill de pesquisa orientou a preservação de artefatos, o ledger e a separação entre evidências e propostas; não foi usada como prova sobre os projetos.
