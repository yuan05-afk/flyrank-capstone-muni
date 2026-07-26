export type Audience = "recruiter" | "investor" | "client" | "peer" | "general";

export type AudienceSuggestion = {
  label: string;
  question: string;
  kind: "grounded" | "refuse-demo";
};

export const AUDIENCE_OPENERS: Record<
  Audience,
  {
    label: string;
    opener: string;
    starter: string;
    blurb: string;
    suggestions: AudienceSuggestion[];
  }
> = {
  recruiter: {
    label: "Recruiter",
    opener: "Ask about skills, projects, and what Yuan builds next.",
    starter: "What projects show Yuan's backend AI engineering strengths?",
    blurb: "Skills, shipped work, stack",
    suggestions: [
      {
        label: "College + FEU",
        question: "Where does Yuan go to college and what is Yuan studying?",
        kind: "grounded",
      },
      {
        label: "Shipped projects",
        question: "What Capstone projects has Yuan shipped?",
        kind: "grounded",
      },
      {
        label: "Preferred stack",
        question: "Which technologies does Yuan like using for Capstone AI apps?",
        kind: "grounded",
      },
    ],
  },
  investor: {
    label: "Investor",
    opener: "Ask about impact, product thinking, and market relevance.",
    starter: "How does Muni prove a grounded personal AI product story?",
    blurb: "Product story, impact",
    suggestions: [
      {
        label: "Why Muni",
        question: "What does Muni mean and what is this personal agent for?",
        kind: "grounded",
      },
      {
        label: "Lens guard",
        question: "What is Lens and what does its mismatch guard do?",
        kind: "grounded",
      },
      {
        label: "Capstones portfolio",
        question: "Where does Yuan publish Capstone work?",
        kind: "grounded",
      },
    ],
  },
  client: {
    label: "Client",
    opener: "Ask what Yuan can ship and how collaboration starts.",
    starter: "What Capstone work has Yuan shipped recently?",
    blurb: "Delivery, contact",
    suggestions: [
      {
        label: "Recent Capstones",
        question: "What Capstone work has Yuan shipped recently?",
        kind: "grounded",
      },
      {
        label: "Broadcast studio",
        question: "What is Broadcast and what does it generate?",
        kind: "grounded",
      },
      {
        label: "Contact Yuan",
        question: "How can someone contact Yuan?",
        kind: "grounded",
      },
    ],
  },
  peer: {
    label: "Peer",
    opener: "Ask about craft, stack choices, and learning habits.",
    starter: "What stack does Yuan prefer for Capstone AI products?",
    blurb: "Craft, stack, evals",
    suggestions: [
      {
        label: "Preferred stack",
        question: "What stack does Yuan prefer for Capstone AI products?",
        kind: "grounded",
      },
      {
        label: "Eval habits",
        question: "How does Yuan keep AI decisions auditable?",
        kind: "grounded",
      },
      {
        label: "Lens pairing",
        question: "What is Lens and what does its mismatch guard do?",
        kind: "grounded",
      },
    ],
  },
  general: {
    label: "General",
    opener: "Ask anything about Yuan that lives in the verified knowledge base.",
    starter: "Who is Yuan and what is Muni?",
    blurb: "Bio, Muni, demos",
    suggestions: [
      {
        label: "Who is Yuan?",
        question: "Who is Yuan and what does Yuan build?",
        kind: "grounded",
      },
      {
        label: "College + FEU",
        question: "Where does Yuan study and what program?",
        kind: "grounded",
      },
      {
        label: "Demo refuse",
        question: "What is Yuan's secret salary?",
        kind: "refuse-demo",
      },
    ],
  },
};
