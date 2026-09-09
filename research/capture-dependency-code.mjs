import fs from 'node:fs';
import crypto from 'node:crypto';
const root='/tmp/maria-research-agents/node_modules/';
const specs=[['@langchain/langgraph','dist/prebuilt/tool_node.js',177,260],['@langchain/core','dist/tools/index.js',104,148]];
const rows=specs.map(([pkg,file,start,end])=>{
 const full=fs.readFileSync(root+pkg+'/'+file,'utf8');
 const manifest=JSON.parse(fs.readFileSync(root+pkg+'/package.json','utf8'));
 return {package:pkg,version:manifest.version,file,start,end,sha256:crypto.createHash('sha256').update(full).digest('hex'),code:full.split('\n').slice(start-1,end).map((l,i)=>`${start+i}: ${l}`).join('\n')};
});
fs.writeFileSync('research/evidence/dependency-runtime.json',JSON.stringify(rows,null,2));
let md='# Implementação delegada à biblioteca — evidência instalada\n\n[CODE] Trechos do pacote instalado a partir do bun.lock de A, não da versão latest da documentação. Sem esta inspeção, validação de argumentos, execução paralela e conversão de erro seriam apenas suposições. Hash é do arquivo completo; numeração original mantida.\n\n';
for(const r of rows)md+=`## ${r.package}@${r.version}\n\nPath: \`${r.file}\`  \nSHA-256: \`${r.sha256}\`  \nCaller: StateGraph tools node → ToolNode.run → runTool → StructuredTool.invoke/call.  \nCallee: tool.invoke → schema parse → _call; resultado normalizado em ToolMessage.\n\n\`\`\`text\n${r.code}\n\`\`\`\n\n`;
md+='## Interpretação delimitada\n\n[CODE, HIGH] ToolNode usa Promise.all para chamadas ainda sem resultado correlacionado, preserva ToolMessage/Command já retornados e converte exceção ordinária em status error. GraphInterrupt é relançado. StructuredTool parseia schema antes da função. [INFERENCE, HIGH] Dedupe por tool_call_id já presente no state não garante idempotência de um HTTP write cujo efeito ocorreu e cujo resultado ainda não foi salvo.\n';
fs.writeFileSync('research/dependency-runtime.md',md);
