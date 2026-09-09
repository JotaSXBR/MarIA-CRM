import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const roots = {agents:'/tmp/maria-research-agents',skills:'/tmp/maria-research-agents-skills'};
const out = path.resolve('research/evidence');
fs.mkdirSync(out,{recursive:true});
const [mode,repo,...files] = process.argv.slice(2);
if(mode==='read'){
  for(const file of files){
    const data=fs.readFileSync(path.join(roots[repo],file),'utf8');
    console.log(`\nFILE ${repo}/${file}`);
    let block=false;
    data.split('\n').forEach((line,i)=>{
      const t=line.trim();
      if(t.startsWith('/*'))block=true;
      if(block){if(t.includes('*/'))block=false;return;}
      if(t.startsWith('//')||!t)return;
      console.log(`${i+1}: ${line}`);
    });
    fs.appendFileSync(path.join(out,'reads.jsonl'),JSON.stringify({repo,file,sha256:crypto.createHash('sha256').update(data).digest('hex'),readAt:new Date().toISOString(),mode:'implementation-without-comment-only-lines'})+'\n');
  }
}
if(mode==='inventory'){
  for(const [name,root] of Object.entries(roots)){
    const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
    const paths=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n');
    const items=paths.map(file=>{
      const buf=fs.readFileSync(path.join(root,file));
      const binary=buf.includes(0);
      const text=binary?'':buf.toString('utf8');
      const imports=[...text.matchAll(/(?:from\s*|import\s*\()(['"])([^'"\n]+)\1/g)].map(m=>m[2]);
      const exports=[...text.matchAll(/export\s+(?:async\s+)?(?:function|class|interface|type|const|enum)\s+(\w+)/g)].map(m=>m[1]);
      return {path:file,bytes:buf.length,lines:binary?null:text.split('\n').length,sha256:crypto.createHash('sha256').update(buf).digest('hex'),binary,imports,exports};
    });
    fs.writeFileSync(path.join(out,`${name}-inventory.json`),JSON.stringify({repository:name,commit:sha,files:items},null,2));
    fs.writeFileSync(path.join(out,`${name}-tree.txt`),paths.join('\n')+'\n');
    console.log(JSON.stringify({name,sha,files:items.length,lines:items.reduce((n,x)=>n+(x.lines||0),0),testFiles:items.filter(x=>/\.test\./.test(x.path)).length}));
  }
}
