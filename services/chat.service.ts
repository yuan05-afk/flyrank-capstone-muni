import { AUDIENCE_OPENERS, type Audience } from "@/config/audience.config";
import { PRICING } from "@/config/pricing.config";
import { GUARD_CONFIG, GROUNDING_POLICY_ID } from "@/config/guard.config";
import { chatProvider } from "@/providers/registry";
import {
  answersRepository,
  conversationRepository,
  costsRepository,
  knowledgeRepository,
} from "@/repositories";
import { guardGrounding, isSocialOpener, topicalOverlap } from "./guard.service";
import { retrieveService } from "./retrieve.service";

const REFUSAL =
  "I do not have verified knowledge for that. I only speak from Yuan's knowledge cards. Leave a note in the owner inbox or use the contact section.";

function socialReply(audience?: string) {
  const key = (audience || "general") as Audience;
  const opener = AUDIENCE_OPENERS[key] ?? AUDIENCE_OPENERS.general;
  return `Hi. I am Muni. ${opener.opener} I only answer from verified knowledge cards, so ask about Yuan's Capstones, stack, Lens, Broadcast, or how to get in touch.`;
}

export const chatService = {
  async ask(input: {
    question: string;
    audience?: string;
    conversationId?: string;
    focusCardId?: string;
  }) {
    let conversationId = input.conversationId;
    if (!conversationId) {
      const conversation = await conversationRepository.create(input.audience || "general");
      conversationId = conversation.id;
    }

    await conversationRepository.addMessage(conversationId, "user", input.question);

    if (isSocialOpener(input.question)) {
      const provider = chatProvider();
      const answer = socialReply(input.audience);
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
        retrieved: [],
        provider: provider.id,
      };
    }

    const retrieved = await retrieveService.topK(
      input.question,
      GUARD_CONFIG.topK,
      input.focusCardId
    );
    const cards = retrieved.candidates.map((item) => ({
      id: item.card.id,
      title: item.card.title,
      body: item.card.body,
      kind: item.card.kind,
    }));
    const allCards = await knowledgeRepository.list();
    const corpus = allCards.map((card) => `${card.title} ${card.body}`).join("\n");
    // Citation follow-ups already name a verified card, so treat topical overlap as satisfied.
    const overlap = input.focusCardId ? 1 : topicalOverlap(input.question, corpus);

    const provider = chatProvider();
    let draft = await provider.answer({
      question: input.question,
      cards,
      audience: input.audience,
    });

    if (input.focusCardId) {
      const focused = cards.find((card) => card.id === input.focusCardId);
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
      !input.focusCardId &&
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

    const verdict = guardGrounding({
      bestScore: retrieved.bestScore,
      confidence: draft.confidence,
      retrievedCount: cards.length,
      citationCardIds: draft.citations.map((citation) => citation.cardId),
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
      citationsJson: JSON.stringify(verdict.accepted ? draft.citations : []),
      grounded: verdict.accepted,
      status: verdict.status,
      guardReason: verdict.reason,
      confidence: draft.confidence,
      policyId: verdict.policyId,
      featuresJson: JSON.stringify({
        ...verdict.features,
        scores: retrieved.candidates.map((item) => ({
          cardId: item.card.id,
          title: item.card.title,
          score: Number(item.score.toFixed(4)),
        })),
      }),
    });

    await conversationRepository.addMessage(conversationId, "assistant", finalAnswer);

    const pricing = PRICING[provider.id as keyof typeof PRICING] ?? { usdPerUnit: 0 };
    await costsRepository.create({
      kind: "chat",
      model: provider.id,
      units: 1,
      unitCostUsd: pricing.usdPerUnit,
      totalUsd: pricing.usdPerUnit,
      refType: "answer",
      refId: record.id,
    });

    return {
      conversationId,
      answer: record,
      citations: verdict.accepted ? draft.citations : [],
      retrieved: retrieved.candidates.map((item) => ({
        id: item.card.id,
        title: item.card.title,
        score: item.score,
      })),
      provider: provider.id,
    };
  },
};
