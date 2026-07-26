export type StarterSuggestion = {
  label: string;
  question: string;
  kind: "grounded" | "refuse-demo";
};

/**
 * Single-purpose starter prompts for Muni.
 * Audience personas were removed: they only changed UI copy, not grounding behavior.
 */
export const CHAT_OPENER =
  "Ask about Yuan's college, Capstones, personal and course projects, skills, or how to leave a note. I only answer from verified knowledge.";

export const CHAT_STARTER = "Who is Yuan and what does Yuan build?";

export const STARTER_SUGGESTIONS: StarterSuggestion[] = [
  {
    label: "Who is Yuan?",
    question: "Who is Yuan and what does Yuan build?",
    kind: "grounded",
  },
  {
    label: "College + FEU",
    question: "Where does Yuan go to college and what is Yuan studying?",
    kind: "grounded",
  },
  {
    label: "Shipped Capstones",
    question: "What Capstone projects has Yuan shipped?",
    kind: "grounded",
  },
  {
    label: "Other projects",
    question: "What personal and course projects has Yuan built besides Capstones?",
    kind: "grounded",
  },
  {
    label: "Preferred stack",
    question: "Which technologies does Yuan like using for Capstone AI apps?",
    kind: "grounded",
  },
  {
    label: "Contact Yuan",
    question: "How can someone contact Yuan?",
    kind: "grounded",
  },
  {
    label: "Demo refuse",
    question: "What is Yuan's secret salary?",
    kind: "refuse-demo",
  },
];
