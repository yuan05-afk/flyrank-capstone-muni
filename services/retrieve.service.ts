import { GUARD_CONFIG } from "@/config/guard.config";
import { cosineSimilarity } from "@/lib/similarity";
import { embeddingProvider } from "@/providers/registry";
import { knowledgeRepository } from "@/repositories";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

export const retrieveService = {
  async topK(question: string, k = GUARD_CONFIG.topK) {
    const provider = embeddingProvider();
    const questionVector = await provider.embed(question);
    const cards = await knowledgeRepository.list();
    const ranked = cards
      .filter((card) => card.embedding)
      .map((card) => {
        const score = cosineSimilarity(questionVector, vectorOf(card.embedding?.vectorJson));
        return { card, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return {
      bestScore: ranked[0]?.score ?? 0,
      candidates: ranked,
    };
  },
};
