import fs from 'node:fs';
const vols=['volume-i.md','volume-ii.md','volume-iii.md','volume-iv.md','volume-v.md'];
let s='# Blueprint completo — CRM agent-native independente\n\nGerado a partir dos cinco volumes autorais e anexos. Data da pesquisa: 2026-09-09. Comece pelo [índice técnico](technical-index.md), pelo [registro de evidências](evidence-ledger.md) e pelos [limites da validação](validation.md). Este documento não é implementação nem certificação; aquisição integral de arquivos não equivale a auditoria semântica integral.\n\n';
s+='## Sumário das 90 seções\n\n';
for(const v of vols){const t=fs.readFileSync('research/'+v,'utf8');s+=`### ${t.split('\n')[0].replace(/^# /,'')}\n\n`;for(const m of t.matchAll(/^## (\d+)\. (.+)$/gm))s+=`- [${m[1]}. ${m[2]}](#section-${m[1]})\n`;s+='\n';}
for(const v of vols){s+='\n---\n\n';s+=fs.readFileSync('research/'+v,'utf8').replace(/^## (\d+)\. (.+)$/gm,(_,n,title)=>`<a id="section-${n}"></a>\n\n## ${n}. ${title}`);}
for(const f of ['execution-cases.md','domain-model.md','skills-forensics.md','evidence-ledger.md','validation.md'])s+='\n---\n\n'+fs.readFileSync('research/'+f,'utf8');
fs.writeFileSync('research/blueprint-completo.md',s);
console.log({bytes:Buffer.byteLength(s),words:s.split(/\s+/).length});
