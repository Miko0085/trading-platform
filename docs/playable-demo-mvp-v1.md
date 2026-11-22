# GoToBots · GOLD Playable Demo MVP v1

## Preview

Live isolated GitHub Pages preview: https://miko0085.github.io/trading-platform/playable-demo/

The current production landing at `/trading-platform/` remains unchanged.

## Scope and architecture

The MVP is a fully client-side standalone screen flow delivered as `public/playable-demo/index.html`, deliberately reusing the repository's hosting prefix, GoToBots visual palette and GitHub Pages static deployment compatibility. Vite copies this `public/` resource into the build output unchanged; the standalone experience does not require the existing (unmerged) React pages to be replaced. The Vite source and React components remain intact. Production code can later replace the prototype's state machine with shared TypeScript React modules.

- **Navigation:** Bot, Tasks (with Rewards inner tab), Friends, Profile. No marketplace, Home, Instances or second trading product.
- **Account:** local mock registration and verification; no messages sent and no password persisted.
- **GOLD Demo:** separate virtual portfolio, grid-cycle simulator, order history, positive and losing events, chart and analytics. Never consumes Bot Credits.
- **GOLD Live:** mock connection wizard and simulation only. No exchange API, secrets, real money, order execution or payment processing.
- **Credits:** 10 Credits per nominal 24 active Live hours; 30 starter Credits granted once by 4 tasks, 300 Credits for one simulated $39 subscription; one-time referrals (+10/+3/+1 per qualified Live activation at 3 network levels). XP and Credits tracked separately.
- **Cycle-aware exhaustion:** zero balance blocks new cycles; running cycle enters Pause After Cycle and is allowed to settle before PAUSED. Simulated cycle completion is explicit, not guaranteed in actual markets.
- **Persistence:** `localStorage` key `gotobots.playable.v1`; reset via Profile → Demo Controls. All data fictional.
- **Charts:** inline SVG derived from one mock portfolio state. Metric/range switches and pointer tooltips. No external library dependency.
- **Developer demo menu:** Profile → Demo Controls; reset state, simulate new user, ready/live activation, cycle, loss, referrals, subscription, Credits exhaustion and elapsed time.

## User flows

1. **New user → Demo:** Create Demo Account → mock email confirmation → Welcome → Start Free Demo → simulate 4 fills → completed cycle.
2. **Demo → Tasks:** Tasks → open task modal → complete strategy basics → Rewards → XP and Credits ledger.
3. **Demo → Live:** switch to Live → wizard with mock Bybit verification → complete setup and readiness → activate simulated Live.
4. **Credits burn:** Live dashboard → Advance +1h / +24h; profile reflects deductions.
5. **Referral:** Friends → select Nika or Mariam → Simulate Next Stage until Live Activated → Credits ledger updated once, Friends League shows progress.
6. **Subscription:** Profile → Activate Mock Plan → 300 Credits grant appears once.
7. **Cycle completion:** Simulate Next Event four times, or Finish Cycle → completed cycle and order history.
8. **Credits exhaustion:** While a Live cycle runs → Developer Demo Controls → Credits Exhaustion → pendingPause until Finish Cycle → PAUSED.
9. **Reset:** Profile → Demo Controls → Reset All Demo Data.

## Interaction and screen inventory

| Screen / component | Working interactions |
| --- | --- |
| Welcome & registration | validation, password confirmation, mock verification, demo welcome |
| Bot dashboard | mode switch, start, pause/resume Demo, chart metrics/ranges, touch tooltip, cycle simulation, strategy, settings |
| Analytics | expanded chart and cycle performance, period and metric filters |
| Cycle history and details | status filtering, timelines, order details |
| Tasks | available/completed filters, task detail modal, dependencies, one-time rewards |
| Rewards | XP, Credits, achievements, reward history |
| Friends | referral link copy/share, levels 1–3, add mock friend, progress simulation, leagues |
| Profile | account editing, subscription, ledger, security/disconnect, language preference |
| Live wizard | six-step simulated Bybit readiness, permissions and activation |
| Developer controls | time advance, mock subscription, losing cycle, exhaustion, reset |

## Analytics and privacy

Current standalone demo does not initialize PostHog; the existing React site's PostHog implementation is retained untouched. All demo behavior is local and no email, password, API key or financial data is transmitted by this demo. Future production integration should track `*_demo` events gated by appropriately implemented analytics consent.

## Testing

- Run `npm run test:demo` (Node.js 22+ built-in test runner).
- Run `npm install && npm run build` from the repository root to verify TypeScript and Vite.
- The scoped GitHub Actions workflow tests the application and verifies `dist/playable-demo/index.html`.
- Real browser QA still required at 375, 390, 430, 768, 1280 and 1440 px, especially mobile charts and dialog keyboard behavior.

## Known limitations

Not a real Bybit trading system. Live, referrals, subscriptions, market figures, timestamps and cycle settlement are synthetic. No backend, identity verification, API integration, transactional payment, real referral sharing tracking, true multiuser global ranking or verified performance history. The three-language selector stores preference, but localized copy has not yet been implemented in this standalone demo. Trading execution is manually advanced rather than driven by time or exchange data. The order and equity history illustrate state transitions; they are not historical trading records. Credits are simulated on explicit time-advance actions, not measured from a production service clock.

## Production safety

Do not copy mock API logic into actual trading infrastructure. Production cycle execution requires server-side broker/API permissions, risk policy, idempotent order management, durable ledgers, Bybit reconciliation and independent risk controls. Withdrawal-disabled exchange APIs can still lose money through trading permissions.
