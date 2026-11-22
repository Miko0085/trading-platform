# GoToBots — Demand Validation MVP

Mobile-first React + TypeScript + Vite + Tailwind. Concept-only crypto bots, an embedded interactive illustrative profit/loss calculator, early-access demo, privacy-aware PostHog analytics and provisional behavioral lead scoring.

**No trading, payments, wallets, account creation, verified returns, or production waitlist backend.**

## Development

```bash
npm install
cp .env.example .env.local
# Supply the public PostHog token and EU host as appropriate.
npm run dev
npm run build
```

Environment variables (Vite public build-time):
- `VITE_POSTHOG_PROJECT_TOKEN`: browser-safe `phc_...` project token from the existing GoToBots PostHog project.
- `VITE_POSTHOG_API_HOST`: `https://eu.i.posthog.com` for EU Cloud.

Never set a PostHog secret/personal API token in a `VITE_` variable; those values are bundled into the client. The old hardcoded inline SDK bootstrap and analytics-config files were deliberately removed **in this feature branch** to avoid double initialization.

## Screens

- `/`: Welcome, consent switch, Explore Bots
- `/bots`: Bot Lobby
- `/bots/:id`: Bot Details + **BotProfitCalculator** → Request Access → demo modal → confirmation

Calculator: $100/$250/$500/$1,000; −100% to +100% monthly return (5% increments); instant starting capital, illustrative return, monthly P&L and ending value. **All numbers are user-selected scenarios, not historical returns or predictions.** Existing marketing copy is unchanged, but the unverified 100% claim requires independent review before use in paid acquisition.


## Languages

The UI supports **English (default)**, **Georgian (ქართული)** and **Russian (Русский)**. A compact flag dropdown is shown in the header on mobile and desktop. Language selection persists in localStorage as `gt:language`; no external translation service or network request is needed. Strings are centralized in `public/locales.js` and localized across navigation, calculator, disclaimers, modal and confirmation. The displayed flag denotes language selection, not a user's nationality.

## Analytics and identity

- Centralized tracker: `src/analytics.ts`
- Typed event, lead and campaign cost models: `src/models.ts`
- Embedded calculator: `src/BotProfitCalculator.tsx`
- Deterministic session-only lead score: `src/leadScoring.ts`
- Definitions: `docs/analytics.md`
- Manual QA checklist/results: `docs/qa.md`

Client-side events go to PostHog only after the visitor explicitly opts in to anonymous analytics on the Welcome screen. No automatic click tracking or session replay; no raw email in behavioral analytics events. Anonymous/session identifiers are random, never IP-fingerprinted. Browser storage behavior and ad blockers may limit measurement.

## Demo versus production leads

The Early Access form stores normalized email only in a volatile in-memory Set for the current JavaScript runtime; it sends no email and calls no backend. It captures `waitlist_form_submitted_demo` and displays an explicitly demo-only confirmation. It **must not** fire `waitlist_joined` unless a real backend returns successful persistence. Lead models and identity-linking approach are documented for future work; they are not a substitute for a production database.

## Deployment

Work is isolated to `feature/profit-calculator-analytics` and intentionally **not merged or publicly deployed**. Existing `gh-pages` HTML preview remains unchanged. Merge only after running build and QA; publishing requires separate approval.
