import fs from 'node:fs';
import path from 'node:path';
const inv=JSON.parse(fs.readFileSync('research/evidence/agents-inventory.json','utf8'));
const groups=new Map();
function group(p){
 if(p.startsWith('src/modules/'))return p.split('/').slice(0,3).join('/');
 if(p.startsWith('src/features/'))return p.split('/').slice(0,3).join('/');
 if(p.startsWith('src/graph/tools/'))return 'src/graph/tools';
 if(p.startsWith('src/client/'))return p.split('/').slice(0,3).join('/');
 if(p.startsWith('src/api/features/'))return p.split('/').slice(0,4).join('/');
 if(p.startsWith('src/api/'))return 'src/api';
 if(p.startsWith('src/lib/'))return 'src/lib';
 if(p.startsWith('src/graph/'))return 'src/graph';
 if(p.startsWith('src/'))return 'src/bootstrap';
 return p.split('/')[0];
}
for(const f of inv.files){const g=group(f.path);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(f);}
const lookup=new Map(inv.files.map(f=>[f.path,group(f.path)]));
const deps=new Map();
for(const [g,files]of groups){const d=new Set();for(const f of files)for(const i of f.imports){
 let p=i.startsWith('@/')?'src/'+i.slice(2):i.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(f.path),i)):null;
 if(p){const found=[p,p+'.ts',p+'.tsx',p+'/index.ts',p+'/index.tsx'].find(x=>lookup.has(x));if(found&&lookup.get(found)!==g)d.add(lookup.get(found));}
 else d.add('package:'+i.split('/').slice(0,i.startsWith('@')?2:1).join('/'));
}deps.set(g,[...d].sort());}
const deep={
 'src/bootstrap':['Composição Elysia, publicação WebSocket e lifecycle dos workers.','src/index.ts; src/app.ts','Boot → workers → stop em sinais; E01'],
 'src/api':['Rotas e validação de entrada; delegates para serviços.','controllers','Controle de acesso → serviços; E02, E03'],
 'src/graph':['Carregamento da configuração, montagem de contexto e execução conversacional.','runAgentTurn; runLoadedTurn; loadAgentConfig; buildModelAndGraph','Webhook/debounce → grafo → entrega; E04–E10'],
 'src/graph/tools':['Construção e execução de native/HTTP/CODE/MCP/RAG/document.','buildHttpTool; loadMcpTools; buildNativeTools','buildToolset → bindTools → ToolNode; E11–E17'],
 'src/modules/agents':['CRUD/importação e grants do agente persistido.','createAgent; replaceAgentToolSelections; importAgent','REST/MCP → transação → audit; E02, E18'],
 'src/modules/chatwoot':['Recepção autenticada, mirror, eleição de atendimento e entrega externa.','receiveChatwootWebhook; recordAndProcessChatwootDelivery','ACK separado do processamento; E03'],
 'src/modules/memory':['Compactação por atendimento com resumo persistido e proteção contra concorrência.','runMemoryCompact; armMemoryCompact; summarizeAttendance','Scheduler → modelo de resumo → rewrite protegido; E20'],
 'src/modules/scheduler':['Fila durável de jobs e despacho de handlers.','claimDue; runSchedulerTick; registerJobHandler','SKIP LOCKED → token de claim → handler; E21'],
 'src/modules/rag':['Embedding, busca vetorial e propostas de conhecimento.','searchKnowledge; createSuggestion','Tool → embedding fora da transação → SQL scoped; E22'],
 'src/modules/flowlog':['Registro de etapas, redaction, falhas e alertas.','emitFlowEvent; withFlowStage','Callbacks → writes assíncronos de ExecutionLog; E25'],
 'src/modules/webhooks':['Assinaturas e entregas de eventos outbound.','emitOutbound','Evento → delivery PENDING por assinatura → worker; E24'],
 'src/api/features/realtime':['Pub/sub WebSocket local e tópicos por escopo.','setPublisher; broadcastAgentConfigEvent','Mutação → publisher Bun → conexão; E23'],
 'src/lib':['Infraestrutura compartilhada: tenancy, vault helpers, SSRF, locks e erros.','runScopedOn; assertSafeOutboundUrl','Serviços → escopo transacional/políticas; E26, E27'],
 'src/modules/guardrails':['Análise de entrada/saída com modelo e integração de veredictos.','analyzeText','Runtime → modelo de análise → resultado; E28'],
 'prisma':['Modelo relacional e evolução SQL incluindo RLS e vetor.','schema.prisma; migrations','Persistência de aplicação; E19, E26'],
 'src/client':['SPA de administração; detalhes por subgrupo abaixo.','App','Router → páginas → APIs; E29'],
};
let s='# Índice técnico — antes da narrativa\n\n[CODE] Índice estático de todos os arquivos versionados no commit `'+inv.commit+'`. API pública aqui significa export TypeScript, não estabilidade contratual. Dependências são imports lexicais resolvidos: não capturam DI, strings SQL, imports dinâmicos calculados ou chamadas HTTP. Export não prova uso. A leitura profunda está indicada por registros E; os demais grupos são cobertura estrutural, não auditoria semântica integral.\n\n';
for(const[g,files]of [...groups].sort()){
 const d=deep[g];const exports=files.flatMap(f=>f.exports.map(x=>`${x} (${f.path})`));
 s+=`## ${g}\n\nModule: \`${g}\`  \nPath: [diretório](sources/agents/${g==='src/bootstrap'?'src':g})  \nResponsibility: ${d?d[0]:'[UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.'}  \nPublic API: ${d?d[1]:'exports listados abaixo; não equivalem à API de produto'}  \nInternal API: ${d?'funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E':'[UNKNOWN] callers/callees internos não reconstruídos para cada símbolo'}  \nDependencies: ${(deps.get(g)||[]).join(', ')||'nenhuma identificada pelo scanner'}  \nDependents: ${[...deps].filter(([,x])=>x.includes(g)).map(([k])=>k).join(', ')||'nenhum import lexical identificado'}  \nRuntime relevance: ${d?d[2]:'[UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento'}  \nConfidence: ${d?'HIGH nos fluxos citados; não em todo símbolo':'LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical'}  \nFiles: ${files.length}\n\n<details><summary>Arquivos e exports</summary>\n\n`;
 for(const f of files)s+=`- [${f.path}](sources/agents/${f.path}) — ${f.lines??'binary'} linhas; exports: ${f.exports.join(', ')||'—'}.\n`;
 s+='\n</details>\n\n';
}
const skillsInv=JSON.parse(fs.readFileSync('research/evidence/skills-inventory.json','utf8'));
s+='\n# Índice do repositório agents-skills\n\n[DOC + CODE] Todos os 66 arquivos adquiridos são incluídos abaixo. APIs de skills são superfícies de autoria para um host externo, não endpoints do atendimento. Tracing detalhado: [forensics das skills](skills-forensics.md).\n\n';
const descriptions={
 'agents-onboarding':'Guia de implantação/configuração; scripts executam operações administrativas e templates/samples alimentam o setup/import.',
 'agents-dev':'Guia de alteração do código/build/deploy de Agents; execução depende do assistente e ferramentas externas.',
 'agents-operation':'Guia de diagnóstico/ajuste via MCP e script de simulação de carga Chatwoot; não loop de atendimento.',
 distribution:'Metadata de distribuição, README e licença; não engine de runtime.',
};
for(const k of ['distribution','agents-onboarding','agents-dev','agents-operation']){
 const sf=skillsInv.files.filter(f=>(f.path.startsWith('skills/')?f.path.split('/')[1]:'distribution')===k);
 const p=k==='distribution'?'.':`skills/${k}`;
 s+=`## B / ${k}\n\nModule: ${k}  \nPath: [${p}](sources/agents-skills/${p})  \nResponsibility: ${descriptions[k]}  \nPublic API: ${k==='distribution'?'plugin/marketplace metadata':'SKILL.md e interfaces CLI dos scripts abaixo'}  \nInternal API: referências progressivas; helpers de validação, HTTP/SSH/serialização quando há scripts  \nDependencies: ${k==='agents-dev'?'código e build tooling do Agents, via procedimentos':'host externo de skills; APIs/CLI administrativas conforme script e referência'}  \nDependents: assistente/operador; conteúdo equivalente vendorizado em A; host loader não adquirido  \nRuntime relevance: autoria/implantação/operação; sem loading encontrado no turno conversacional  \nConfidence: HIGH para composição e mecanismos rastreados; UNKNOWN para host/CLI externo e sucesso de deploy  \nFiles: ${sf.length}\n\n`;
 for(const f of sf)s+=`- [${f.path}](sources/agents-skills/${f.path}) — ${f.lines??'binary'} linhas.\n`;
 s+='\n';
}
fs.writeFileSync('research/technical-index.md',s);
console.log({groups:groups.size,files:inv.files.length});
