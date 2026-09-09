import fs from 'node:fs';
import path from 'node:path';
const base=path.resolve('research');
const files=fs.readdirSync(base).filter(x=>x.endsWith('.md'));
const errors=[],warnings=[];
const sectionNumbers=[];let diagrams=0;let wordCount=0;
const diagramRows=[];
for(const file of files){
 const s=fs.readFileSync(path.join(base,file),'utf8');
 if(/^volume-/.test(file)){
  for(const m of s.matchAll(/^## (\d+)\. /gm))sectionNumbers.push(Number(m[1]));
  for(const m of s.matchAll(/```mermaid\n([\s\S]*?)```/g)){diagrams++;diagramRows.push({file,code:m[1]});}
 }
 if(!['technical-index.md','blueprint-completo.md'].includes(file))wordCount+=s.split(/\s+/).filter(Boolean).length;
 for(const m of s.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)){
  let target=m[1];if(/^(https?:|mailto:|#)/.test(target))continue;
  target=decodeURIComponent(target.split('#')[0]);
  if(!fs.existsSync(path.resolve(base,target)))errors.push(`${file}: missing local link ${target}`);
 }
 if((s.match(/^```/gm)||[]).length%2)errors.push(`${file}: unmatched fence`);
}
for(let i=1;i<=90;i++){const n=sectionNumbers.filter(x=>x===i).length;if(n!==1)errors.push(`section ${i}: occurrences ${n}`);}
if(diagrams<20)errors.push(`Only ${diagrams} Mermaid diagrams`);
const rec=JSON.parse(fs.readFileSync(path.join(base,'evidence/critical-records.json'),'utf8'));
for(const[id,repo,p,lines]of rec){
 const root=repo==='A'?'sources/agents':'sources/agents-skills';const f=path.join(base,root,p);
 if(!fs.existsSync(f)){errors.push(`${id}: missing evidence path ${p}`);continue;}
 const max=fs.readFileSync(f,'utf8').split('\n').length;
 const[start,end]=lines.split('-').map(Number);
 if(start<1||end>max||start>end)errors.push(`${id}: range ${lines} exceeds ${max} lines in ${p}`);
}
const result={checkedAt:new Date().toISOString(),markdownFiles:files.length,sections:sectionNumbers.length,mermaidDiagrams:diagrams,wordsExcludingStaticIndex:wordCount,criticalRecords:rec.length,errors,warnings,scope:'Mechanical structural validation; not proof of correctness of architectural claims.'};
fs.writeFileSync(path.join(base,'evidence/artifact-validation.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(base,'evidence/mermaid-diagrams.json'),JSON.stringify(diagramRows,null,2));
console.log(JSON.stringify(result,null,2));
process.exitCode=errors.length?1:0;
