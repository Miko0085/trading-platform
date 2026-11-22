import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Link,useNavigate,useParams,Routes,Route,Navigate}from'react-router-dom';
import{Bot,ArrowLeft,ArrowRight,Grid2X2,ShieldCheck,ChartNoAxesCombined,X,CheckCircle2,Info,Wallet,Workflow}from'lucide-react';
import './style.css';
import {capture,hasAnalyticsConsent,setAnalyticsConsent} from './analytics';
import {BotProfitCalculator} from './BotProfitCalculator';
import type {BotId,Capital,AnalyticsEventProperties} from './models';

type Strategy={id:string;name:string;asset:string;description:string;risk:string;type:string;icon:'grid'|'shield'|'growth'};
const bots:Strategy[]=[
{id:'eth-grid',name:'ETH GRID',asset:'ETH / USDT',description:'Automated Ethereum trading strategy designed around defined price ranges.',risk:'Variable',type:'Range-based automation',icon:'grid'},
{id:'cold-bot',name:'COLD BOT',asset:'Crypto',description:'Risk-focused automated trading strategy with predefined operating rules.',risk:'Strategy-dependent',type:'Rules-based automation',icon:'shield'},
{id:'growth-bot',name:'GROWTH BOT',asset:'Crypto',description:'Dynamic automated strategy designed for higher-risk market exposure.',risk:'Higher',type:'Dynamic automation',icon:'growth'}];
const submissions=new Set<string>();
function track(name:Parameters<typeof capture>[0],props:AnalyticsEventProperties={},once?:string){capture(name,props,once)}
function AnalyticsConsent(){
 const[allowed,setAllowed]=useState(hasAnalyticsConsent);
 return <label className="analytics-consent"><input type="checkbox" checked={allowed} onChange={e=>{
   const value=e.target.checked;setAllowed(value);setAnalyticsConsent(value);
   if(value){track('screen_viewed',{screen_name:'welcome'});track('landing_view',{screen_name:'welcome'});}
 }}/> Allow anonymous product analytics (optional)</label>;
}
function Logo(){return <Link className="logo" to="/"><span className="logo-icon"><Bot size={22}/></span>GoTo<span className="accent">Bots</span></Link>}
function Header({back=false,title=''}:{back?:boolean;title?:string}){const nav=useNavigate();return <header className="header">{back?<button className="back" aria-label="Go back" onClick={()=>nav(-1)}><ArrowLeft size={20}/></button>:<Logo/>}{title&&<strong className="header-title">{title}</strong>}<span className="preview">● EARLY PREVIEW</span></header>}
function Button({children,onClick}:{children:React.ReactNode;onClick:()=>void}){return <button className="primary" onClick={onClick}>{children}<ArrowRight size={19}/></button>}
function Icon({bot,size=52}:{bot:Strategy;size?:number}){const C=bot.icon==='grid'?Grid2X2:bot.icon==='shield'?ShieldCheck:ChartNoAxesCombined;return <span className={'bot-icon '+bot.icon} style={{width:size,height:size}}><C size={size*.46}/></span>}
function Risk({full=false}:{full?:boolean}){return <div className="risk"><strong><Info size={15}/> Risk & performance disclosure</strong><p>Automated crypto trading involves significant market risk. Returns are not guaranteed and capital can be lost. No trading or deposits are available in this preview.</p>{full&&<p className="risk-extra"><b>“Up to 100% Returns per Month”</b> is a product-owner marketing claim pending verification. Measurement period, methodology, fees, historical context and supporting records have not yet been supplied. This figure must not be used to predict returns.</p>}</div>}
function Welcome(){const nav=useNavigate();const[expanded,setExpanded]=useState(false);useEffect(()=>{track('screen_viewed',{screen_name:'welcome'},'screen:welcome');track('landing_view',{screen_name:'welcome'},'landing:welcome')},[]);return <main className="page"><Header/><div className="welcome"><div className="offer">✦ 14 DAYS FREE AT LAUNCH</div><h1>Put Your Crypto Trading on <span className="accent">Autopilot.</span></h1><section className="claim"><small>POTENTIAL RETURNS · UNVERIFIED CLAIM</small><h2>Up to 100% Returns per Month.</h2><p>Marketing claim pending substantiation. Not a projection or guarantee.</p></section><p className="subtitle">Automated crypto trading bots. No trading experience required to explore.</p><div className="steps">{[[Bot,'Choose Your Bot','Explore strategies and risk levels.'],[Wallet,'Select Your Capital','Preview a setup starting from $100.'],[Workflow,'Automate Your Strategy','Designed to operate without manual trading.']].map(([C,title,desc],i)=>{const I=C as typeof Bot;return <div className="step" key={String(title)}><span className="step-icon"><I size={21}/></span><div><b><span className="muted">0{i+1}</span> {String(title)}</b><p>{String(desc)}</p></div></div>})}</div><Button onClick={()=>{track('welcome_cta_clicked',{screen_name:'welcome',cta_id:'explore_bots'});nav('/bots')}}>Explore Trading Bots</Button><p className="footnote">Pre-launch preview. No live trading or deposits. Returns are not guaranteed. Crypto trading involves significant risk of loss.</p><button className="disclosure-toggle" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'Hide':'View'} performance & risk disclosures</button>{expanded&&<Risk full/>}<AnalyticsConsent/></div></main>}
function Lobby(){const nav=useNavigate();useEffect(()=>{track('screen_viewed',{screen_name:'bot_lobby'},'screen:lobby');track('bot_list_viewed',{screen_name:'bot_lobby'},'bot_list')},[]);return <main className="page"><Header back/><p className="eyebrow">THE STRATEGY LINEUP</p><h1 className="page-title">Explore Trading Bots</h1><p className="subtitle">Choose a strategy that matches your trading approach.</p><div className="bot-grid">{bots.map(bot=><button className="bot-card" key={bot.id} onClick={()=>{track('bot_selected',{screen_name:'bot_lobby',bot_id:bot.id as BotId,bot_name:bot.name});nav('/bots/'+bot.id)}}><div className="card-top"><Icon bot={bot}/><ArrowRight size={19}/></div><h2>{bot.name}</h2><p>{bot.description}</p><div className="card-meta"><span>{bot.asset}</span><span className="pill">Risk: {bot.risk}</span></div><span className="explore">Explore Bot <ArrowRight size={16}/></span></button>)}</div><p className="footnote">Strategies are conceptual. No live trading or verified performance is shown.</p></main>}
function Modal({bot,capital,monthlyReturnPercent,close,success}:{bot:Strategy;capital:Capital;monthlyReturnPercent:number;close:()=>void;success:()=>void}){
 const[email,setEmail]=useState('');
 const[consent,setConsent]=useState(false);
 const[error,setError]=useState('');
 const[formStarted,setFormStarted]=useState(false);
 const context={screen_name:'early_access' as const,bot_id:bot.id as BotId,bot_name:bot.name,selected_capital:capital,illustrative_monthly_return_percent:monthlyReturnPercent,illustrative_monthly_pnl:capital*monthlyReturnPercent/100};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};document.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=''}},[close]);
 function onFormStart(){if(formStarted)return;setFormStarted(true);track('waitlist_form_started',context);}
 function submit(e:React.FormEvent){
  e.preventDefault();
  const normalized=email.trim().toLowerCase();
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalized)){setError('Enter a valid email address.');return}
  if(submissions.has(normalized)){setError('This email was already submitted in this demo session.');return}
  submissions.add(normalized);
  track('waitlist_form_submitted_demo',{...context,marketing_consent:consent});
  success();
 }
 return <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
   <div className="modal-heading"><div><p className="eyebrow">PRIVATE PREVIEW</p><h2 id="modal-title">Get Early Access</h2></div><button autoFocus className="back" onClick={close} aria-label="Close modal"><X size={20}/></button></div>
   <p className="subtitle">GoToBots is currently in development. Join the waitlist to be notified when access becomes available.</p>
   <div className="summary"><div><span>Selected bot</span><b>{bot.name}</b></div><div><span>Preview capital</span><b>${capital.toLocaleString()}</b></div><div><span>Illustrative monthly return</span><b>{monthlyReturnPercent}%</b></div><div><span>Planned subscription</span><b>$39/month</b></div><p className="accent">✓ 14-day subscription trial planned at launch</p></div>
   <form onSubmit={submit} noValidate>
    <label htmlFor="email">Email address</label>
    <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onFocus={onFormStart} onChange={e=>{onFormStart();setEmail(e.target.value);setError('')}} aria-invalid={!!error} aria-describedby={error?'email-error':undefined}/>
    {error&&<p className="error" id="email-error" role="alert">{error}</p>}
    <label className="consent"><input type="checkbox" checked={consent} onFocus={onFormStart} onChange={e=>{onFormStart();setConsent(e.target.checked)}}/> I agree to receive optional marketing updates. (Not required.)</label>
    <button className="primary" type="submit">Join Waitlist →</button>
   </form>
   <p className="fine centered">Demo only · Temporary local memory · No email saved or sent</p>
  </div>
 </div>;
}
function Details(){
 const{id}=useParams();
 const nav=useNavigate();
 const bot=bots.find(b=>b.id===id);
 const[capital,setCapital]=useState<Capital>(250);
 const[monthlyReturnPercent,setMonthlyReturnPercent]=useState(0);
 const[modal,setModal]=useState(false);
 const[confirmed,setConfirmed]=useState(false);
 useEffect(()=>{
  setCapital(250);setMonthlyReturnPercent(0);setModal(false);setConfirmed(false);
  if(bot){
   track('screen_viewed',{screen_name:'bot_details',bot_id:bot.id as BotId,bot_name:bot.name},'screen:details:'+bot.id);
   track('strategy_viewed',{screen_name:'bot_details',bot_id:bot.id as BotId,bot_name:bot.name},'strategy:'+bot.id);
  }
 },[id]);
 useEffect(()=>{
  if(confirmed&&bot){
   track('confirmation_viewed',{screen_name:'confirmation',bot_id:bot.id as BotId,bot_name:bot.name,selected_capital:capital,illustrative_monthly_return_percent:monthlyReturnPercent,illustrative_monthly_pnl:capital*monthlyReturnPercent/100},'confirmation:'+bot.id);
   track('screen_viewed',{screen_name:'confirmation',bot_id:bot.id as BotId},'screen:confirmation:'+bot.id);
  }
 },[confirmed,id]);
 if(!bot)return <main className="page"><Header back/><h1>Bot not found</h1><Link to="/bots">Back to bots</Link></main>;
 const context={screen_name:'bot_details' as const,bot_id:bot.id as BotId,bot_name:bot.name,selected_capital:capital,illustrative_monthly_return_percent:monthlyReturnPercent,illustrative_monthly_pnl:capital*monthlyReturnPercent/100};
 return <main className="page"><Header back title={confirmed?'Preview confirmed':bot.name}/>{confirmed?
 <div className="confirmation"><CheckCircle2 size={74} className="accent"/><h1>Demo Request <span className="accent">Recorded Locally</span></h1><p className="subtitle">This preview recorded your interest in this browser session only. No real waitlist registration has occurred.</p><div className="panel"><Icon bot={bot}/><div><b>{bot.name}</b><p>${capital.toLocaleString()} hypothetical capital · {monthlyReturnPercent}% illustrative return</p></div></div><Button onClick={()=>nav('/bots')}>Back to Bots</Button><p className="fine centered">No email sent. No trading account created.</p></div>
 :<div className="details">
  <div className="strategy-heading"><Icon bot={bot} size={66}/><div><p className="eyebrow">AUTOMATED STRATEGY</p><h1>{bot.name}</h1><span className="muted">{bot.asset}</span></div></div>
  <p className="subtitle">{bot.description}</p>
  <div className="chips"><span className="pill">Risk: {bot.risk}</span><span className="pill">{bot.type}</span></div>
  <BotProfitCalculator key={bot.id} botId={bot.id as BotId} botName={bot.name} capital={capital} setCapital={setCapital} monthlyReturnPercent={monthlyReturnPercent} setMonthlyReturnPercent={setMonthlyReturnPercent}/>
  <section className="panel pricing"><div><span className="muted">Planned Subscription</span><h2>$39 <small>/month</small></h2></div><span className="offer">14 DAYS FREE*</span><p className="fine">*14-day SaaS subscription trial planned at launch. Subscription fees and trading capital are separate.</p></section>
  <Risk/>
  <Button onClick={()=>{track('activation_clicked',{...context,cta_id:'request_access'});track('waitlist_modal_opened',{...context,screen_name:'early_access'});setModal(true)}}>Request Access</Button>
  <p className="fine centered">No payment or exchange connection required</p>
 </div>}
 {modal&&<Modal bot={bot} capital={capital} monthlyReturnPercent={monthlyReturnPercent} close={()=>setModal(false)} success={()=>{setModal(false);setConfirmed(true)}}/>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename="/trading-platform"><Routes><Route path="/" element={<Welcome/>}/><Route path="/bots" element={<Lobby/>}/><Route path="/bots/:id" element={<Details/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter></React.StrictMode>);
