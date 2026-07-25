import { PRICING } from "@/config/pricing.config";
import { embeddingProvider } from "@/providers/registry";
import {
  costsRepository,
  embeddingsRepository,
  jobsRepository,
  knowledgeRepository,
} from "@/repositories";
import { costService } from "./cost.service";

export const embeddingService = {
  async enqueueAll() {
    const cards = await knowledgeRepository.list();
    let enqueued = 0;
    for (const card of cards) {
      await jobsRepository.enqueue(
        "embed",
        JSON.stringify({ cardId: card.id }),
        `embed:card:${card.id}`
      );
      enqueued += 1;
    }
    return { enqueued };
  },

  async embedCard(cardId: string) {
    await costService.assertWithinBudget();
    const card = await knowledgeRepository.findById(cardId);
    if (!card) throw new Error("knowledge card not found");
    const provider = embeddingProvider();
    const text = `${card.kind}. ${card.title}. ${card.body}. ${card.tagsJson}`;
    const vector = await provider.embed(text);
    if (!vector.length) throw new Error("empty embedding vector");
    await embeddingsRepository.upsertForCard(cardId, provider.id, vector);

    const units = Math.max(1, Math.ceil(text.length / 4));
    const pricing = PRICING[provider.id as keyof typeof PRICING] ?? { usdPerUnit: 0 };
    await costsRepository.create({
      kind: "embedding",
      model: provider.id,
      units,
      unitCostUsd: pricing.usdPerUnit,
      totalUsd: units * pricing.usdPerUnit,
      refType: "card",
      refId: cardId,
    });
    return { cardId, dims: vector.length, provider: provider.id };
  },
};
