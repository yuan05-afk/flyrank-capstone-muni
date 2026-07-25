import { GUARD_CONFIG } from "@/config/guard.config";
import { cosineSimilarity } from "@/lib/similarity";
import { embeddingProvider } from "@/providers/registry";
import { knowledgeRepository } from "@/repositories";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

export const retrieveService = {
  async topK(question: string, k = GUARD_CONFIG.topK, focusCardId?: string) {
    const provider = embeddingProvider();
    const questionVector = await provider.embed(question);
    const cards = await knowledgeRepository.list();
    let ranked = cards
      .filter((card) => card.embedding)
      .map((card) => {
        const score = cosineSimilarity(questionVector, vectorOf(card.embedding?.vectorJson));
        return { card, score };
      })
      .sort((a, b) => b.score - a.score);

    if (focusCardId) {
      const focused = ranked.find((item) => item.card.id === focusCardId);
      if (focused) {
        ranked = [
          { ...focused, score: Math.max(focused.score, 0.92) },
          ...ranked.filter((item) => item.card.id !== focusCardId),
        ];
      }
    }

    const candidates = ranked.slice(0, k);
    return {
      bestScore: candidates[0]?.score ?? 0,
      candidates,
    };
  },
};
