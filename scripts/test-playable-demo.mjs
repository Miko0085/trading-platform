import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/playable-demo/index.html',import.meta.url),'utf8');
const script=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(script,'Embedded app script must be available');

function harness(){
 const handlers={};
 const target={innerHTML:''};
 const storage={data:null,getItem(){return this.data},setItem(k,v){this.data=v},removeItem(){this.data=null}};
 const document={
  getElementById(){return target},
  documentElement:{lang:'en'},
  addEventListener(k,fn){handlers[k]=fn},
  querySelectorAll(){return []}
 };
 const context={document,localStorage:storage,location:{origin:'https://miko0085.github.io',pathname:'/trading-platform/playable-demo/',search:''},window:{addEventListener(){}},navigator:{clipboard:{writeText:async()=>{}}},scrollTo(){},setTimeout(){return 1},clearTimeout(){},confirm(){return true},URLSearchParams};
 vm.runInNewContext(script,context);
 const tap=(action)=>handlers.click({target:{closest:()=>({dataset:{a:action}})}});
 const state=()=>JSON.parse(storage.data);
 return {tap,state,render:()=>target.innerHTML};
}
function demoReady(t){
 t.tap('explore');t.tap('verify');t.tap('startdemo');
}
function liveReady(t){
 demoReady(t);t.tap('wizard:0');for(let i=0;i<6;i++)t.tap('wizardnext');
}
test('new user receives free Demo without Credit burn',()=>{
 const t=harness();demoReady(t);
 const v=t.state();
 assert.equal(v.credits,0);
 assert.equal(v.demoActive,true);
 assert.equal(v.completed.filter(x=>x==='demo').length,1);
 assert.equal(v.current.demo.status,'running');
});
test('Demo cycle settles and rewards idempotently',()=>{
 const t=harness();demoReady(t);
 for(let i=0;i<4;i++)t.tap('next:normal');
 let v=t.state();
 assert.equal(v.current.demo,null);
 assert.equal(v.cycles[0].status,'completed');
 assert.equal(v.completed.filter(x=>x==='cycle').length,1);
 const previous=v.xp;
 t.tap('start');for(let i=0;i<4;i++)t.tap('next:normal');
 v=t.state();
 assert.equal(v.xp,previous);
 assert.equal(v.credits,0);
});
test('Demo pause prevents further fills until resumed',()=>{
 const t=harness();demoReady(t);
 t.tap('pause:demo');t.tap('next:normal');
 assert.equal(t.state().current.demo.filled,0);
 t.tap('resume:demo');t.tap('next:normal');
 assert.equal(t.state().current.demo.filled,1);
});
test('Live wizard gives 30 Credits once and starts mock Live',()=>{
 const t=harness();liveReady(t);
 let v=t.state();
 assert.equal(v.mode,'live');
 assert.equal(v.credits,30);
 assert.equal(v.liveActive,true);
 assert.equal(v.completed.filter(x=>x==='live').length,1);
 t.tap('wizard:0');for(let i=0;i<6;i++)t.tap('wizardnext');
 assert.equal(t.state().credits,30);
});
test('Credit exhaustion waits for cycle to settle',()=>{
 const t=harness();liveReady(t);
 t.tap('dev:exhaust');
 let v=t.state();
 assert.equal(v.credits,0);
 assert.equal(v.pendingPause,true);
 assert.ok(v.current.live);
 t.tap('finish');
 v=t.state();
 assert.equal(v.current.live,null);
 assert.equal(v.paused,true);
 assert.equal(v.pendingPause,false);
});
test('Referral rewards once only on qualified live activation',()=>{
 const t=harness();demoReady(t);
 t.tap('ref:f2');
 assert.equal(t.state().credits,0);
 t.tap('ref:f2');
 assert.equal(t.state().credits,10);
 t.tap('ref:f2');
 assert.equal(t.state().credits,10);
 assert.equal(t.state().refRewarded.length,1);
});
test('Subscription grants Credits only once',()=>{
 const t=harness();demoReady(t);
 t.tap('subscribe');t.tap('subscribe');
 assert.equal(t.state().credits,300);
 assert.equal(t.state().tx.filter(x=>x.kind==='subscription').length,1);
});
test('Only GOLD appears and four primary nav items are present',()=>{
 const t=harness();demoReady(t);
 const ui=t.render();
 assert.ok(ui.includes('GOLD Bot'));
 assert.ok(ui.includes('data-a="go:bot"'));
 assert.ok(ui.includes('data-a="go:tasks"'));
 assert.ok(ui.includes('data-a="go:friends"'));
 assert.ok(ui.includes('data-a="go:profile"'));
 assert.ok(!ui.includes('ETH GRID'));
});
test('Design tokens and mobile viewport safe areas match main branding',()=>{
 assert.ok(html.includes('--gt-accent:#b6f24a'));
 assert.ok(html.includes('env(safe-area-inset-top,0px)'));
 assert.ok(html.includes('env(safe-area-inset-bottom,0px)'));
 assert.ok(html.includes('.leaderboards{grid-template-columns:minmax(0,1fr)}'));
});
test('XP and Credits notifications render at top with dismiss action',()=>{
 const t=harness();demoReady(t);
 t.tap('go:tasks');
 t.tap('task:basics');t.tap('do:basics');t.tap('complete:basics');
 const ui=t.render();
 assert.ok(ui.includes('class="toast"'));
 assert.ok(ui.includes('toast-mark'));
 assert.ok(ui.includes('data-a="toastclose"'));
 t.tap('toastclose');
 assert.ok(!t.render().includes('class="toast"'));
});

test('Mobile-only shell never renders desktop sidebar',()=>{
 const t=harness();demoReady(t);
 const ui=t.render();
 assert.ok(ui.includes('class="app mobile-shell"'));
 assert.ok(ui.includes('class="bottom"'));
 assert.ok(!ui.includes('class="side"'));
 assert.ok(html.includes('--gt-app-width:430px'));
});

test('Friends default page prioritizes stats and network before share card',()=>{
 const t=harness();demoReady(t);t.tap('go:friends');
 const ui=t.render();
 assert.ok(ui.includes('data-a="friendstab:network"'));
 assert.ok(ui.includes('data-a="friendstab:league"'));
 assert.ok(ui.includes('data-a="friendstab:global"'));
 assert.ok(ui.indexOf('Direct Friends')<ui.indexOf('Referral Network'));
 assert.ok(ui.indexOf('Referral Network')<ui.indexOf('INVITE & EARN'));
 assert.ok(!ui.includes('Your position'));
});
test('League tabs isolate rankings and preserve network filter state',()=>{
 const t=harness();demoReady(t);t.tap('go:friends');
 t.tap('friendlevel:2');
 assert.equal(t.state().friendLevel,2);
 t.tap('friendstab:league');
 let ui=t.render();
 assert.ok(ui.includes('Your position'));
 assert.ok(ui.includes('Friends League'));
 assert.ok(!ui.includes('Referral Network'));
 assert.ok(!ui.includes('INVITE & EARN'));
 t.tap('friendstab:global');
 ui=t.render();
 assert.ok(ui.includes('Global Leaderboard'));
 assert.ok(ui.includes('GOLD Master'));
 t.tap('friendstab:network');
 ui=t.render();
 assert.ok(ui.includes('data-a="friendlevel:2" class="active"'));
 assert.ok(!ui.includes('Your position'));
});
test('Profile opens nested settings and Credits activity via Rewards',()=>{
 const t=harness();demoReady(t);t.tap('go:profile');
 let ui=t.render();
 assert.ok(ui.includes('Available Bot Credits'));
 assert.ok(ui.includes('data-a="profileview:settings"'));
 assert.ok(!ui.includes('Credits Transactions'));
 assert.ok(!ui.includes('Security & Bybit'));
 t.tap('profileview:settings');
 ui=t.render();
 assert.ok(ui.includes('Account & Preferences'));
 assert.ok(ui.includes('Security & Bybit'));
 t.tap('profileview:overview');t.tap('profile-rewards');
 assert.equal(t.state().tab,'tasks');
 assert.equal(t.state().subtab,'rewards');
 assert.ok(t.render().includes('Credits Activity'));
});
test('Rewards ledger preserves positive and negative Credits transactions',()=>{
 const t=harness();liveReady(t);t.tap('spend:24');t.tap('profile-rewards');
 let ui=t.render();
 assert.ok(ui.includes('Live GOLD · 24h simulated'));
 assert.ok(ui.includes('data-a="creditfilter:used"'));
 t.tap('creditfilter:used');
 ui=t.render();
 assert.ok(ui.includes('Live GOLD · 24h simulated'));
 assert.ok(!ui.includes('Mock subscription · $39 / 300 Credits'));
});

test('Bot dashboard shows cycle counts instead of trading/order activity feed',()=>{
 const t=harness();demoReady(t);let ui=t.render();
 assert.ok(ui.includes('Cycles Started'));
 assert.ok(ui.includes('Cycles Completed'));
 assert.ok(!ui.includes('<h2>Trading Activity</h2>'));
 assert.ok(!ui.includes('ORD-'));
 t.tap('next:normal');t.tap('next:normal');t.tap('next:normal');t.tap('next:normal');
 ui=t.render();
 assert.ok(ui.includes('Cycle History'));
 assert.ok(ui.includes('Cycles Started'));
 t.tap('view:cycles');
 ui=t.render();
 assert.ok(ui.includes('GOLD-0001'));
 assert.ok(!ui.includes('Orders</h3>'));
 t.tap('inspect:GOLD-0001');
 ui=t.render();
 assert.ok(ui.includes('This view summarizes the grid cycle'));
 assert.ok(!ui.includes('<h3>Orders</h3>'));
});
