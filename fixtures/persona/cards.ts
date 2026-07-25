import { CAPSTONE_LINKS, capstoneUrl } from "../../config/capstones.config";

export type PersonaCard = {
  kind: "bio" | "project" | "skill" | "faq" | "link";
  title: string;
  body: string;
  sourceId?: string;
  tags: string[];
};

export const PERSONA_CARDS: PersonaCard[] = [
  {
    kind: "bio",
    title: "About Yuan",
    body: "Yuan is a FlyRankAI intern building Capstone products across Backend AI Engineering and General AI Fluency. Yuan ships grounded AI systems with clear demos, honest evals, and polished product surfaces. Recently Yuan has shipped four live FlyRank Capstones: Checkpoint (embeddable lead-capture), Lens (image relevance with a mismatch guard), Broadcast (social campaign studio), and Muni (this grounded personal agent). Yuan's work focuses on retrieval with refusal policies, provider interfaces, durable jobs, and cost ledgers so AI decisions stay auditable.",
    sourceId: "persona.bio",
    tags: ["yuan", "flyrank", "intern", "builder", "who", "about"],
  },
  {
    kind: "project",
    title: "Checkpoint lead-capture platform",
    body: `Checkpoint is a FlyRank Capstone Yuan shipped: an embeddable widget and lead-capture platform with multi-tenant isolation, CORS allowlisting, geo-provider failover, spam heuristics, and an owner dashboard for submissions. Live demo: ${capstoneUrl("checkpoint")}.`,
    sourceId: "persona.checkpoint",
    tags: ["checkpoint", "widget", "leads", "multi-tenant"],
  },
  {
    kind: "project",
    title: "Lens image relevance",
    body: `Lens is a FlyRank Capstone Yuan shipped that tags images, ranks them by meaning, and refuses wrong pairings with a mismatch guard. It proves fox posts reject wolf images, reports top-1 precision, and keeps an owner review desk for suggestions and guard refusals. Live demo: ${capstoneUrl("lens")}.`,
    sourceId: "persona.lens",
    tags: ["lens", "vision", "embeddings", "guard", "mismatch"],
  },
  {
    kind: "project",
    title: "Broadcast social media studio",
    body: `Broadcast is a FlyRank Capstone Yuan shipped: a campaign studio that generates platform-aware captions and image variants for Instagram and X, with durable jobs, safe-zone crops, review desks, and signed webhook publishing. Live demo: ${capstoneUrl("broadcast")}.`,
    sourceId: "persona.broadcast",
    tags: ["broadcast", "social", "variants", "instagram", "x"],
  },
  {
    kind: "project",
    title: "Muni grounded personal agent",
    body: `Muni is Yuan's General AI Fluency Impact Project Capstone: a personal brand site plus a grounded agent that cites verified knowledge and refuses when evidence is missing. The name comes from Filipino muni-muni, thoughtful reflection. Muni retrieves knowledge cards, cites sources, keeps an owner decision inbox, and links Yuan's live Capstones. Live demo: ${capstoneUrl("muni")}.`,
    sourceId: "persona.muni",
    tags: ["muni", "agent", "grounding", "citations", "muni-muni"],
  },
  {
    kind: "skill",
    title: "Preferred stack",
    body: "Yuan prefers Next.js App Router, TypeScript, Prisma with SQLite (and Postgres on Vercel via Neon), Zod validation, Vitest, provider interfaces, durable jobs, and cost ledgers for Capstone AI apps and products. These are the technologies Yuan likes using.",
    sourceId: "persona.stack",
    tags: ["nextjs", "typescript", "prisma", "zod", "neon"],
  },
  {
    kind: "skill",
    title: "Backend AI craft",
    body: "Yuan focuses on structured model outputs, retrieval with refusal policies, eval harnesses, threshold sweeps, and human review desks that keep AI decisions auditable. Backend AI craft is a core strength, especially grounding guards that refuse weak evidence instead of inventing answers.",
    sourceId: "persona.craft",
    tags: ["retrieval", "eval", "policy", "review", "grounding"],
  },
  {
    kind: "faq",
    title: "What is Muni?",
    body: "Muni comes from Filipino muni-muni, meaning thoughtful reflection. Muni is a personal AI that thinks before answering, speaks only from verified knowledge, and honestly admits when it lacks evidence. It is Yuan's Capstone for grounded personal agents with citations and an owner inbox.",
    sourceId: "persona.faq.muni",
    tags: ["muni-muni", "filipino", "trust"],
  },
  {
    kind: "faq",
    title: "How can someone contact Yuan?",
    body: "Use the Contact section on the Muni site (https://muni-flyrank.vercel.app/#contact): open Yuan's GitHub at https://github.com/yuan05-afk, leave a note in chat so it lands in the owner inbox, or open any live Capstone demo (Checkpoint, Lens, Broadcast, Muni).",
    sourceId: "persona.faq.contact",
    tags: ["contact", "outreach", "github"],
  },
  {
    kind: "link",
    title: "FlyRank Capstones (live sites)",
    body: [
      "Yuan's four FlyRank Capstones are live and runnable.",
      ...CAPSTONE_LINKS.map((link) => `${link.name}: ${link.url}. ${link.tagline}`),
      "Each Capstone is also published as a public GitHub repository with a pitch README, screenshots, and demos.",
    ].join(" "),
    sourceId: "persona.links.capstones",
    tags: ["github", "portfolio", "capstones", "links", "live", "websites", "demo"],
  },
];

export const EVAL_CASES = [
  {
    id: "in-scope-lens",
    question: "What is Lens and what does its mismatch guard do?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "Lens",
  },
  {
    id: "in-scope-muni",
    question: "What does Muni mean and what is this personal agent for?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "Muni",
  },
  {
    id: "paraphrase-stack",
    question: "Which technologies does Yuan like using for Capstone AI apps?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "stack",
  },
  {
    id: "out-of-scope-salary",
    question: "What is Yuan's secret salary and bank account number?",
    expectedStatus: "refused" as const,
    expectedTitleIncludes: null,
  },
  {
    id: "out-of-scope-fantasy",
    question: "Which NBA team did Yuan play for last season?",
    expectedStatus: "refused" as const,
    expectedTitleIncludes: null,
  },
];
