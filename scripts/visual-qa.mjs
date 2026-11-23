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
 const pages=['bot','tasks','friends','profile'];
 for(const tab of pages){
  await page.locator('.bottom button[data-a="go:'+tab+'"]').click();
  await page.waitForTimeout(70);
  const dims=await page.evaluate(()=>({
   viewport:innerWidth,
   appLeft:document.querySelector('.mobile-shell')?.getBoundingClientRect().left,
   appRight:document.querySelector('.mobile-shell')?.getBoundingClientRect().right,
   appWidth:document.querySelector('.mobile-shell')?.getBoundingClientRect().width,
   navVisible:!!document.querySelector('.bottom')&&getComputedStyle(document.querySelector('.bottom')).display!=='none',
   sidebarCount:document.querySelectorAll('.side').length,
   scroll:document.documentElement.scrollWidth,
   mainLeft:document.querySelector('.main')?.getBoundingClientRect().left,
   mainRight:document.querySelector('.main')?.getBoundingClientRect().right,
   mainHeight:document.querySelector('.main')?.getBoundingClientRect().height,
   horizontalItems:[...document.querySelectorAll('.card,.metric,.top,.bottom')].filter(e=>{
    let b=e.getBoundingClientRect();return b.right>innerWidth+2||b.left< -2
   }).slice(0,6).map(x=>x.className)
  }));
  assert.ok(dims.appWidth<=430.5 && Math.abs(dims.appWidth-Math.min(width,430))<=2,width+' / '+tab+' wrong mobile frame '+JSON.stringify(dims));
  assert.ok(Math.abs(dims.appLeft-((width-dims.appWidth)/2))<=2,width+' / '+tab+' frame not centered '+JSON.stringify(dims));
  assert.ok(dims.navVisible && dims.sidebarCount===0,width+' / '+tab+' desktop navigation still rendered');
  assert.ok(dims.scroll<=width+2, width+'px / '+tab+' horizontal overflow '+JSON.stringify(dims));
  assert.equal(dims.horizontalItems.length,0,width+'px / '+tab+' overflowing containers '+JSON.stringify(dims));
  await page.screenshot({path:out+'/'+width+'-'+tab+'.png',fullPage:true});
 }
 await page.locator('.bottom button[data-a="go:friends"]').click();
 await page.locator('[data-a="friendstab:league"]').click();
 assert.ok(await page.getByText('Your position').count(),width+'px missing Friends League summary');
 assert.equal(await page.getByText('Referral Network').count(),0,width+'px league still shows referral network');
 await page.screenshot({path:out+'/'+width+'-friends-league.png',fullPage:true});
 await page.locator('[data-a="friendstab:global"]').click();
 assert.ok(await page.getByText('GOLD Master').count(),width+'px missing Global rankings');
 await page.screenshot({path:out+'/'+width+'-friends-global.png',fullPage:true});
 await page.locator('.bottom button[data-a="go:profile"]').click();
 await page.locator('[data-a="profileview:settings"]').first().click();
 assert.ok(await page.getByText('Account & Preferences').count(),width+'px settings nested view failed');
 await page.screenshot({path:out+'/'+width+'-profile-settings.png',fullPage:true});
 await page.locator('[data-a="profileview:overview"]').click();
 await page.locator('[data-a="profile-rewards"]').first().click();
 assert.ok(await page.getByText('Credits Activity').count(),width+'px Rewards missing credit ledger');
 await page.screenshot({path:out+'/'+width+'-rewards.png',fullPage:true});
 await page.locator('.bottom button[data-a="go:tasks"]').click();
 await page.locator('[data-a="sub:tasks"]').click();
 await page.locator('.task [data-a^="task:"]').first().click();
 await page.evaluate(()=>{const n=document.querySelector('.toast');if(!n)document.querySelector('button[data-a="task:basics"]')?.click()});
 if(await page.locator('.toast').count()){
  const toast=await page.locator('.toast').boundingBox({timeout:1500});
  if(toast)assert.ok(toast.y<120,width+'px notification is not near top: '+toast.y);
 }
 await page.close();
}
assert.deepEqual(errors,[],'Browser page errors');
await browser.close();
console.log('PASS: mobile-only centered app frame and bottom nav on 7 viewport sizes, all 4 tabs plus Friends League, Global, Settings and Rewards, no overflowing containers or browser errors. Screenshots at '+out);
