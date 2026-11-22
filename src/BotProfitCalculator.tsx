import {useEffect,useRef,useState} from 'react';
import type {BotId,Capital} from './models';
import {capture} from './analytics';

const options:Capital[]=[100,250,500,1000];
const cash=(v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
export function calculateIllustrativePnL(capital:Capital,percent:number){
 const monthlyPnL=capital*(percent/100);
 return {monthlyPnL,endingCapital:capital+monthlyPnL};
}
type Props={
 botId:BotId;botName:string;capital:Capital;setCapital:(capital:Capital)=>void;
 monthlyReturnPercent:number;setMonthlyReturnPercent:(value:number)=>void;
};
export function BotProfitCalculator({botId,botName,capital,setCapital,monthlyReturnPercent,setMonthlyReturnPercent}:Props){
 const {monthlyPnL,endingCapital}=calculateIllustrativePnL(capital,monthlyReturnPercent);
 const touched=useRef(false);
 const latest=useRef(monthlyReturnPercent);
 latest.current=monthlyReturnPercent;
 const context=()=>({
   screen_name:'bot_details' as const,bot_id:botId,bot_name:botName,
   selected_capital:capital,illustrative_monthly_return_percent:latest.current,
   illustrative_monthly_pnl:capital*(latest.current/100)
 });
 useEffect(()=>{
   const element=document.getElementById('bot-profit-calculator');
   if(!element)return;
   if(!('IntersectionObserver' in window)){
     capture('calculator_viewed',context(),'calculator:'+botId);
     return;
   }
   const observer=new IntersectionObserver(entries=>{
     if(entries.some(e=>e.isIntersecting)){
       capture('calculator_viewed',context(),'calculator:'+botId);
       observer.disconnect();
     }
   },{threshold:0.3});
   observer.observe(element);
   return()=>observer.disconnect();
 },[botId]); // one impression per bot; not per rerender
 function firstInteraction(){if(!touched.current){touched.current=true;capture('calculator_interacted',context());}}
 function chooseCapital(v:Capital){
   if(v===capital)return;
   setCapital(v);firstInteraction();
   capture('capital_selected',{...context(),selected_capital:v,illustrative_monthly_pnl:v*(latest.current/100)});
 }
 const lastCommitted=useRef(monthlyReturnPercent);
 function commit(){
   if(lastCommitted.current===latest.current)return;
   lastCommitted.current=latest.current;
   firstInteraction();
   capture('return_scenario_changed',context());
 }
 useEffect(()=>{touched.current=false;lastCommitted.current=monthlyReturnPercent},[botId]);
 return <section id="bot-profit-calculator" className="panel profit-calculator" aria-label="Illustrative monthly profit and loss calculator">
   <h2>Monthly Profit / Loss Calculator</h2>
   <p className="subtitle">Explore illustrative monthly return scenarios from 0% to 100%.</p>
   <h3>Trading Capital</h3>
   <div className="capital-grid">{options.map(v=><button type="button" key={v} className={capital===v?'selected':''} aria-pressed={capital===v} onClick={()=>chooseCapital(v)}>{cash(v)}</button>)}</div>
   <label className="slider-label" htmlFor="monthly-return"><span>Illustrative Monthly Return</span><strong className={monthlyReturnPercent<0?'scenario-negative':''}>{monthlyReturnPercent>0?'+':''}{monthlyReturnPercent}%</strong></label>
   <input id="monthly-return" className="return-slider" type="range" min="0" max="100" step="5" value={monthlyReturnPercent}
     onChange={e=>{const next=Number(e.target.value);if(next!==monthlyReturnPercent){firstInteraction();setMonthlyReturnPercent(next)}}}
     onPointerUp={commit} onKeyUp={commit} onBlur={commit}
     aria-valuetext={monthlyReturnPercent+' percent illustrative monthly return'}/>
   <div className="slider-extents"><span>0%</span><span>+100%</span></div>
   <dl className="profit-results">
     <div><dt>Starting Capital</dt><dd>{cash(capital)}</dd></div>
     <div><dt>Illustrative Monthly Return</dt><dd>{monthlyReturnPercent>0?'+':''}{monthlyReturnPercent}%</dd></div>
     <div><dt>Illustrative Monthly P&amp;L</dt><dd className={monthlyPnL<0?'scenario-negative':monthlyPnL>0?'scenario-positive':''}>{monthlyPnL>0?'+':''}{cash(monthlyPnL)}</dd></div>
     <div><dt>Illustrative Ending Value</dt><dd>{cash(endingCapital)}</dd></div>
   </dl>
   <p className="calculator-disclosure">Illustrative scenario only. Not a forecast or verified bot performance. Trading involves significant risk of loss. Fees and taxes are excluded.</p>
 </section>;
}
