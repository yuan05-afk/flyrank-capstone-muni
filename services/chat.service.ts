import { PRICING } from "@/config/pricing.config";
import { GUARD_CONFIG, GROUNDING_POLICY_ID } from "@/config/guard.config";
import { CHAT_OPENER } from "@/config/starters.config";
import { chatProvider } from "@/providers/registry";
import { SeedChatProvider } from "@/providers/seed";
import {
  answersRepository,
  conversationRepository,
  costsRepository,
} from "@/repositories";
import {
  guardGrounding,
  isCatalogMetaCard,
  isCodeOrExploitAssistQuestion,
  isOutOfDomainFantasyQuestion,
  isSensitivePrivateQuestion,
  isSocialOpener,
  topicalOverlap,
  wantsCatalogHelp,
} from "./guard.service";
import {
  expandRetrievalQuery,
  formatHistoryForProvider,
  type PriorTurn,
} from "./memory.service";
import { retrieveService } from "./retrieve.service";
import { buildFollowUps } from "./followups.service";

const REFUSAL =
  "I do not have verified knowledge for that. I only speak from Yuan's knowledge cards. Type your question here anyway to leave a note for Yuan's owner inbox, or open the Contact section on the Muni site.";
const PRIVACY_REFUSAL =
  "I cannot share private or excluded personal information. I only answer from Yuan's verified knowledge, such as college education, skills, organizations, and shipped work. You can still leave this note for Yuan in the owner inbox.";
const ASSIST_REFUSAL =
  "I cannot write code, scripts, exploits, or homework solutions. I am Yuan's grounded personal agent, so I only answer from verified knowledge about Yuan's work and background. Ask about Capstones, skills, or leave a note in chat.";

async function refuseEarly(input: {
  conversationId: string;
  question: string;
  answer: string;
  reason: string;
  flag: string;
  priorQuestions?: string[];
}) {
  const provider = chatProvider();
  const record = await answersRepository.create({
    conversationId: input.conversationId,
    question: input.question,
    answer: input.answer,
    citationsJson: "[]",
    grounded: false,
    status: "refused",
    guardReason: input.reason,
    confidence: 1,
    policyId: GROUNDING_POLICY_ID,
    featuresJson: JSON.stringify({
      bestScore: 0,
      confidence: 1,
      citationCount: 0,
      retrievedCount: 0,
      topicalOverlap: 0,
      belowSimilarityFloor: false,
      belowConfidenceFloor: false,
      belowTopicalFloor: false,
      citationsValid: true,
      [input.flag]: true,
    }),
  });
  await Promise.all([
    conversationRepository.addMessage(input.conversationId, "assistant", input.answer),
    costsRepository.create({
      kind: "chat",
      model: provider.id,
      units: 0,
      unitCostUsd: 0,
      totalUsd: 0,
      refType: "answer",
      refId: record.id,
    }),
  ]);
  return {
    conversationId: input.conversationId,
    answer: record,
    citations: [],
    suggestions: buildFollowUps({
      status: "refused",
      question: input.question,
      priorQuestions: input.priorQuestions,
    }),
    retrieved: [],
    provider: provider.id,
  };
}

function socialReply() {
  return `Hi. I am Muni. ${CHAT_OPENER}`;
}

function parseCitations(raw: string | null | undefined) {
  try {
    return JSON.parse(raw || "[]") as Array<{ cardId: string; title: string }>;
  } catch {
    return [];
  }
}

type DraftCitation = { cardId: string; title: string; quote?: string | null };
type FinalCitation = { cardId: string; title: string; kind?: string; quote?: string };

/**
 * Citations are the trust surface, so keep them clean and honest:
 * - one chip per distinct knowledge card (no duplicates),
 * - the chip label is always the real card title (models sometimes echo the
 *   card kind like "bio" instead of "About Yuan"),
 * - carry the card kind so the UI can show what type of source it is,
 * - drop anything that does not map to a retrieved card.
 */
function normalizeCitations(
  citations: DraftCitation[] | undefined,
  cards: Array<{ id: string; title: string; kind?: string }>
): FinalCitation[] {
  if (!Array.isArray(citations) || citations.length === 0) return [];
  const cardById = new Map(cards.map((card) => [card.id, card] as const));
  const seen = new Set<string>();
  const result: FinalCitation[] = [];
  for (const citation of citations) {
    const cardId = citation?.cardId;
    if (!cardId || seen.has(cardId)) continue;
    const card = cardById.get(cardId);
    if (!card) continue;
    seen.add(cardId);
    result.push({
      cardId,
      title: card.title,
      kind: card.kind,
      quote: typeof citation.quote === "string" ? citation.quote : undefined,
    });
  }
  return result.slice(0, 6);
}

export const chatService = {
  async ask(input: {
    question: string;
    conversationId?: string;
    focusCardId?: string;
  }) {
    let conversationId = input.conversationId;
    if (!conversationId) {
      const conversation = await conversationRepository.create("general");
      conversationId = conversation.id;
    }

    // Load prior turns before appending the new user message so follow-ups
    // can expand retrieval against the last grounded topic.
    const priorConversation = await conversationRepository.findById(conversationId);
    const priorMessages = priorConversation?.messages ?? [];
    const priorAnswerRow = await answersRepository.latestForConversation(conversationId);
    const priorCitations = parseCitations(priorAnswerRow?.citationsJson);
    const priorTurn: PriorTurn | null = priorAnswerRow
      ? {
          question: priorAnswerRow.question,
          answer: priorAnswerRow.answer,
          status: priorAnswerRow.status,
          citationTitles: priorCitations.map((citation) => citation.title),
          citationCardIds: priorCitations.map((citation) => citation.cardId),
        }
      : null;
    const recentUserQuestions = priorMessages
      .filter((message) => message.role === "user")
      .map((message) => message.content);

    const memory = expandRetrievalQuery(input.question, priorTurn, recentUserQuestions);
    const focusCardId = input.focusCardId || memory.focusCardId;
    const history = formatHistoryForProvider(priorMessages);

    await conversationRepository.addMessage(conversationId, "user", input.question);

    if (isCodeOrExploitAssistQuestion(input.question)) {
      return refuseEarly({
        conversationId,
        question: input.question,
        answer: ASSIST_REFUSAL,
        reason: "Deterministic assist policy blocked a code, exploit, or homework request.",
        flag: "assistBlocked",
        priorQuestions: recentUserQuestions,
      });
    }

    if (isOutOfDomainFantasyQuestion(input.question)) {
      return refuseEarly({
        conversationId,
        question: input.question,
        answer: REFUSAL,
        reason: "Deterministic out-of-domain fantasy policy blocked an unsupported claim.",
        flag: "fantasyBlocked",
        priorQuestions: recentUserQuestions,
      });
    }

    if (isSensitivePrivateQuestion(input.question)) {
      return refuseEarly({
        conversationId,
        question: input.question,
        answer: PRIVACY_REFUSAL,
        reason: "Deterministic privacy policy blocked a sensitive or excluded-data request.",
        flag: "privacyBlocked",
        priorQuestions: recentUserQuestions,
      });
    }

    if (isSocialOpener(input.question)) {
      const provider = chatProvider();
      const answer = socialReply();
      const record = await answersRepository.create({
        conversationId,
        question: input.question,
        answer,
        citationsJson: "[]",
        grounded: false,
        status: "open",
        guardReason: "Social opener. Grounding not required.",
        confidence: 1,
        policyId: GROUNDING_POLICY_ID,
        featuresJson: JSON.stringify({
          bestScore: 0,
          confidence: 1,
          citationCount: 0,
          retrievedCount: 0,
          topicalOverlap: 0,
          belowSimilarityFloor: false,
          belowConfidenceFloor: false,
          belowTopicalFloor: false,
          citationsValid: true,
          socialOpener: true,
        }),
      });
      await conversationRepository.addMessage(conversationId, "assistant", answer);
      const pricing = PRICING[provider.id as keyof typeof PRICING] ?? { usdPerUnit: 0 };
      await costsRepository.create({
        kind: "chat",
        model: provider.id,
        units: 0,
        unitCostUsd: 0,
        totalUsd: 0,
        refType: "answer",
        refId: record.id,
      });
      return {
        conversationId,
        answer: record,
        citations: [],
        suggestions: buildFollowUps({
          status: "open",
          question: input.question,
          priorQuestions: recentUserQuestions,
        }),
        retrieved: [],
        provider: provider.id,
      };
    }

    const retrieved = await retrieveService.topK(
      memory.retrievalQuery,
      GUARD_CONFIG.topK,
      focusCardId
    );
    const catalogHelp = wantsCatalogHelp(input.question);
    let cards = retrieved.candidates
      .map((item) => ({
        id: item.card.id,
        title: item.card.title,
        body: item.card.body,
        kind: item.card.kind,
      }))
      .sort((a, b) => {
        // Keep provider context ordered by question fit, not only embedding rank.
        const score = (card: { title: string; body: string; kind: string }) => {
          const q = input.question.toLowerCase();
          const hay = `${card.title} ${card.body} ${card.kind}`.toLowerCase();
          let points = 0;
          for (const token of q.split(/[^a-z0-9]+/).filter((part) => part.length > 2)) {
            if (hay.includes(token) || hay.includes(token.replace(/s$/, ""))) points += 1;
          }
          if (
            /project|capstone/i.test(`${card.kind} ${card.title}`) &&
            /capstone|project|shipped|checkmydevice|shopscript|cs0035/i.test(q)
          ) {
            points += 3;
          }
          if (
            /all projects overview/i.test(card.title) &&
            /project|shipped|personal|course|besides/i.test(q)
          ) {
            points += 5;
          }
          if (/checkmydevice/i.test(card.title) && /checkmydevice|personal project|hardware/i.test(q)) {
            points += 5;
          }
          if (/shopscript/i.test(card.title) && /shopscript|cs0035|course project|interpreter/i.test(q)) {
            points += 5;
          }
          if (
            /portfolio|overview|difference between|project lanes/i.test(card.title) &&
            /capstone|project|shipped|personal|course/i.test(q)
          ) {
            points += 4;
          }
          if (
            /full name|identity|about yuan/i.test(card.title) &&
            /capstone|project|shipped|checkmydevice|shopscript/i.test(q)
          ) {
            points -= 3;
          }
          if (isCatalogMetaCard(card) && !catalogHelp) {
            points -= 8;
          }
          return points;
        };
        return score(b) - score(a);
      });

    // Topic-catalog FAQs are for help asks only. Feeding both into the model
    // produces long, repetitive laundry-list answers.
    if (!catalogHelp) {
      const focused = cards.filter((card) => !isCatalogMetaCard(card));
      if (focused.length) cards = focused;
    }
    cards = cards.slice(0, catalogHelp ? 2 : 3);
    const corpus = retrieved.allCards
      .map((card) => `${card.title} ${card.body}`)
      .join("\n");
    // Follow-ups and citation pins already inherit a verified topic.
    const overlap =
      focusCardId || memory.isFollowUp || memory.isIdentity
        ? Math.max(0.85, topicalOverlap(memory.retrievalQuery, corpus))
        : topicalOverlap(memory.retrievalQuery, corpus);

    const provider = chatProvider();
    let providerId = provider.id;
    let draft;
    try {
      draft = await provider.answer({
        question: input.question,
        cards,
        history,
        followUp: memory.isFollowUp,
      });
    } catch (error) {
      console.error("chat provider failed, falling back to seed:", error);
      const fallback = new SeedChatProvider();
      providerId = fallback.id;
      draft = await fallback.answer({
        question: input.question,
        cards,
        history,
        followUp: memory.isFollowUp,
      });
    }

    if (focusCardId) {
      const focused = cards.find((card) => card.id === focusCardId);
      if (focused) {
        const alreadyCited = draft.citations.some((citation) => citation.cardId === focused.id);
        draft = {
          answer: draft.answer,
          confidence: Math.max(draft.confidence, 0.86),
          grounded: true,
          citations: alreadyCited
            ? draft.citations
            : [
                {
                  cardId: focused.id,
                  title: focused.title,
                  quote: focused.body.slice(0, 140),
                },
                ...draft.citations,
              ].slice(0, 12),
        };
      }
    }

    if (
      !focusCardId &&
      (retrieved.bestScore < GUARD_CONFIG.similarityThreshold ||
        cards.length === 0 ||
        overlap < 0.2)
    ) {
      draft = {
        answer: REFUSAL,
        citations: [],
        confidence: Math.min(draft.confidence, 0.25),
        grounded: false,
      };
    }

    // Dedupe + relabel citations from the authoritative retrieved cards before
    // the guard, storage, and UI ever see them.
    const finalCitations = normalizeCitations(draft.citations, cards);

    const verdict = guardGrounding({
      bestScore: retrieved.bestScore,
      confidence: draft.confidence,
      retrievedCount: cards.length,
      citationCardIds: finalCitations.map((citation) => citation.cardId),
      allowedCardIds: cards.map((card) => card.id),
      topicalOverlap: overlap,
    });

    const finalAnswer = verdict.accepted
      ? draft.answer
      : draft.grounded === false && draft.answer
        ? draft.answer
        : REFUSAL;

    const record = await answersRepository.create({
      conversationId,
      question: input.question,
      answer: finalAnswer,
      citationsJson: JSON.stringify(verdict.accepted ? finalCitations : []),
      grounded: verdict.accepted,
      status: verdict.status,
      guardReason: verdict.reason,
      confidence: draft.confidence,
      policyId: verdict.policyId,
      featuresJson: JSON.stringify({
        ...verdict.features,
        followUp: memory.isFollowUp,
        identity: memory.isIdentity,
        retrievalQuery: memory.retrievalQuery,
        scores: retrieved.candidates.map((item) => ({
          cardId: item.card.id,
          title: item.card.title,
          score: Number(item.score.toFixed(4)),
        })),
      }),
    });

    const pricing = PRICING[providerId as keyof typeof PRICING] ?? { usdPerUnit: 0 };
    await Promise.all([
      conversationRepository.addMessage(conversationId, "assistant", finalAnswer),
      costsRepository.create({
        kind: "chat",
        model: providerId,
        units: 1,
        unitCostUsd: pricing.usdPerUnit,
        totalUsd: pricing.usdPerUnit,
        refType: "answer",
        refId: record.id,
      }),
    ]);

    return {
      conversationId,
      answer: record,
      citations: verdict.accepted ? finalCitations : [],
      suggestions: buildFollowUps({
        status: verdict.status,
        question: input.question,
        retrievedTitles: cards.map((card) => card.title),
        priorQuestions: recentUserQuestions,
      }),
      retrieved: cards.map((card, index) => ({
        id: card.id,
        title: card.title,
        score: retrieved.candidates.find((item) => item.card.id === card.id)?.score ?? 1 - index * 0.01,
      })),
      provider: providerId,
    };
  },
};
