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