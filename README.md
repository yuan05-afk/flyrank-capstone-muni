# Muni

### Meet Muni. The personal AI that only speaks from verified knowledge.

Personal brand sites keep adding chat widgets that invent experience. Muni is
different. It retrieves Yuan's verified knowledge cards, cites every claim, and
refuses when evidence is missing. The mascot comes from Filipino "muni-muni,"
thoughtful reflection: think first, then speak.

**Run locally:** [Quick start](#quick-start) | [Prove it yourself](#prove-it-yourself) | [Architecture](#architecture)

![Muni landing hero with companion mascot and grounding pitch](docs/images/shots/muni-landing.png)

![Muni hero mascot illustration](docs/images/muni-hero.png)

## Why Muni

- **Verified knowledge cards:** bio, projects, skills, FAQ, and links are editable facts, not prompt folklore.
- **Cited answers:** every grounded reply maps claims back to retrieved cards.
- **Grounding Guard:** weak similarity, weak topical overlap, missing citations, or low confidence triggers an honest refuse.
- **Interactive mascot:** idle, wave, listening, thinking, answering, and grounded-refuse states.
- **Owner inbox:** grounded vs guarded ledger, knowledge-gap suggestions, and a card editor.
- **Audience openers:** recruiter, investor, client, peer, and general presets.
- **Cost ledger:** seed providers stay at `$0.00`; optional Gemini is local-only.

## The guard is the product

Ask about Lens and Muni cites the project card. Ask for a secret salary and Muni
refuses with a clear why. That refusal is the Capstone decision core.

![Muni chat showing a grounded cited answer](docs/images/shots/muni-chat-grounded.png)

![Muni chat showing an honest out-of-scope refusal](docs/images/shots/muni-chat-refuse.png)

![Muni owner desk with inbox, gaps, and knowledge editor](docs/images/shots/muni-desk.png)

## Corpus and evaluation

Nine seed persona cards ship in `fixtures/persona/`. Labeled eval covers
in-scope Lens/Muni/stack questions and out-of-scope salary/NBA refusals.

Current deterministic eval:

- Grounded accuracy: **1.00**
- Citation precision: **1.00**
- Refusal recall: **1.00**

```bash
pnpm eval
pnpm eval:sweep
```

See `docs/eval/threshold-curve.md`.

## Quick start

```bash
git clone https://github.com/yuan05-afk/flyrank-capstone-muni.git
cd flyrank-capstone-muni
pnpm install
pnpm db:push
pnpm db:seed
pnpm knowledge:embed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Demo owner key:
`muni_demo_key_001`.

### Optional live Gemini

Seed providers are the default. To use Gemini locally:

```env
CHAT_PROVIDER="gemini"
EMBEDDING_PROVIDER="gemini"
GEMINI_API_KEY="your-local-key"
```

Never commit the key.

## Prove it yourself

```bash
pnpm test
pnpm eval
```

Demo script:

1. Open the landing and meet Muni.
2. Chat: ask `What is Lens?` → grounded + citations.
3. Chat: ask `What is Yuan's secret salary?` → refused.
4. Sign in with `muni_demo_key_001` → inbox shows both outcomes + gap tips.
5. Add a knowledge card, run **Embed knowledge**, ask again.

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | demo key session |
| GET/POST | `/api/knowledge` | list / create cards |
| POST | `/api/jobs/embed` | enqueue embed batch |
| POST | `/api/worker/tick?drain=1` | claim due jobs |
| POST | `/api/chat` | ask Muni |
| GET | `/api/inbox` | grounded/guarded log + gaps |
| GET | `/api/costs` | cost ledger |
| GET | `/api/eval` | labeled eval summary |

## Architecture

```text
knowledge cards -> embed jobs -> vectors
question -> retrieve top-k -> grounding_policy_v1
         -> cited answer or honest refuse -> owner inbox
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/MARKET.md](docs/MARKET.md),
and [docs/diagram.md](docs/diagram.md).

## Definition of done

- [x] Personal brand landing with Muni identity
- [x] Interactive Muni mascot states
- [x] Seed knowledge cards + owner editor
- [x] Batch embed jobs with cost tracking
- [x] Retrieval + grounded ChatProvider (seed + optional Gemini)
- [x] Grounding Guard proves cite vs refuse
- [x] Public chat + owner inbox
- [x] Audience openers
- [x] Eval floors + threshold sweep
- [x] Pitch README, docs, screenshots, public repo

<sub>Built by Yuan for FlyRankAI General AI Fluency, Week 6 Impact Project.</sub>
