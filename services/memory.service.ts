/**
 * Conversation memory helpers for Muni.
 * Follow-ups stay grounded: we expand retrieval from prior turns and
 * never invent facts outside the knowledge cards.
 */

export type PriorTurn = {
  question: string;
  answer: string;
  status: string;
  citationTitles: string[];
  citationCardIds: string[];
};

const FOLLOW_UP = [
  /^(can you |could you |please )?(expound|elaborate|expand|explain more|tell me more|go (deeper|on)|continue|say more)\b/i,
  /^(more|details|elaborate|expound|expand)(!|\.|$|\s)/i,
  /^(and )?(then|also)\??$/i,
  /^(why|how so|what else|anything else)\??$/i,
  /^(what|how|tell me) (about|more about) (that|it|this|them|him|her)\b/i,
  /^(who is|what about) (he|she|they|him|her|that)\??$/i,
];

/** Identity asks that should always land on the About Yuan bio card. */
const IDENTITY = [
  /^who (is|are) yuan\b/i,
  /^tell me about yuan\b/i,
  /^what (does|do) yuan (do|build|work on)\b/i,
  /^about yuan\b/i,
  /^who('?s| is) (he|she)\??$/i,
];

export function isFollowUpQuestion(question: string): boolean {
  const cleaned = question.trim();
  if (!cleaned || cleaned.length > 120) return false;
  return FOLLOW_UP.some((pattern) => pattern.test(cleaned));
}

export function isIdentityQuestion(question: string): boolean {
  return IDENTITY.some((pattern) => pattern.test(question.trim()));
}

/**
 * Build a retrieval query that keeps short follow-ups attached to the last
 * grounded topic, without inventing new subject matter.
 */
export function expandRetrievalQuery(
  question: string,
  prior?: PriorTurn | null,
  recentUserQuestions: string[] = []
): { retrievalQuery: string; focusCardId?: string; isFollowUp: boolean; isIdentity: boolean } {
  const identity = isIdentityQuestion(question);
  const followUp = isFollowUpQuestion(question);

  if (identity) {
    return {
      retrievalQuery: `${question} About Yuan FlyRankAI intern Capstone builder`,
      isFollowUp: false,
      isIdentity: true,
    };
  }

  if (!followUp || !prior) {
    return { retrievalQuery: question, isFollowUp: false, isIdentity: false };
  }

  const priorTopic =
    prior.status === "grounded" || prior.status === "open"
      ? [prior.question, ...prior.citationTitles].filter(Boolean).join(" ")
      : recentUserQuestions.slice(-2).join(" ");

  const focusCardId =
    prior.status === "grounded" && prior.citationCardIds[0]
      ? prior.citationCardIds[0]
      : undefined;

  return {
    retrievalQuery: `${question} ${priorTopic}`.trim(),
    focusCardId,
    isFollowUp: true,
    isIdentity: false,
  };
}

export function formatHistoryForProvider(
  messages: Array<{ role: string; content: string }>,
  limit = 6
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-limit)
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content.slice(0, 600),
    }));
}
