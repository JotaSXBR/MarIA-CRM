import { chromium } from '/home/bkpdi/Projetos/SistemaERP/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('research/evidence/crm-modelo');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const response=await page.goto('https://crm-modelo.local',{waitUntil:'networkidle',timeout:45000});
await page.screenshot({path:path.join(out,'home-full.png'),fullPage:true});
await page.screenshot({path:path.join(out,'home-viewport.png')});
const html=await page.content();
fs.writeFileSync(path.join(out,'home.html'),html);
const dom=await page.evaluate(()=>({title:document.title,url:location.href,links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText,href:a.href})),buttons:[...document.querySelectorAll('button')].map(b=>({text:b.innerText})),images:[...document.images].map(i=>({alt:i.alt,src:i.src,width:i.naturalWidth,height:i.naturalHeight}))}));
fs.writeFileSync(path.join(out,'surface.json'),JSON.stringify({capturedAt:new Date().toISOString(),status:response.status(),...dom},null,2));
for(const i of dom.images){
  const url=new URL(i.src);
  if(url.hostname==='crm-modelo.local'&&/\.(png|gif)$/.test(url.pathname)){
    const r=await page.request.get(i.src);
    if(r.ok())fs.writeFileSync(path.join(out,path.basename(url.pathname)),await r.body());
  }
}
const actions=[];
for(const label of ['Entrar','Teste Grátis','Agendar demo']){
  await page.goto('https://crm-modelo.local',{waitUntil:'networkidle'});
  const popup=page.waitForEvent('popup',{timeout:5000}).catch(()=>null);
  await page.getByRole('button',{name:label,exact:true}).first().click();
  const target=(await popup)??page;
  await target.waitForLoadState('domcontentloaded').catch(()=>{});
  await target.screenshot({path:path.join(out,`action-${actions.length}.png`),fullPage:true});
  await target.screenshot({path:path.join(out,`action-${actions.length}-viewport.png`)});
  actions.push({label,url:target.url(),title:await target.title(),text:(await target.locator('body').innerText()).slice(0,16000)});
  if(target!==page)await target.close();
}
fs.writeFileSync(path.join(out,'actions.json'),JSON.stringify(actions,null,2));
console.log(JSON.stringify(actions,null,2));
for(const file of ['automacao.gif','copilot.gif']){
  await page.goto(dom.images.find(i=>i.src.endsWith('/'+file)).src,{waitUntil:'load'});
  for(let n=0;n<3;n++){
    await page.waitForTimeout(n===0?400:2200);
    await page.screenshot({path:path.join(out,`${file}-${n}.png`)});
  }
}
await browser.close();
