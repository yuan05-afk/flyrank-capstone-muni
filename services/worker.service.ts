import { BUDGET_CONFIG } from "@/config/budget.config";
import { jobsRepository } from "@/repositories";
import { costService } from "./cost.service";
import { embeddingService } from "./embedding.service";

export const workerService = {
  async tickOnce() {
    try {
      await costService.assertWithinBudget();
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "BUDGET_EXHAUSTED") {
        return { processed: false, stopped: "budget", error: err.message };
      }
      throw error;
    }

    const job = await jobsRepository.claimDue(BUDGET_CONFIG.leaseMs);
    if (!job) return { processed: false };

    try {
      await jobsRepository.heartbeat(job.id, BUDGET_CONFIG.leaseMs);
      const payload = JSON.parse(job.payload) as { cardId?: string };
      if (job.type === "embed" && payload.cardId) {
        const result = await embeddingService.embedCard(payload.cardId);
        await jobsRepository.done(job.id);
        return { processed: true, jobId: job.id, type: job.type, result };
      }
      throw new Error(`unsupported job type ${job.type}`);
    } catch (error) {
      const message = (error as Error).message;
      const terminal = job.attempts >= BUDGET_CONFIG.maxAttempts;
      await jobsRepository.retry(job.id, message, 500 * 2 ** job.attempts, terminal);
      return { processed: true, jobId: job.id, error: message, terminal, partialFailure: !terminal };
    }
  },

  async drain(max = 200) {
    const results = [];
    for (let i = 0; i < max; i += 1) {
      const result = await this.tickOnce();
      if (!result.processed) {
        if ("stopped" in result && result.stopped) {
          return { processed: results.length, results, stopped: result.stopped, error: result.error };
        }
        break;
      }
      results.push(result);
    }
    return { processed: results.length, results };
  },
};
