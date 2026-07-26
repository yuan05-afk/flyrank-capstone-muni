import { GUARD_CONFIG, GROUNDING_POLICY_ID } from "@/config/guard.config";

export type GuardFeatures = {
  bestScore: number;
  confidence: number;
  citationCount: number;
  retrievedCount: number;
  topicalOverlap: number;
  belowSimilarityFloor: boolean;
  belowConfidenceFloor: boolean;
  belowTopicalFloor: boolean;
  citationsValid: boolean;
};

export type GuardVerdict = {
  accepted: boolean;
  status: "grounded" | "guarded" | "refused" | "open";
  reason: string | null;
  policyId: string;
  features: GuardFeatures;
};

/** Short hellos / thanks that should not hit the grounding refuse path. */
export function isSocialOpener(question: string): boolean {
  const cleaned = question
    .trim()
    .toLowerCase()
    .replace(/[!?.,…]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length > 48) return false;

  const openers = [
    /^(hi|hello|hey|yo|howdy)( there)?$/,
    /^(hi|hello|hey)\s+(muni|there)$/,
    /^(good\s+)?(morning|afternoon|evening)$/,
    /^how are you( doing)?$/,
    /^what'?s up$/,
    /^(thanks|thank you|thx|ty)( so much)?$/,
    /^(ok|okay|cool|nice|great|got it)$/,
  ];
  return openers.some((pattern) => pattern.test(cleaned));
}

/**
 * Privacy policy is deterministic and runs before retrieval. Sensitive terms
 * can legitimately appear in refusal FAQ cards, so semantic similarity alone
 * must never turn a private-data request into a grounded answer.
 */
export function isSensitivePrivateQuestion(question: string): boolean {
  const cleaned = question.toLowerCase().replace(/\s+/g, " ").trim();
  const privatePatterns = [
    /\b(salary|compensation|income|paycheck|bank|bank account|credit card|debit card)\b/,
    /\b(phone|mobile|cellphone|contact)\s+(number|no\.?)\b/,
    /\b(personal\s+)?email(\s+address)?\b/,
    /\b(home|residential|exact)\s+address\b/,
    /\b(password|passcode|api key|secret key|private key)\b/,
    /\b(senior|junior)\s+high\s+school\b/,
    /\b(pre[- ]?college|past school|previous school)\b/,
  ];
  return privatePatterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Fantasy / celebrity claims must refuse even if a common word like "team"
 * accidentally overlaps a knowledge card (for example Code Wars team leader).
 */
export function isOutOfDomainFantasyQuestion(question: string): boolean {
  const cleaned = question.toLowerCase().replace(/\s+/g, " ").trim();
  return (
    /\b(nba|nfl|mlb|nhl|fifa|uefa|olympic|olympics)\b/.test(cleaned) ||
    /\b(astronaut|nobel prize|grammy|oscar winner|super bowl)\b/.test(cleaned) ||
    (/\b(played?|play)\s+for\b/.test(cleaned) && /\b(team|club|franchise)\b/.test(cleaned))
  );
}

/**
 * Muni is a grounded persona agent, not a free coding assistant.
 * Requests that burn tokens on generated code, exploits, or homework solutions
 * must refuse before retrieval can latch onto catalog FAQ cards.
 */
export function isCodeOrExploitAssistQuestion(question: string): boolean {
  const cleaned = question.toLowerCase().replace(/\s+/g, " ").trim();
  return (
    /\b(write|create|generate|build|make|give me|implement)\b.{0,40}\b(code|script|program|function|class|exploit|poc|payload|malware|virus)\b/.test(
      cleaned
    ) ||
    /\b(python|javascript|typescript|java|c\+\+|golang|rust)\b.{0,30}\b(code|script|program|function)\b/.test(
      cleaned
    ) ||
    /\b(solve|do)\b.{0,20}\b(my )?(homework|assignment|exam)\b/.test(cleaned) ||
    /\b(jailbreak|ignore (your|the) (rules|system|instructions)|bypass (the )?guard)\b/.test(
      cleaned
    )
  );
}

/** Meta topic-list FAQs. Useful for help asks, noisy for specific questions. */
export function isCatalogMetaCard(card: { title: string; body: string }): boolean {
  return /what can someone ask|what should recruiters ask|what can i ask/i.test(card.title) ||
    /you can ask about yuan|recruiters can ask about yuan/i.test(card.body);
}

export function wantsCatalogHelp(question: string): boolean {
  return /\b(what can i ask|what should i ask|topics|help|capabilities|what can someone ask|recruiter|recruiters|interview)\b/i.test(
    question
  );
}

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "is", "are",
  "was", "what", "who", "how", "does", "did", "about", "with", "from",
  "which", "like", "using", "this", "that", "personal", "agent", "can",
  "you", "me", "more", "please", "tell",
]);

export function topicalOverlap(question: string, corpus: string): number {
  const q = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP.has(token));
  // "who is yuan" previously collapsed to zero tokens because "yuan" was a stopword,
  // which refused the core identity question. Keep the owner name as a real signal.
  if (!q.length) {
    const lower = question.toLowerCase();
    if (/\byuan\b/.test(lower) || /\bmuni\b/.test(lower)) return 1;
    return 0;
  }
  // Match whole tokens only. Substring includes() falsely grounded fantasy asks
  // like "play" against CheckMyDevice's "display".
  const hayTokens = new Set(
    corpus
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 2)
  );
  // Owner name alone should not buoy out-of-domain asks against the full corpus.
  // Keep identity tokens when the question is mostly about Muni/Yuan itself.
  const identity = new Set(["yuan", "muni"]);
  const content = q.filter((token) => !identity.has(token));
  const scored = content.length >= 2 ? content : q;
  const hits = scored.filter((token) => hayTokens.has(token)).length;
  return hits / scored.length;
}

export function guardGrounding(input: {
  bestScore: number;
  confidence: number;
  retrievedCount: number;
  citationCardIds: string[];
  allowedCardIds: string[];
  topicalOverlap?: number;
}): GuardVerdict {
  const overlap = input.topicalOverlap ?? 1;
  const citationsValid =
    input.citationCardIds.length > 0 &&
    input.citationCardIds.every((id) => input.allowedCardIds.includes(id));

  const features: GuardFeatures = {
    bestScore: Number(input.bestScore.toFixed(4)),
    confidence: Number(input.confidence.toFixed(4)),
    citationCount: input.citationCardIds.length,
    retrievedCount: input.retrievedCount,
    topicalOverlap: Number(overlap.toFixed(4)),
    belowSimilarityFloor: input.bestScore < GUARD_CONFIG.similarityThreshold,
    belowConfidenceFloor: input.confidence < GUARD_CONFIG.confidenceThreshold,
    belowTopicalFloor: overlap < 0.2,
    citationsValid,
  };

  if (features.belowSimilarityFloor || input.retrievedCount === 0 || features.belowTopicalFloor) {
    return {
      accepted: false,
      status: "refused",
        reason: features.belowTopicalFloor
        ? `Topical overlap ${overlap.toFixed(2)} is below the 0.20 grounding floor.`
        : `Similarity ${input.bestScore.toFixed(2)} is below the ${GUARD_CONFIG.similarityThreshold.toFixed(2)} grounding floor.`,
      policyId: GROUNDING_POLICY_ID,
      features,
    };
  }

  if (!citationsValid) {
    return {
      accepted: false,
      status: "guarded",
      reason: "Answer citations do not map to retrieved knowledge cards.",
      policyId: GROUNDING_POLICY_ID,
      features,
    };
  }

  if (features.belowConfidenceFloor) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Confidence ${input.confidence.toFixed(2)} is below the ${GUARD_CONFIG.confidenceThreshold.toFixed(2)} review floor.`,
      policyId: GROUNDING_POLICY_ID,
      features,
    };
  }

  return {
    accepted: true,
    status: "grounded",
    reason: null,
    policyId: GROUNDING_POLICY_ID,
    features,
  };
}
