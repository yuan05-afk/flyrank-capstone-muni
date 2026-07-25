import { BUDGET_CONFIG } from "@/config/budget.config";
import { costsRepository } from "@/repositories";

export const costService = {
  async summary() {
    const [events, spentUsd] = await Promise.all([
      costsRepository.list(),
      costsRepository.totalUsd(),
    ]);
    const chatCalls = events.filter((event) => event.kind === "chat").length;
    const embeddingCalls = events.filter((event) => event.kind === "embedding").length;
    return {
      events,
      totalUsd: spentUsd,
      chatCalls,
      embeddingCalls,
      budgetUsd: BUDGET_CONFIG.maxBatchUsd,
      remainingUsd: Math.max(0, BUDGET_CONFIG.maxBatchUsd - spentUsd),
      budgetExhausted: spentUsd >= BUDGET_CONFIG.maxBatchUsd,
    };
  },

  async assertWithinBudget() {
    const spentUsd = await costsRepository.totalUsd();
    if (spentUsd >= BUDGET_CONFIG.maxBatchUsd) {
      const error = new Error(
        `Batch budget exhausted: spent $${spentUsd.toFixed(4)} of $${BUDGET_CONFIG.maxBatchUsd.toFixed(2)}`
      );
      (error as Error & { code?: string }).code = "BUDGET_EXHAUSTED";
      throw error;
    }
    return { spentUsd, remainingUsd: BUDGET_CONFIG.maxBatchUsd - spentUsd };
  },
};
