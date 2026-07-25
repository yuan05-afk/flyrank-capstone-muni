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

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "is", "are",
  "was", "what", "who", "how", "does", "did", "yuan", "about", "with", "from",
  "which", "like", "using", "this", "that", "personal", "agent",
]);

export function topicalOverlap(question: string, corpus: string): number {
  const q = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP.has(token));
  if (!q.length) return 0;
  const hay = corpus.toLowerCase();
  const hits = q.filter((token) => hay.includes(token)).length;
  return hits / q.length;
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
