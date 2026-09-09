import { chromium } from '/home/bkpdi/Projetos/SistemaERP/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
for(const file of ['automacao.gif','copilot.gif']){
  await page.goto(`https://crm-modelo.local/brand/${file}`,{waitUntil:'load'});
  for(let n=0;n<3;n++){
    await page.waitForTimeout(n===0?200:2100);
    await page.screenshot({path:`research/evidence/crm-modelo/${file}-${n}.png`});
  }
}
await browser.close();
