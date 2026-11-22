# QA report — feature/profit-calculator-analytics

Date: 2026-11-22. Status: **implementation committed; build/runtime verification blocked by environment**.

## Checked by source inspection
- [x] Calculator is embedded in Bot Details, not a new route.
- [x] Four capital buttons: 100, 250 (default), 500, 1000.
- [x] Range input: -100 to +100, default 0, step 5.
- [x] Monthly P&L = capital × percent / 100; ending value = capital + P&L.
- [x] Distinct color for negative P&L; explicit illustrative disclosure.
- [x] Selected capital and return percentage are passed to the demo modal and confirmation.
- [x] Typed event names and properties are centralized.
- [x] PostHog initialized in one module; legacy inline snippets removed on feature branch.
- [x] Public Vite variables replace hardcoded project token/config files.
- [x] Explicit opt-in before PostHog client-side capture; autocapture and session replay disabled.
- [x] Session and visitor UUIDs, first/latest UTM, campaign_id, creative_id.
- [x] Events sent for meaningful interactions, with view deduplication, not each slider movement.
- [x] No raw email included in the analytics event object.
- [x] Demo submission only uses waitlist_form_submitted_demo.
- [x] No backend, exchange integration, payment or production lead-success event added.
- [x] Deterministic one-time scoring categories; maximum score 100.
- [x] Campaign cost data type and PostHog funnel documentation included.
- [x] Only feature branch modified; gh-pages remains untouched.

## Not yet verified on running app
- [ ] npm install / npm run build / TypeScript --noEmit: blocked. GitHub clone failed due to DNS/network restriction; npm dependencies not present offline.
- [ ] Interactive browser tests for return-slider pointer/keyboard/touch behavior.
- [ ] Responsive layout screenshots at 320, 375, 390 and desktop widths.
- [ ] Actual PostHog Live Events ingestion and consent revocation behavior.
- [ ] Third-party script blocking and offline degradation.
- [ ] Exact event counts under React StrictMode and navigation loops.
- [ ] Accessibility with screen reader and keyboard.
- [ ] End-to-end QA on iOS Safari and Android Chrome.

## Manual test matrix
1. ETH GRID at $250, 0% → P&L $0; ending $250.
2. COLD BOT at $100, −100% → P&L −$100; ending $0.
3. GROWTH BOT at $500, +20% → P&L +$100; ending $600.
4. Switch bot → default $250, 0%, correct bot analytics and modal context.
5. Select same capital twice → no duplicate capital_selected.
6. Drag slider repeatedly → only a committed return_scenario_changed, one calculator_interacted per score category.
7. Re-render/StrictMode → no repeat impression for same bot in same app session.
8. Visit with utm_source=telegram&utm_campaign=pilot1 then navigate internally → first touch unchanged.
9. Open later with utm_source=sms&utm_campaign=pilot2 → first touch remains pilot1, latest becomes pilot2.
10. Submit same demo email twice → duplicate check, no waitlist_joined.
11. Verify email never sent in event props / network analytics.
12. Verify analytics is absent until explicit opt-in, then captures future events.
13. Ensure no crash if storage disabled or PostHog unavailable.
14. Audit keyboard focus, slider screen reader values, modal and mobile breakpoints.

## Commands to run with internet/dependencies available
```bash
npm install
npm run build
npm run dev
```

Check that TypeScript and Vite build finish successfully before approving merge. No public deployment has been authorized.
