# GoToBots — Demand Validation MVP

Mobile-first React + TypeScript + Vite + Tailwind preview. No backend, live trading, payments, real waitlist or deposits.

## Run

```bash
npm install
npm run dev
npm run build
```

Routes: `/`, `/bots`, `/bots/:id`. Waitlist submissions are stored only in in-memory app state. Reloading clears them. Analytics events are logged in development only and never include email addresses.

## Public deployment warning

**Do not publish as a real trading product yet.** The `Up to 100% Returns per Month` claim is unverified and must be substantiated with period, methodology, fees and risks or removed before public deployment. Trial refers to the proposed SaaS subscription, not trading capital.

## GitHub Pages

Vite base is `/trading-platform/`. Build output `dist/` can be deployed with GitHub Actions; SPA routes need fallback to `index.html`. No Pages deployment is configured automatically.
