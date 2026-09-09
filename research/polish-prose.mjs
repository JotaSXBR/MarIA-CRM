import fs from 'node:fs';
const files=['README.md','volume-i.md','volume-ii.md','volume-iii.md','volume-iv.md','volume-v.md','domain-model.md','execution-cases.md','skills-forensics.md','validation.md'];
for(const file of files){
 let fence=false;
 const s=fs.readFileSync('research/'+file,'utf8').split('\n').map(line=>{
  if(line.startsWith('```')){fence=!fence;return line;}
  if(fence)return line;
  return line.split(/(`[^`]*`)/g).map((part,i)=>i%2?part:part
    .replace(/\b(com|das|dos|de|em|e|até|menos|aproximadamente|usado|pin|timeout|verifica|entre|casos|Caso|Casos|Bun|Node|Mermaid|stack|memória|dimensão|Etapa|passo|exit)(?=\d)/g,'$1 ')
    .replace(/([A-Za-zÀ-ÿ])([,;])(?=\d)/g,'$1$2 ')
    .replace(/(\d)(?=(?:MiB|KiB|ms|msg\/s|s)\b)/g,'$1 ')
    .replace(/(\d)de(?=\d)/g,'$1 de ')
  ).join('');
 }).join('\n');
 fs.writeFileSync('research/'+file,s);
}
