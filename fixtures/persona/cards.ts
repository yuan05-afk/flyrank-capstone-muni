import { CAPSTONE_LINKS, capstoneUrl } from "../../config/capstones.config";

export type PersonaCard = {
  kind: "bio" | "project" | "skill" | "faq" | "link";
  title: string;
  body: string;
  sourceId?: string;
  tags: string[];
};

/**
 * Verified persona knowledge for Muni.
 * Privacy: no phone, no email, no pre-college schools. College (FEU) is allowed.
 * Contact path is GitHub + Muni chat / Contact section only.
 */
export const PERSONA_CARDS: PersonaCard[] = [
  {
    kind: "bio",
    title: "About Yuan",
    body: "Yuan Andrei C. Mariano goes by Yuan. Yuan is a Bachelor of Science in Computer Science student specializing in Data Science at Far Eastern University (FEU), and a FlyRankAI intern building Capstone products across Backend AI Engineering and General AI Fluency. Yuan has training in machine learning, data analysis, artificial intelligence, and software engineering, with hands-on experience from academic projects, collaborative work, and technical tasks in data modeling, programming, problem-solving, algorithm development, and data-driven solutions. Recently Yuan shipped four live FlyRank Capstones: Checkpoint, Lens, Broadcast, and Muni. Yuan is based in the Philippines.",
    sourceId: "persona.bio",
    tags: ["yuan", "andrei", "mariano", "who", "about", "bio", "introduction", "philippines", "intern", "flyrank"],
  },
  {
    kind: "bio",
    title: "Full name and identity",
    body: "Yuan's full name is Yuan Andrei C. Mariano. In product work and Capstones, Yuan usually goes by Yuan. Muni is Yuan's grounded personal agent and digital twin for verified questions about work, skills, education at the college level, and shipped projects.",
    sourceId: "persona.identity",
    tags: ["name", "full name", "yuan andrei", "mariano", "identity", "who are you"],
  },
  {
    kind: "bio",
    title: "College education",
    body: "Yuan studies at Far Eastern University (FEU) in a Bachelor of Science in Computer Science program with a Specialization in Data Science (2023 to present). Yuan is a consistent Dean's Lister and President's Lister for academic years 2023 to present. Muni only shares college-level education. Pre-college schools are not part of the verified knowledge base.",
    sourceId: "persona.education",
    tags: ["education", "college", "feu", "far eastern university", "computer science", "data science", "degree", "dean", "president", "lister", "school", "university", "studying"],
  },
  {
    kind: "bio",
    title: "Academic standing",
    body: "At Far Eastern University, Yuan has been a consistent Dean's Lister and President's Lister from AY 2023 to present while pursuing BS Computer Science with Specialization in Data Science. That academic standing reflects strong performance alongside Capstone shipping and organization involvement.",
    sourceId: "persona.academics",
    tags: ["dean's list", "president's list", "honors", "grades", "academic", "awards", "feu"],
  },
  {
    kind: "bio",
    title: "Where Yuan is based",
    body: "Yuan is based in the Philippines. For outreach, use GitHub or leave a note in Muni chat rather than asking for private contact details. Muni does not share phone numbers or personal email from the knowledge base.",
    sourceId: "persona.location",
    tags: ["location", "where", "philippines", "based", "live", "from"],
  },
  {
    kind: "bio",
    title: "FlyRankAI internship",
    body: "Yuan is a FlyRankAI intern focused on Backend AI Engineering and General AI Fluency. The internship track ships Capstone products with clear demos, honest evals, provider interfaces, durable jobs, cost ledgers, and grounding or mismatch guards so AI behavior stays auditable. The four live Capstones from this work are Checkpoint, Lens, Broadcast, and Muni.",
    sourceId: "persona.internship",
    tags: ["internship", "flyrank", "flyrankai", "intern", "work", "job", "experience", "backend ai", "fluency"],
  },
  {
    kind: "project",
    title: "Checkpoint lead-capture platform",
    body: `Checkpoint is a FlyRank Capstone Yuan shipped: an embeddable widget and lead-capture platform with multi-tenant isolation, CORS allowlisting, geo-provider failover, spam heuristics, and an owner dashboard for submissions. It proves production-minded API and widget craft. Live demo: ${capstoneUrl("checkpoint")}.`,
    sourceId: "persona.checkpoint",
    tags: ["checkpoint", "widget", "leads", "multi-tenant", "cors", "geo", "project", "capstone"],
  },
  {
    kind: "project",
    title: "Lens image relevance",
    body: `Lens is a FlyRank Capstone Yuan shipped that tags images, ranks them by meaning, and refuses wrong pairings with a mismatch guard. It proves fox posts reject wolf images, reports top-1 precision, and keeps an owner review desk for suggestions and guard refusals. Live demo: ${capstoneUrl("lens")}.`,
    sourceId: "persona.lens",
    tags: ["lens", "vision", "embeddings", "guard", "mismatch", "image", "tagging", "project", "capstone"],
  },
  {
    kind: "project",
    title: "Broadcast social media studio",
    body: `Broadcast is a FlyRank Capstone Yuan shipped: a campaign studio that generates platform-aware captions and image variants for Instagram and X, with durable jobs, safe-zone crops, review desks, and signed webhook publishing. Live demo: ${capstoneUrl("broadcast")}.`,
    sourceId: "persona.broadcast",
    tags: ["broadcast", "social", "variants", "instagram", "x", "campaign", "project", "capstone"],
  },
  {
    kind: "project",
    title: "Muni grounded personal agent",
    body: `Muni is Yuan's General AI Fluency Impact Project Capstone: a personal brand site plus a grounded agent that cites verified knowledge and refuses when evidence is missing. The name comes from Filipino muni-muni, thoughtful reflection. Muni retrieves knowledge cards, cites sources, keeps an owner decision inbox, and links Yuan's live Capstones. Live demo: ${capstoneUrl("muni")}.`,
    sourceId: "persona.muni",
    tags: ["muni", "agent", "grounding", "citations", "muni-muni", "chatbot", "project", "capstone"],
  },
  {
    kind: "project",
    title: "Capstone portfolio overview",
    body: `Yuan has shipped four live FlyRank Capstones that form a portfolio: Checkpoint for embeddable lead capture, Lens for image relevance with a mismatch guard, Broadcast for social campaign variants, and Muni for grounded personal answers with citations. Together they show widget APIs, retrieval guards, durable jobs, eval habits, and product polish. Live sites: ${CAPSTONE_LINKS.map((l) => `${l.name} ${l.url}`).join("; ")}.`,
    sourceId: "persona.portfolio",
    tags: ["portfolio", "projects", "capstones", "shipped", "work", "demos", "overview", "what has yuan built"],
  },
  {
    kind: "skill",
    title: "Preferred Capstone stack",
    body: "For Capstone AI apps and products, Yuan prefers Next.js App Router, TypeScript, Prisma with SQLite locally and Postgres on Vercel via Neon, Zod validation, Vitest, Framer Motion and Lenis for motion, provider interfaces for chat and embeddings, durable jobs, and cost ledgers. These are the technologies Yuan likes using when shipping grounded AI products.",
    sourceId: "persona.stack",
    tags: ["nextjs", "typescript", "prisma", "zod", "neon", "stack", "tech", "framework", "preferred"],
  },
  {
    kind: "skill",
    title: "Programming languages",
    body: "Yuan works with Python, Java, C++, and PHP for coursework and technical practice, and uses TypeScript and JavaScript heavily for Capstone product work with Next.js. Yuan also practices competitive programming and algorithm development under time constraints.",
    sourceId: "persona.languages",
    tags: ["python", "java", "c++", "php", "typescript", "javascript", "languages", "coding", "programming"],
  },
  {
    kind: "skill",
    title: "Data analytics and databases",
    body: "Yuan's Data Science track includes Microsoft Excel, Tableau, MySQL, and Oracle Database, plus data entry and data management habits. Yuan applies data modeling and analysis skills alongside Capstone retrieval and eval work.",
    sourceId: "persona.data",
    tags: ["excel", "tableau", "mysql", "oracle", "database", "analytics", "data science", "sql", "data"],
  },
  {
    kind: "skill",
    title: "Development tools",
    body: "Yuan's day-to-day tools include Visual Studio Code, Google Colab, GitHub, and XAMPP for relevant coursework stacks, plus Git-based workflows for Capstone repos. Yuan completed a Microsoft Office GitHub Copilot Bootcamp as an AI Coding Trainee in June 2025.",
    sourceId: "persona.tools",
    tags: ["vscode", "colab", "github", "xampp", "tools", "copilot", "git"],
  },
  {
    kind: "skill",
    title: "Backend AI craft",
    body: "Yuan focuses on structured model outputs, retrieval with refusal policies, eval harnesses, threshold sweeps, and human review desks that keep AI decisions auditable. Backend AI craft is a core strength, especially grounding guards that refuse weak evidence instead of inventing answers.",
    sourceId: "persona.craft",
    tags: ["retrieval", "eval", "policy", "review", "grounding", "backend", "ai engineering", "thresholds"],
  },
  {
    kind: "skill",
    title: "AI prompting and responsible AI",
    body: "In June 2025 Yuan trained as an AI Prompt Design Trainee in the National AI Prompt Design Challenge (NAIPDC) Bootcamp Philippines 2025, practicing prompt engineering for accuracy, relevance, and ethical AI use. Yuan also completed a GitHub Copilot Bootcamp focused on AI-assisted coding, debugging productivity, and responsible AI use in programming workflows.",
    sourceId: "persona.ai-training",
    tags: ["prompt", "prompting", "naipdc", "copilot", "responsible ai", "bootcamp", "training", "generative ai"],
  },
  {
    kind: "skill",
    title: "Competitive programming",
    body: "In March 2025 Yuan served as Team Leader for Code Wars during the 41st Computer Science Week at the University of the Philippines Los Baños. The experience strengthened logical thinking, algorithmic reasoning, and coding efficiency under time constraints in a collaborative competitive setting.",
    sourceId: "persona.codewars",
    tags: ["code wars", "competitive programming", "uplb", "algorithms", "team leader", "contest"],
  },
  {
    kind: "skill",
    title: "Typing and execution speed",
    body: "Yuan reports a fast typing speed of about 120 words per minute, useful for rapid documentation, coding sessions, and turning product ideas into shipped Capstone surfaces quickly.",
    sourceId: "persona.typing",
    tags: ["typing", "wpm", "speed", "120", "productivity"],
  },
  {
    kind: "bio",
    title: "Organizations and leadership",
    body: "Yuan is a member of the Junior Philippine Computer Society (JPCS) from August 2024 to present, joining technology-focused events, trainings, and professional development. Yuan is also a member of the Association for Computing Machinery (ACM) from August 2023 to present, engaging in seminars, workshops, and technical discussions. Through ACM and JPCS, Yuan helps promote and coordinate academic and technology events, assists with digital promotional materials and online engagement, and attends webinars on computer science, AI, leadership, and digital skills.",
    sourceId: "persona.orgs",
    tags: ["jpcs", "acm", "organization", "leadership", "member", "community", "events", "volunteer"],
  },
  {
    kind: "faq",
    title: "What is Muni?",
    body: "Muni comes from Filipino muni-muni, meaning thoughtful reflection. Muni is a personal AI that thinks before answering, speaks only from verified knowledge, and honestly admits when it lacks evidence. It is Yuan's Capstone for grounded personal agents with citations and an owner inbox.",
    sourceId: "persona.faq.muni",
    tags: ["muni-muni", "filipino", "trust", "what is muni", "agent", "chatbot"],
  },
  {
    kind: "faq",
    title: "Who is Yuan?",
    body: "Yuan Andrei C. Mariano is a FEU BS Computer Science (Data Science) student, Dean's and President's Lister, FlyRankAI intern, and builder of four live Capstones: Checkpoint, Lens, Broadcast, and Muni. Ask Muni about college education, skills, projects, organizations, or how to leave a note. Muni will refuse private details that are not in the verified cards.",
    sourceId: "persona.faq.who",
    tags: ["who is yuan", "about yuan", "introduce", "summary"],
  },
  {
    kind: "faq",
    title: "How can someone contact Yuan?",
    body: "To leave a note for Yuan, type your question in Muni chat even if Muni refuses. Refused asks land in Yuan's owner inbox as knowledge gaps. You can also open the Contact section at https://muni-flyrank.vercel.app/#contact, GitHub at https://github.com/yuan05-afk, or any live Capstone demo. Muni does not publish phone numbers or personal email addresses from the knowledge base.",
    sourceId: "persona.faq.contact",
    tags: ["contact", "outreach", "github", "email", "phone", "reach", "message", "hire"],
  },
  {
    kind: "faq",
    title: "What should recruiters ask Muni?",
    body: "Recruiters can ask about Yuan's college program at FEU, Dean's and President's Lister standing, preferred Capstone stack, programming languages, data tools, Backend AI craft, FlyRank internship Capstones, ACM and JPCS involvement, Copilot and NAIPDC training, and Code Wars team leadership. For private contact details not in the knowledge base, leave a note in chat or use GitHub.",
    sourceId: "persona.faq.recruiter",
    tags: ["recruiter", "hiring", "interview", "cv", "resume", "candidate"],
  },
  {
    kind: "faq",
    title: "Is Yuan open to opportunities?",
    body: "Yuan is actively building as a FlyRankAI intern and FEU Computer Science (Data Science) student. For internship, collaboration, or project opportunities, leave a note in Muni chat or reach out via GitHub at https://github.com/yuan05-afk. Muni can describe skills and shipped work from verified cards, then Yuan can follow up personally.",
    sourceId: "persona.faq.opportunities",
    tags: ["opportunity", "available", "hire", "open to work", "collaborate", "internship offer"],
  },
  {
    kind: "faq",
    title: "What will Muni refuse?",
    body: "Muni refuses questions without verified evidence, including secret salary, bank details, private phone numbers, personal email, home address specifics beyond general Philippines-based presence, pre-college school history, and fantasy claims. Refusals are intentional. Type anyway to leave a knowledge-gap note in Yuan's owner inbox.",
    sourceId: "persona.faq.refuse",
    tags: ["refuse", "privacy", "salary", "secret", "cannot answer", "guard", "out of scope"],
  },
  {
    kind: "faq",
    title: "What is Yuan studying?",
    body: "Yuan is studying Bachelor of Science in Computer Science with Specialization in Data Science at Far Eastern University (FEU), from 2023 to present, and is a consistent Dean's Lister and President's Lister.",
    sourceId: "persona.faq.studying",
    tags: ["studying", "major", "course", "program", "bs cs", "data science specialization"],
  },
  {
    kind: "faq",
    title: "Does Yuan have organization experience?",
    body: "Yes. Yuan is a member of JPCS (Junior Philippine Computer Society) since August 2024 and ACM (Association for Computing Machinery) since August 2023. Yuan supports technology events, promotional materials, online engagement, and attends seminars on CS, AI, leadership, and digital skills.",
    sourceId: "persona.faq.orgs",
    tags: ["organization experience", "extracurricular", "clubs", "societies"],
  },
  {
    kind: "faq",
    title: "What AI training has Yuan completed?",
    body: "In June 2025 Yuan completed two focused AI trainings: AI Coding Trainee in the GitHub Copilot Bootcamp (Microsoft Office) for AI-assisted coding and responsible AI use, and AI Prompt Design Trainee in the National AI Prompt Design Challenge (NAIPDC) Bootcamp Philippines 2025 for prompt engineering, relevance, and ethical generative AI use.",
    sourceId: "persona.faq.training",
    tags: ["training", "certificate", "bootcamp", "copilot", "naipdc", "ai training"],
  },
  {
    kind: "faq",
    title: "How does Yuan keep AI honest?",
    body: "Yuan designs grounding and mismatch guards, citation chips, eval harnesses, threshold sweeps, cost ledgers, and owner review desks. Muni itself is the Impact Project proof: answers must map to verified knowledge cards or Muni refuses instead of inventing.",
    sourceId: "persona.faq.honest-ai",
    tags: ["honest", "trust", "eval", "grounding", "auditable", "safety"],
  },
  {
    kind: "faq",
    title: "What can someone ask Muni about?",
    body: "You can ask about Yuan's college education at FEU, academic standing, FlyRank internship, Capstone projects and live demos, preferred stack, programming languages, data tools, Backend AI craft, AI bootcamps, Code Wars leadership, ACM and JPCS, contact via GitHub or chat notes, and what Muni will refuse. Ask naturally. Muni retrieves the matching cards and cites them.",
    sourceId: "persona.faq.topics",
    tags: ["what can i ask", "topics", "help", "capabilities", "questions"],
  },
  {
    kind: "faq",
    title: "How do citations work?",
    body: "When Muni answers from verified knowledge, it attaches citation chips that map to knowledge cards such as bio, project, skill, faq, or link cards. Tap a chip to inspect the source quote. If grounding is weak, Muni refuses instead of citing guesswork.",
    sourceId: "persona.faq.citations",
    tags: ["citations", "sources", "chips", "evidence", "how citations"],
  },
  {
    kind: "faq",
    title: "What is the difference between Checkpoint Lens Broadcast and Muni?",
    body: "Checkpoint captures leads through an embeddable widget with tenant isolation. Lens matches images to meaning and refuses mismatches. Broadcast generates platform-aware social variants with jobs and webhooks. Muni is the personal grounded agent that answers from Yuan's verified knowledge with citations. All four are live Capstones Yuan shipped.",
    sourceId: "persona.faq.compare-capstones",
    tags: ["difference", "compare", "which project", "four capstones"],
  },
  {
    kind: "link",
    title: "FlyRank Capstones (live sites)",
    body: [
      "Yuan's four FlyRank Capstones are live and runnable.",
      ...CAPSTONE_LINKS.map((link) => `${link.name}: ${link.url}. ${link.tagline}`),
      "Each Capstone is also published as a public GitHub repository with a pitch README, screenshots, and demos.",
      "GitHub profile: https://github.com/yuan05-afk",
    ].join(" "),
    sourceId: "persona.links.capstones",
    tags: ["github", "portfolio", "capstones", "links", "live", "websites", "demo", "repos"],
  },
  {
    kind: "link",
    title: "GitHub profile",
    body: "Yuan's GitHub profile is https://github.com/yuan05-afk. It is the public place to browse Capstone repos, READMEs, and demos. Prefer GitHub or Muni chat notes over asking Muni for private phone or email.",
    sourceId: "persona.links.github",
    tags: ["github", "yuan05-afk", "profile", "repos", "code"],
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
    id: "in-scope-education",
    question: "Where does Yuan go to college and what is Yuan studying?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "College",
  },
  {
    id: "in-scope-name",
    question: "What is Yuan's full name?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "name",
  },
  {
    id: "in-scope-orgs",
    question: "What organizations is Yuan part of?",
    expectedStatus: "grounded" as const,
    expectedTitleIncludes: "Organization",
  },
  {
    id: "out-of-scope-salary",
    question: "What is Yuan's secret salary and bank account number?",
    expectedStatus: "refused" as const,
    expectedTitleIncludes: null,
  },
  {
    id: "out-of-scope-phone",
    question: "What is Yuan's phone number?",
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
