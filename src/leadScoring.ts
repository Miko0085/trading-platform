import type { AnalyticsEventName,LeadScoreState,ScoreAction } from './models';
export const SCORE_WEIGHTS:Readonly<Record<ScoreAction,number>>={
 bot_selected:10,strategy_viewed:10,calculator_interacted:15,
 capital_selected:10,activation_clicked:20,waitlist_joined:35
};
export function calculateLeadScore(actions:Iterable<ScoreAction>):LeadScoreState{
 const unique=[...new Set(actions)].filter(a=>a in SCORE_WEIGHTS);
 const score=Math.min(100,unique.reduce((n,a)=>n+SCORE_WEIGHTS[a],0));
 const level=score>=80?'Qualified':score>=60?'High Intent':score>=30?'Interested':'Low Intent';
 return {awarded_actions:unique,score,level};
}
const KEY='gotobots.score.v1';
let memory=new Set<ScoreAction>();
function load():Set<ScoreAction>{
 try{const raw=sessionStorage.getItem(KEY);if(raw){const data=JSON.parse(raw) as string[];return new Set(data.filter((v):v is ScoreAction=>v in SCORE_WEIGHTS));}}catch{/* restricted */}
 return memory;
}
export function awardAction(event:AnalyticsEventName):LeadScoreState{
 const actions=load();
 if(event in SCORE_WEIGHTS){
   actions.add(event as ScoreAction);memory=actions;
   try{sessionStorage.setItem(KEY,JSON.stringify([...actions]));}catch{/* restricted */}
 }
 return calculateLeadScore(actions);
}
export function getPreviewScore():LeadScoreState{return calculateLeadScore(load());}
