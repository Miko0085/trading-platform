import posthog from 'posthog-js';
import type { AnalyticsEventName, AnalyticsEventProperties, Attribution, AttributionParams } from './models';
import { awardAction } from './leadScoring';

const ID_KEY='gotobots.anonymous_id.v1';
const FIRST_KEY='gotobots.first_touch.v1';
const LATEST_KEY='gotobots.latest_touch.v1';
const SESSION_KEY='gotobots.session_id.v1';
const CONSENT_KEY='gotobots.analytics_consent.v1';
const sessionFallback=crypto.randomUUID();
const memoryId=crypto.randomUUID();
const params:['utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','creative_id']=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','creative_id'];
let initialized=false;
let consent=false;
let pageSession:string|undefined;
const seen=new Set<string>();
function storage(type:'local'|'session'):Storage|undefined{
  try {const s=type==='local'?localStorage:sessionStorage;const key='gotobots.storage_probe';s.setItem(key,'1');s.removeItem(key);return s;}catch{return undefined;}
}
function readJSON<T>(s:Storage|undefined,key:string):T|null{try{const v=s?.getItem(key);return v?JSON.parse(v) as T:null;}catch{return null;}}
function getAnonymousId():string{
  const s=storage('local');let id=s?.getItem(ID_KEY);
  if(!id){id=memoryId;try{s?.setItem(ID_KEY,id);}catch{/* storage blocked */}}
  return id;
}
function getSessionId():string{
  if(pageSession)return pageSession;
  const s=storage('session');pageSession=s?.getItem(SESSION_KEY)||sessionFallback;
  try{s?.setItem(SESSION_KEY,pageSession);}catch{/* storage blocked */}
  return pageSession;
}
function readCampaign():AttributionParams{
  const q=new URLSearchParams(location.search);
  const result:AttributionParams={};
  for(const key of params){const val=q.get(key);if(val)result[key]=val.slice(0,160);}
  return result;
}
function hasParams(v:AttributionParams):boolean{return Object.keys(v).length>0;}
export function getAttribution():Attribution{
  const savedFirst=readJSON<AttributionParams>(storage('local'),FIRST_KEY);
  const savedLatest=readJSON<AttributionParams>(storage('session'),LATEST_KEY)??readJSON<AttributionParams>(storage('local'),LATEST_KEY);
  const incoming=readCampaign();
  const first=savedFirst??(hasParams(incoming)?incoming:{});
  const latest=hasParams(incoming)?incoming:(savedLatest??first);
  // Do not update first touch on internal navigation or incoming campaigns.
  const l=storage('local'),s=storage('session');
  try{if(!savedFirst)l?.setItem(FIRST_KEY,JSON.stringify(first));if(hasParams(incoming)){l?.setItem(LATEST_KEY,JSON.stringify(latest));s?.setItem(LATEST_KEY,JSON.stringify(latest));}}catch{/* storage unavailable */}
  return {first,latest};
}
export function getVisitorContext(){
  return {anonymous_id:getAnonymousId(),session_id:getSessionId(),attribution:getAttribution()};
}
const token=import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const host=import.meta.env.VITE_POSTHOG_API_HOST;
export function initializeAnalytics(enabled:boolean):void{
  if(initialized||!enabled||!token||!host)return;
  initialized=true;
  consent=true;
  posthog.init(token,{
    api_host:host,
    person_profiles:'identified_only',
    autocapture:false,
    capture_pageview:false,
    capture_pageleave:false,
    disable_session_recording:true,
    persistence:'localStorage+cookie'
  });
  // Deliberately do not identify with email or merge device profiles.
}
export function hasAnalyticsConsent():boolean{return storage('local')?.getItem(CONSENT_KEY)==='yes';}
export function setAnalyticsConsent(enabled:boolean):void{
  try{storage('local')?.setItem(CONSENT_KEY,enabled?'yes':'no');}catch{/* blocked */}
  consent=enabled;
  if(enabled)initializeAnalytics(true);
  else if(initialized)posthog.opt_out_capturing();
  if(enabled&&initialized)posthog.opt_in_capturing();
}
export function capture(name:AnalyticsEventName,properties:AnalyticsEventProperties={},onceKey?:string):void{
  const key=onceKey?name+':'+onceKey:'';
  if(key&&seen.has(key))return;
  if(key)seen.add(key);
  const ctx=getVisitorContext();
  const attrs=ctx.attribution.latest;
  const payload={
    anonymous_id:ctx.anonymous_id,session_id:ctx.session_id,
    timestamp:new Date().toISOString(),...attrs,
    first_touch_source:ctx.attribution.first.utm_source,
    first_touch_campaign:ctx.attribution.first.utm_campaign,
    ...properties,app:'gotobots',environment:import.meta.env.MODE
  };
  if(import.meta.env.DEV)console.info('[GoToBots analytics]',name,payload);
  // Local behavioral score is for a preview only; production backend must validate it.
  awardAction(name);
  if(consent&&initialized)posthog.capture(name,payload);
}
export function resetAnalyticsForTesting():void{seen.clear();}

if(typeof window!=='undefined'&&hasAnalyticsConsent())initializeAnalytics(true);
