# GoToBots analytics and acquisition measurement

## Current state
This branch is **not deployed**. The production waitlist backend does not exist. The current form fires `waitlist_form_submitted_demo`, not `waitlist_joined`; it does not persist email. No event should imply a confirmed lead until the backend responds successfully.

## Environment
Create `.env.local` from `.env.example` and fill `VITE_POSTHOG_PROJECT_TOKEN` (public `phc_` project token) and `VITE_POSTHOG_API_HOST` (EU: `https://eu.i.posthog.com`). Do not use personal or project-secret API keys. PostHog initializes **only after explicit analytics consent**. If the visitor does not consent, user interaction still works without network analytics.

## Canonical event taxonomy
- Acquisition: `landing_view`, `welcome_cta_clicked`, `screen_viewed`
- Discovery: `bot_list_viewed`, `bot_selected`, `strategy_viewed`
- Calculator: `calculator_viewed`, `capital_selected`, `return_scenario_changed`, `calculator_interacted`
- Activation: `activation_clicked`, `waitlist_modal_opened`, `waitlist_form_started`, `waitlist_form_submitted_demo`
- Production-only: `waitlist_form_submitted` (attempt if backend is configured), `waitlist_joined` (confirmed write only)
- Confirmation: `confirmation_viewed` (preview confirmation has demo-only success messaging)

Shared properties: `anonymous_id`, `session_id`, `timestamp`, `screen_name`, `bot_id`, `bot_name`, `selected_capital`, `illustrative_monthly_return_percent`, `illustrative_monthly_pnl`, campaign UTM, `campaign_id`, `creative_id`, `experiment_variant` when available. **Never include email/phone in ordinary analytics events.** Default inputs should not emit active-selection events. Slider commits on pointer release, keyboard release or blur, not each change. StrictMode/rerender impressions must deduplicate.

## Identity and attribution
`anonymous_id` is a random UUID in localStorage where available; `session_id` is a random UUID in sessionStorage (new tab/session). Neither is fingerprint-derived. First-touch UTM persists in localStorage and is never overwritten by later URLs; latest-touch updates only when incoming acquisition parameters exist. Browser storage may be blocked or cleared, and users on different devices will not automatically merge.

Consent required before client-side PostHog capture. Do not associate raw email with PostHog distinct IDs. Once a *real* waitlist backend is created, generate an internal lead ID server-side, persist attribution and scoring action history, and use PostHog identify/alias only after a privacy review and successful backend confirmation. There is currently no production identity merge.

## Proposed PostHog funnel (unique people)
`landing_view → bot_selected → strategy_viewed → calculator_interacted → activation_clicked → waitlist_joined`.

Note: the last step will be zero until a real backend is connected. For prototype UX only use `waitlist_form_submitted_demo` as a *separate, clearly labeled diagnostic funnel*. Use the same attribution rule, observation period, and denominator in every comparison.

Breakdowns: `utm_campaign`, `utm_source`, `bot_id`, `selected_capital`, device information if available within lawful PostHog capture, `experiment_variant`.

Other insights: funnel dropoff, distinct bot popularity, capital distribution, calculator viewed→interacted, activation intent, waitlist conversion; exclude test sessions. Avoid counting raw button clicks as unique people.

## Cost accounting
`CampaignCost` is a typed manual-import shape defined in `src/models.ts`: campaign ID, channel, campaign name, sent/delivered counts, total spend GEL, dates. PostHog does not automatically ingest TrustConnect costs.

- Cost per Visitor = campaign spend / distinct visitors attributed to that campaign
- Cost per Lead = campaign spend / unique **confirmed** backend leads
- Cost per Qualified Lead = campaign spend / unique confirmed leads with score ≥80
- Activation Intent Rate = distinct activation clickers / distinct landing visitors
- Waitlist Conversion Rate = unique confirmed backend leads / distinct landing visitors

Undefined denominator → report N/A, never 0. Keep first-touch and latest-touch reporting separate. Deduplicate confirmed leads by backend lead ID/email normalization, never by IP.

## Lead profiles and scoring
Types: `LeadProfile` and `CampaignCost` in `src/models.ts`. Scoring: `src/leadScoring.ts`; once per category only, weights 10+10+15+10+20+35, capped 100. Level thresholds: Low Intent (0–29), Interested (30–59), High Intent (60–79), Qualified (80–100). Local preview scores are session-only heuristics and are **not** persisted server-side. Production backend should recompute/validate actions and maintain score + action history.

## Deployment
This branch was deliberately left unmerged. Do not deploy to `gh-pages` until explicitly approved. React source is canonical; old independent HTML preview in `gh-pages` is not updated by these changes.
