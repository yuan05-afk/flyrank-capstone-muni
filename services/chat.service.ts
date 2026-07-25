import { PRICING } from "@/config/pricing.config";
import { GUARD_CONFIG } from "@/config/guard.config";
import { chatProvider } from "@/providers/registry";
import {
  answersRepository,
  conversationRepository,
  costsRepository,
} from "@/repositories";
import { guardGrounding, topicalOverlap } from "./guard.service";
import { retrieveService } from "./retrieve.service";

const REFUSAL =
  "I do not have verified knowledge for that. I only speak from Yuan's knowledge cards. Leave a note in the owner inbox or use the contact section.";

export const chatService = {
  async ask(input: {
    question: string;
    audience?: string;
    conversationId?: string;
  }) {
    let conversationId = input.conversationId;
    if (!conversationId) {
      const conversation = await conversationRepository.create(input.audience || "general");
      conversationId = conversation.id;
    }

    await conversationRepository.addMessage(conversationId, "user", input.question);
    const retrieved = await retrieveService.topK(input.question);
    const cards = retrieved.candidates.map((item) => ({
      id: item.card.id,
      title: item.card.title,
      body: item.card.body,
      kind: item.card.kind,
    }));
    const corpus = cards.map((card) => `${card.title} ${card.body}`).join("\n");
    const overlap = topicalOverlap(input.question, corpus);

    const provider = chatProvider();
    let draft = await provider.answer({
      question: input.question,
      cards,
      audience: input.audience,
    });

    if (
      retrieved.bestScore < GUARD_CONFIG.similarityThreshold ||
      cards.length === 0 ||
      overlap < 0.2
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
