import fs from 'node:fs';
import {Window} from '/tmp/maria-research-agents/node_modules/happy-dom/lib/index.js';
const window=new Window();
globalThis.window=window;globalThis.document=window.document;globalThis.navigator=window.navigator;
const {default:mermaid}=await import('/tmp/maria-mermaid-swCq8z/node_modules/mermaid/dist/mermaid.core.mjs');
mermaid.initialize({startOnLoad:false,securityLevel:'strict'});
const rows=JSON.parse(fs.readFileSync('research/evidence/mermaid-diagrams.json','utf8'));
const results=[];
for(const [i,row]of rows.entries()){
 try{await mermaid.parse(row.code);results.push({number:i+1,file:row.file,ok:true});}
 catch(e){results.push({number:i+1,file:row.file,ok:false,error:String(e)});}
}
const result={checkedAt:new Date().toISOString(),kind:'Mermaid syntax parse, not browser layout validation',results};
fs.writeFileSync('research/evidence/mermaid-validation.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
process.exitCode=results.some(r=>!r.ok)?1:0;
