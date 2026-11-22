import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const out='/tmp/gotobots-visual';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let errors=[];
for(const width of [320,375,390,430,768,1280,1440]){
 const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(width+': '+e.message));
 await page.goto('http://127.0.0.1:4173/playable-demo/',{waitUntil:'load'});
 await page.getByRole('button',{name:'Create Demo Account'}).click();
 await page.locator('input[name=email]').fill('visualqa@example.test');
 await page.locator('input[name=password]').fill('demoPass123');
 await page.locator('input[name=confirm]').fill('demoPass123');
 await page.locator('#regform button[type=submit]').click();
 await page.getByRole('button',{name:'Simulate Verification'}).click();
 await page.getByRole('button',{name:'Start Free Demo GOLD'}).click();
 const isMobile=width<=650;
 const pages=['bot','tasks','friends','profile'];
 for(const tab of pages){
  await page.locator(isMobile?'.bottom button[data-a="go:'+tab+'"]':'.side button[data-a="go:'+tab+'"]').click();
  await page.waitForTimeout(70);
  const dims=await page.evaluate(()=>({
   viewport:innerWidth,
   scroll:document.documentElement.scrollWidth,
   mainLeft:document.querySelector('.main')?.getBoundingClientRect().left,
   mainRight:document.querySelector('.main')?.getBoundingClientRect().right,
   mainHeight:document.querySelector('.main')?.getBoundingClientRect().height,
   horizontalItems:[...document.querySelectorAll('.card,.metric,.top,.bottom')].filter(e=>{
    let b=e.getBoundingClientRect();return b.right>innerWidth+2||b.left< -2
   }).slice(0,6).map(x=>x.className)
  }));
  assert.ok(dims.scroll<=width+2, width+'px / '+tab+' horizontal overflow '+JSON.stringify(dims));
  assert.equal(dims.horizontalItems.length,0,width+'px / '+tab+' overflowing containers '+JSON.stringify(dims));
  await page.screenshot({path:out+'/'+width+'-'+tab+'.png',fullPage:true});
 }
 await page.locator(isMobile?'.bottom button[data-a="go:tasks"]':'.side button[data-a="go:tasks"]').click();
 await page.getByRole('button',{name:'Open'}).first().click().catch(()=>{});
 await page.evaluate(()=>{const n=document.querySelector('.toast');if(!n)document.querySelector('button[data-a="task:basics"]')?.click()});
 const toast=await page.locator('.toast').boundingBox();
 if(toast)assert.ok(toast.y<120,width+'px notification is not near top: '+toast.y);
 await page.close();
}
assert.deepEqual(errors,[],'Browser page errors');
await browser.close();
console.log('PASS: 7 viewport sizes, all 4 tabs, no overflowing containers or browser errors. Screenshots at '+out);
