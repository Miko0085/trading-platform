export type BotId='eth-grid'|'cold-bot'|'growth-bot';
export type Capital=100|250|500|1000;
export type AttributionParams=Partial<Record<'utm_source'|'utm_medium'|'utm_campaign'|'utm_content'|'utm_term'|'campaign_id'|'creative_id',string>>;
export type Attribution={first:AttributionParams;latest:AttributionParams};
export type AnalyticsEventName=
 |'landing_view'|'welcome_cta_clicked'|'bot_list_viewed'|'bot_selected'|'strategy_viewed'
 |'calculator_viewed'|'capital_selected'|'return_scenario_changed'|'calculator_interacted'
 |'activation_clicked'|'waitlist_modal_opened'|'waitlist_form_started'
 |'waitlist_form_submitted'|'waitlist_form_submitted_demo'|'waitlist_joined'
 |'confirmation_viewed'|'screen_viewed';
export type AnalyticsEventProperties={
 screen_name?:'welcome'|'bot_lobby'|'bot_details'|'early_access'|'confirmation';
 bot_id?:BotId;bot_name?:string;selected_capital?:Capital;
 illustrative_monthly_return_percent?:number;illustrative_monthly_pnl?:number;
 experiment_variant?:string;cta_id?:string;marketing_consent?:boolean;
 [key:string]:string|number|boolean|undefined;
};
export type LeadStatus='new'|'engaged'|'qualified'|'contacted'|'converted';
export type LeadProfile={
 lead_id:string;email:string;created_at:string;anonymous_id:string;
 first_session_id:string;latest_session_id:string;selected_bot_id:BotId;
 selected_capital:Capital;last_return_scenario_percent:number;
 first_touch_source:string|null;first_touch_campaign:string|null;
 latest_touch_source:string|null;latest_touch_campaign:string|null;
 marketing_consent:boolean;consent_timestamp:string|null;consent_text_version:string;
 lead_score:number;lead_status:LeadStatus;
};
export type CampaignCost={
 campaign_id:string;channel:string;campaign_name:string;
 messages_sent:number;messages_delivered:number;
 total_spend_gel:number;start_date:string;end_date:string;
};
export type ScoreAction='bot_selected'|'strategy_viewed'|'calculator_interacted'|'capital_selected'|'activation_clicked'|'waitlist_joined';
export type LeadScoreState={awarded_actions:ScoreAction[];score:number;level:'Low Intent'|'Interested'|'High Intent'|'Qualified'};
