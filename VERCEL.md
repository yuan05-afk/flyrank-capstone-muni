# Deploy Muni on Vercel (manual)

This guide assumes you deploy yourself from [github.com/yuan05-afk/flyrank-capstone-muni](https://github.com/yuan05-afk/flyrank-capstone-muni).

## 1. Neon database

1. Create a project in [Neon](https://neon.tech).
2. Create a database named **muni** (or use the default and note the name).
3. Copy the **pooled** connection string (`?sslmode=require`). Use it as `DATABASE_URL`.

## 2. Vercel project

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. Framework preset: **Next.js**. Package manager: **pnpm** (matches `vercel.json`).
3. Open **Settings → Environment Variables**.
4. Paste the contents of `env.vercel.import` into the bulk import UI, then fill in:
   - `DATABASE_URL`: Neon pooled URL
   - `DEMO_API_KEY`: long random string for production sign-in
   - Leave `CHAT_PROVIDER` and `EMBEDDING_PROVIDER` as **seed** for a $0 deterministic demo
   - Or set `CHAT_PROVIDER=groq` and add `GROQ_API_KEY` for natural live chat (keep `EMBEDDING_PROVIDER=seed` unless you add Gemini embed keys)
   - Leave `NEXT_PUBLIC_*` empty for the first deploy (see step 4)

Apply variables to **Production** (and Preview if you want).

## 3. Deploy

Deploy from the Vercel dashboard or push to the connected branch. The build runs:

`pnpm prisma generate && pnpm next build`

## 4. Capstone public URLs (after first deploy)

When your four Capstone apps are live on Vercel, set these in **Settings → Environment Variables** and redeploy:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://muni-flyrank.vercel.app` |
| `NEXT_PUBLIC_CAPSTONE_CHECKPOINT_URL` | `https://checkpoint-flyrank.vercel.app` |
| `NEXT_PUBLIC_CAPSTONE_LENS_URL` | `https://lens-flyrank.vercel.app` |
| `NEXT_PUBLIC_CAPSTONE_BROADCAST_URL` | `https://broadcast-flyrank.vercel.app` |

These drive Capstone hyperlinks in knowledge cards and chat answers.

## 5. Schema, seed, and embeddings (after first deploy)

From your machine (with repo cloned and dependencies installed), point at the **same** Neon URL:

```bash
DATABASE_URL="postgresql://..." pnpm db:push
DATABASE_URL="postgresql://..." pnpm db:seed
DATABASE_URL="postgresql://..." pnpm knowledge:embed
```

This creates tables, loads persona knowledge cards, and writes seed embeddings for retrieval.

Embed jobs also run via the review desk (**Embed knowledge**) or the cron worker. The Vercel cron hits `GET /api/worker/tick` every 5 minutes, or you can drain from the owner desk after sign-in (POST with session cookie).

Manual one-shot worker tick (Bearer uses your production `DEMO_API_KEY`):

```bash
curl -s "https://YOUR_DOMAIN.vercel.app/api/worker/tick" \
  -H "Authorization: Bearer YOUR_DEMO_API_KEY"
```

## 6. Sign in

Open the deployed URL and sign in with the `DEMO_API_KEY` value you set in Vercel.

## Cron

`vercel.json` schedules `GET /api/worker/tick` once daily (Hobby plan limit). Vercel sends the `x-vercel-cron: 1` header; the route also accepts `Authorization: Bearer <DEMO_API_KEY>` for manual ticks.

## Limitations on Vercel

- **Database**: Postgres on Neon (not SQLite). Job leases and claiming fit this demo topology.
- **Long drains**: Heavy `drain=1` runs belong in local scripts (`pnpm worker:tick`) or short cron ticks, not long serverless requests.
- **Seed providers**: Default chat and embeddings stay deterministic and $0; optional Groq/Gemini need keys and stay behind the same guard contracts.

## Local development with the same stack

Copy `.env.example` to `.env`, set `DATABASE_URL` to a Neon branch or local Postgres, then:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm knowledge:embed
pnpm dev
```

Optional: set `NEXT_PUBLIC_*` URLs when testing Capstone cross-link behavior locally.
