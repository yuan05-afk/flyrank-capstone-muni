export type Audience = "recruiter" | "investor" | "client" | "peer" | "general";

export const AUDIENCE_OPENERS: Record<
  Audience,
  { label: string; opener: string; starter: string }
> = {
  recruiter: {
    label: "Recruiter",
    opener: "Ask about skills, projects, and what Yuan is looking for next.",
    starter: "What projects show Yuan's backend AI engineering strengths?",
  },
  investor: {
    label: "Investor",
    opener: "Ask about impact, product thinking, and market relevance.",
    starter: "How does Muni prove a grounded personal AI product story?",
  },
  client: {
    label: "Client",
    opener: "Ask what Yuan can ship and how collaboration works.",
    starter: "What Capstone work has Yuan shipped recently?",
  },
  peer: {
    label: "Peer",
    opener: "Ask about craft, stack choices, and learning habits.",
    starter: "What stack does Yuan prefer for Capstone AI products?",
  },
  general: {
    label: "General",
    opener: "Ask anything about Yuan that lives in the verified knowledge base.",
    starter: "Who is Yuan and what is Muni?",
  },
};
