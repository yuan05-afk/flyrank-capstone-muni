# CURSOR PROMPT - General AI Fluency Impact Project (Muni)

**Capstone · General AI Fluency · Week 6 · ~12h workload · Code FL**

You are building **Muni**, a General AI Fluency Impact Capstone under
`FlyRankAI/Capstones/General AI Fluency - Impact Project`.

Ship a **personal brand website** with a **grounded personal AI agent** and a
cute interactive mascot named **Muni**. Visitors chat with Muni about the
owner. Muni answers **only** from a verified knowledge base, **cites every
claim**, and **refuses when it lacks grounding**. That refusal is the
**Grounding Guard** (Lens's mismatch guard, applied to personal AI).

**Name meaning:** Muni comes from Filipino **"muni-muni"** (thoughtful
reflection). The agent thinks before it answers, speaks only from verified
knowledge, and honestly admits when it lacks evidence.

Pitch line: **Meet Muni. The personal AI that only speaks from verified knowledge.**

**Scope note:** The Grounding Guard is the decision core. Build the whole
system (knowledge → embed → retrieve → answer → cite → refuse → owner inbox)
around that guard. Prove in-scope citation and out-of-scope refusal early.

---

## Non-negotiables (read before writing any code)

1. **Providers behind interfaces.** App code depends on `ChatProvider` and
   `EmbeddingProvider`, never on a concrete vendor SDK class. Ship a
   **deterministic seed provider** for demos and tests so grounded/refuse
   cases always prove without burning API budget. An optional **Gemini** path
   is allowed when `GEMINI_API_KEY` exists in local `.env` - never commit keys.
2. **Skills (mandatory).** Before scaffolding UI or shipping, read and follow:
   - `Capstones/.cursor/skills/capstone-signal-design/SKILL.md` - shared Capstones
     harness (Lenis, Framer Motion, L/R hero, interactivity, scrollbars, pitch
     README, screenshots, staged git commits, public repo, `SUBMISSION.md`,
     no em dashes).
   - `Capstones/.cursor/skills/capstone-muni-design/SKILL.md` - **this product's**
     visual system (Muni mascot, Lens graphite + amber, Outfit + Figtree,
     grounding strip, citation marquee, Grounding Guard chapter). Overrides
     palette/mark/mascot. Do **not** reuse Checkpoint Signal teal or Broadcast
     rose as the primary brand color.
   - If present, `~/.cursor/skills/flyrank-assignment/SKILL.md` for submission
     portal field rules.
3. **Every Capstone looks different.** Muni may reuse Lens amber tokens but
   must read as a **personal agent with a mascot**, not a Lens clone with a
   chat box. Product = mascot = one identity.
4. **No placeholder plumbing.** Endpoints against a real local DB. Batch embed
   jobs must be runnable and resumable. Tests must be runnable.
5. **Never fabricate "it works."** If a test fails, fix it. Do not paper over
   it in the README. Never invent owner facts when grounding fails.
6. **Architecture:** `repository -> service -> route handler` (or equivalent
   clear layers).
7. **Copy:** no em dashes or en dashes in UI, README, or docs.
8. **No grounding → refuse, don't invent.** Structured chat output is validated
   with Zod. Below-threshold retrieval or missing citations → `guarded` /
   `refused`, never a confident fake bio.

---

## Goal (one sentence)

A visitor can open the personal site, meet Muni, ask an in-scope question and
see a cited answer with source chips, ask an out-of-scope question and watch
Muni honestly refuse with a clear why, then the owner can sign in to an inbox
that logs grounded vs guarded answers and suggests knowledge gaps - with cost
tracking and a stated eval score from a labeled Q&A set.

---

## Objectives (you will be able to)

1. **Turn a persona into a knowledge base** - seed cards (bio, projects,
   skills, FAQ) that the owner can extend.
2. **Retrieve by meaning** - embed questions and cards into one space; top-k
   retrieval ranks relevant cards.
3. **Build a Grounding Guard** - the production-critical part: knowing when
   the best cards are still not enough, and refusing to speak.
4. **Ship a personal brand surface + interactive mascot** - marketing site,
   chat UI, Muni animation states, owner inbox.
5. **Run embeddings as cost-tracked background jobs** (retries, resumable,
   ledger rows). Optional Gemini chat/embed when a local key exists.

Built from prior Capstones: Lens (guard, providers, cost, eval, jobs, desk),
Broadcast (audience-aware openers), Checkpoint (demo-auth owner desk), plus
General AI Fluency goals (personal brand + personal agent).

---

## Stack (prefer this unless blocked - say why if you drift)

- **Runtime:** Node.js + TypeScript
- **App:** Next.js 14 App Router (marketing + chat + owner desk in one repo)
- **DB:** SQLite via Prisma (Postgres-ready one-line datasource swap)
- **Validation:** Zod at every public boundary and on structured agent output
- **Jobs:** durable SQLite-backed queue with resumable workers (Lens/Broadcast
  pattern). Do not require Redis for core.
- **Chat / embeddings:** `ChatProvider` + `EmbeddingProvider` interfaces.
  Seed/deterministic provider for demos + tests. Optional Gemini when
  `GEMINI_API_KEY` is set locally (`CHAT_PROVIDER=gemini`,
  `EMBEDDING_PROVIDER=gemini`).
- **Tests:** Vitest
- **Package manager:** pnpm
- **Package name:** `muni-personal-agent` (or similar `muni_*`)

---

## Skills + design direction

### Shared harness (`capstone-signal-design`)

Apply end to end: pitch landing, Lenis, motion, L/R hero, hover/focus,
scrollbars, README pitch style, `docs/images/` screenshots, phase commits,
`gh repo create`, `SUBMISSION.md`.

### Product look (`capstone-muni-design`)

Product + mascot name: **Muni**. Metaphor: thoughtful reflection (muni-muni)
+ amber companion with focus-ring halo.

| Token | Hex |
|-------|-----|
| Canvas | `#F2F3F7` |
| Surface | `#FFFFFF` |
| Ink | `#101828` |
| Muted | `#667085` |
| Line | `#E4E7EC` |
| Primary | `#D97706` |
| Bright | `#F59E0B` |
| Fog | `#FEF3C7` |

Fonts: **Outfit** (display) + **Figtree** (body) + **IBM Plex Mono** (chips).

Required Muni-only hooks (see skill):

- Interactive Muni mascot (idle, wave, listening, thinking, answering,
  grounded-refuse)
- Grounding strip under CTAs
- Citation / knowledge marquee
- Grounding Guard chapter (cited vs refuse)
- Chat UI + owner inbox desk

Hero stays brand-first - no stats dump in the first viewport.

Write `docs/DESIGN.md` and `.cursor/rules/design.mdc` pointing at
`capstone-muni-design` (and the harness skill).

---

## What you will build

1. **Personal brand site** - about, projects, skills, contact, and a clear
   path to chat with Muni.
2. **Knowledge base** - cards seeded from `fixtures/persona/` (demo persona
   that runs zero-config) plus an easy path for Yuan to replace with real
   facts later.
3. **Embed + retrieve** - batch embed cards; retrieve top-k for each question.
4. **Grounded answer** - `ChatProvider` returns Zod-validated
   `{ answer, citations[], confidence, grounded }` using only retrieved cards.
5. **Grounding Guard** - similarity floor, citation check, confidence floor;
   refuse with reason when weak.
6. **Interactive Muni** - SVG + Framer Motion states; generated hero art for
   README.
7. **Owner inbox** - demo-auth desk: conversation log, grounded vs guarded,
   gap suggestions, knowledge editor, cost chips.
8. **Audience openers** - recruiter / investor / client / peer presets
   (Broadcast pattern).

---

## Architecture sketch

```
[knowledge cards] ─(job)─► EmbeddingProvider ─► card_vectors
[visitor question] ──────► EmbeddingProvider ─► q_vector
   └─► retrieve top-k
   └─► Grounding Guard (score floor)
   └─► ChatProvider(context cards) ─► {answer, citations, confidence, grounded}
   └─► citation check / confidence floor
   └─► grounded | guarded | refused → owner inbox + cost row
```

### Suggested layout

```
app/
  api/                 route handlers (Zod in, JSON out)
  chat/                public chat with Muni
  desk/                authenticated owner inbox
  (marketing)/         landing
components/            BrandMark, MuniMascot, LandingPage, ChatPanel
services/              knowledge, embed, retrieve, chat, guard, inbox, cost, worker
providers/             ChatProvider + EmbeddingProvider (+ seed + gemini)
repositories/          Prisma access only
config/                guard, pricing, audience openers
fixtures/
  persona/             seed cards + eval Q&A
  eval-set.json
prisma/
tests/
docs/
public/
  muni/                optional generated mascot art
```

---

## Data model (minimum)

- `KnowledgeCard` - kind (`bio|project|skill|faq|link`), title, body, sourceId?,
  tagsJson, createdAt, updatedAt
- `Embedding` - ownerType (`card`|`question`), ownerId, model, dims, vectorJson
- `Conversation` - audience (`recruiter|investor|client|peer|general`), createdAt
- `Message` - conversationId, role (`user|assistant|system`), content, createdAt
- `AgentAnswer` - conversationId?, question, answer, citationsJson, grounded,
  status (`grounded|guarded|refused`), guardReason?, confidence, policyId?,
  featuresJson?, createdAt
- `Job` - type (`embed`), payload, idempotencyKey?, runAt, attempts, lockedAt,
  leaseUntil?, heartbeatAt?, doneAt?, lastError?
- `CostEvent` - kind (`chat|embedding`), model, units, unitCostUsd, totalUsd,
  refType, refId, createdAt

Indexes: card kind, answer status, embedding owner, job due claims.

---

## Provider interfaces (design in Phase 0)

```ts
export type GroundedAnswer = {
  answer: string;
  citations: Array<{ cardId: string; title: string; quote?: string }>;
  confidence: number; // 0..1
  grounded: boolean;
};

export interface ChatProvider {
  readonly id: string;
  answer(input: {
    question: string;
    cards: Array<{ id: string; title: string; body: string; kind: string }>;
    audience?: string;
  }): Promise<GroundedAnswer>;
}

export interface EmbeddingProvider {
  readonly id: string;
  embed(text: string): Promise<number[]>;
}
```

App services accept these interfaces (or a registry), never a concrete SDK.

Cost: every live (and seed, with zero/estimated) call writes a `CostEvent`.
Document pricing in `config/pricing.config.ts`.

Gemini notes (optional live path only):

- Use `@google/generative-ai` behind the interfaces.
- Prefer a current free-tier Gemini model documented in README.
- Seed remains default for graded demo and CI.
- Never print or commit `GEMINI_API_KEY`.

---

## Grounding Guard (decision core)

Clear, testable rule - implement exactly and document in `docs/ARCHITECTURE.md`.
Policy id: `grounding_policy_v1`. Persist `policyId` + `featuresJson` on answers.

1. **Similarity floor:** if best retrieval score < `SIM_THRESHOLD`, return
   `guarded` / `refused` with reason (weak grounding).
2. **Citation check:** every factual claim in the answer must map to a
   retrieved card id present in `citations`. Ungrounded invention → refuse.
3. **Confidence floor:** if `confidence < CONF_THRESHOLD`, do not treat as a
   confident grounded answer; refuse or flag for owner review.

Prove in tests:

- In-scope question about a seed project → `grounded` + correct citation
- Out-of-scope question (e.g. "What is Yuan's secret salary?") → refused
- Paraphrase of a bio fact still retrieves the bio card

---

## Definition of done (core)

- [ ] Personal brand landing with Muni identity (Lens-inspired amber, unique
      mascot hooks)
- [ ] Interactive Muni mascot with required animation states
- [ ] Seed knowledge cards + owner-editable path
- [ ] Batch embed job with retries + cost tracking
- [ ] Retrieval + grounded ChatProvider (Zod) with seed + optional Gemini
- [ ] Grounding Guard proves in-scope cite + out-of-scope refuse
- [ ] Public chat UI with citation chips
- [ ] Owner inbox (demo auth) with grounded/guarded log + gap suggestions
- [ ] Audience-aware openers
- [ ] Eval on labeled set (grounded accuracy, citation precision, refusal
      recall) + threshold sweep doc
- [ ] Pitch README, architecture/market docs, diagram, real screenshots
- [ ] Public GitHub repo, phase commits, `SUBMISSION.md`

---

## Build phases (commit after each)

Name commits `Phase N: …` like other Capstones.

### Phase 0 - Contracts & design (~2h)

- Scaffold Next.js app, Prisma schema, `.env.example`, `.gitignore`
- `docs/DESIGN.md`, `docs/ARCHITECTURE.md`,
  `.cursor/rules/{architecture,security,design}.mdc`
- Zod schemas, provider interfaces, guard + pricing + audience config
- Wire Muni tokens / Outfit + Figtree / BrandMark + MuniMascot stub
- Landing shell with Capstones chapters
- Checkpoint: schema pushes; design docs exist; `pnpm typecheck` clean

### Phase 1 - Persona knowledge + embed jobs (~2-3h)

- Ship seed persona cards in `fixtures/persona/`
- Seed `EmbeddingProvider` (+ optional Gemini)
- Batch job: claim → embed → persist vectors → cost row → retries
- Checkpoint: run embed over cards; vectors + cost events present

### Phase 2 - Retrieve + chat + Grounding Guard (~3h)

- Seed (and optional Gemini) `ChatProvider`
- Retrieve top-k; apply Grounding Guard; persist AgentAnswer features
- In-scope / out-of-scope / paraphrase tests green
- Audience openers
- Checkpoint: seed Q&A eval floors pass with zero cloud keys

### Phase 3 - Chat UI, mascot, desk, eval (~3h)

- Public chat with interactive Muni states
- Marketing landing complete (companion hero, grounding strip, marquee,
  guard chapter)
- Owner inbox desk + knowledge editor
- Eval script + `docs/eval/threshold-curve.md`
- Generate polished mascot art for docs/hero

### Phase 4 - Ship (~1-2h)

- Pitch README (`git clone` first), mermaid diagram, real screenshots
- `docs/MARKET.md` (who uses Muni, BYO persona, investor story)
- Public repo `flyrank-capstone-muni`, `SUBMISSION.md`

### Stretch (only after core DoD)

- Streaming tokens with deferred citation validation
- Voice input / TTS for Muni (keep optional)
- Multi-persona templates for other owners
- Publish a short "muni-muni" brand story page

---

## API sketch (adjust names, keep behaviors)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/login` | public | demo API key → session cookie |
| GET/POST | `/api/knowledge` | session for writes | list / create cards |
| POST | `/api/jobs/embed` | session | enqueue embed batch |
| POST | `/api/worker/tick?drain=1` | session | claim due jobs |
| POST | `/api/chat` | public or soft rate limit | ask Muni; returns answer + citations + status |
| GET | `/api/inbox` | session | grounded/guarded log + gaps |
| GET | `/api/costs` | session | cost ledger + budget |
| GET | `/api/eval` | session | labeled eval summary |

Demo auth: seeded API key. Suggested demo key: `muni_demo_key_001`.
Session cookie name: `muni_session`.

---

## Tests (minimum)

1. Grounded answer schema: valid structured output parses; invalid rejected
2. Grounding Guard: out-of-scope → refused with reason
3. In-scope: seed project question → grounded + citation to that card
4. Paraphrase retrieval still finds the bio/project card
5. Eval floors: grounded accuracy, citation precision, refusal recall
   (document numbers in README; assert floors e.g. ≥ 0.8 on tiny set)
6. Cost: chat/embed writes `CostEvent` rows
7. Job idempotency: re-enqueue same card key does not duplicate

---

## Demo script (README should enable this)

1. Open the landing - meet Muni, read the pitch
2. Ask an in-scope question → cited answer + source chips + Muni answering state
3. Ask an out-of-scope question → Muni grounded-refuse + honest why
4. Sign in with `muni_demo_key_001` → inbox shows both outcomes + a gap tip
5. Show cost chips / seed `$0.00` path
6. Close with eval numbers from the labeled set

---

## Shipping checklist (from skills)

- [ ] `capstone-muni-design` applied (amber, Outfit, Muni mascot, unique hooks)
- [ ] `capstone-signal-design` harness applied
- [ ] Public GitHub repo (`flyrank-capstone-muni`)
- [ ] `SUBMISSION.md` with Deliverable links + Notes
- [ ] No live API keys in git history
- [ ] Seed provider path works with zero cloud keys for the graded demo
- [ ] Optional Gemini path documented for local `.env` only

---

## How to start (agent)

1. Read both skills fully (`capstone-signal-design` + `capstone-muni-design`).
2. Work inside `Capstones/General AI Fluency - Impact Project/`; `git init`
   early; ignore secrets/DB.
3. Execute Phase 0 → 4 in order; commit after each phase (`Phase N: …`).
4. Prefer working software and honest tests over decorative stretch features.
5. End with `SUBMISSION.md` + pasteable form fields for the user.

---

## Stop condition for prompt authors

This file and `capstone-muni-design` are the Capstone contract. Do **not**
scaffold the Next.js app until the human reviewing this prompt says to proceed
with the build.
