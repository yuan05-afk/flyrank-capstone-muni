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
    body: "Yuan is a FlyRankAI intern building Capstone products across Backend AI Engineering and General AI Fluency. Yuan ships grounded AI systems with clear demos, honest evals, and polished product surfaces.",
    sourceId: "persona.bio",
    tags: ["yuan", "flyrank", "intern", "builder"],
  },
  {
    kind: "project",
    title: "Lens image relevance",
    body: "Lens is a Capstone that tags images, ranks them by meaning, and refuses wrong pairings with a mismatch guard. It proves fox posts reject wolf images and reports top-1 precision.",
    sourceId: "persona.lens",
    tags: ["lens", "vision", "embeddings", "guard"],
  },
  {
    kind: "project",
    title: "Broadcast social media studio",
    body: "Broadcast is a Capstone campaign studio that generates platform-aware captions and image variants with durable jobs and review desks.",
    sourceId: "persona.broadcast",
    tags: ["broadcast", "social", "variants"],
  },
  {
    kind: "project",
    title: "Muni grounded personal agent",
    body: "Muni is Yuan's General AI Fluency Impact Project: a personal brand site plus a grounded agent that cites verified knowledge and refuses when evidence is missing.",
    sourceId: "persona.muni",
    tags: ["muni", "agent", "grounding", "citations"],
  },
  {
    kind: "skill",
    title: "Preferred stack",
    body: "Yuan prefers Next.js App Router, TypeScript, Prisma with SQLite, Zod validation, Vitest, provider interfaces, durable jobs, and cost ledgers for Capstone AI apps and products. These are the technologies Yuan likes using.",
    sourceId: "persona.stack",
    tags: ["nextjs", "typescript", "prisma", "zod"],
  },
  {
    kind: "skill",
    title: "Backend AI craft",
    body: "Yuan focuses on structured model outputs, retrieval with refusal policies, eval harnesses, threshold sweeps, and human review desks that keep AI decisions auditable.",
    sourceId: "persona.craft",
    tags: ["retrieval", "eval", "policy", "review"],
  },
  {
    kind: "faq",
    title: "What is Muni?",
    body: "Muni comes from Filipino muni-muni, meaning thoughtful reflection. Muni is a personal AI that thinks before answering, speaks only from verified knowledge, and honestly admits when it lacks evidence.",
    sourceId: "persona.faq.muni",
    tags: ["muni-muni", "filipino", "trust"],
  },
  {
    kind: "faq",
    title: "How can someone contact Yuan?",
    body: "Visitors can use the contact section on the Muni site or leave a question in chat. If Muni lacks grounding for a topic, it offers to connect the visitor with Yuan directly.",
    sourceId: "persona.faq.contact",
    tags: ["contact", "outreach"],
  },
  {
    kind: "link",
    title: "FlyRank Capstones",
    body: "Yuan publishes Capstone work as public GitHub repositories with pitch READMEs, screenshots, and runnable demos for reviewers and collaborators.",
    sourceId: "persona.links.github",
    tags: ["github", "portfolio", "capstones"],
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
