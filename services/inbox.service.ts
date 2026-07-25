import { answersRepository, knowledgeRepository } from "@/repositories";

const DESK_LIMIT = 40;

export const inboxService = {
  async snapshot() {
    const [answers, cards] = await Promise.all([
      answersRepository.list(),
      knowledgeRepository.list(),
    ]);

    // Answers arrive newest-first. Collapse repeated identical questions to the
    // latest reply so the desk shows a clean decision ledger, not noisy repeats.
    const seen = new Set<string>();
    const deduped: typeof answers = [];
    for (const row of answers) {
      const key = row.question.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(row);
    }
    const recent = deduped.slice(0, DESK_LIMIT);

    const grounded = deduped.filter((row) => row.status === "grounded").length;
    const refused = deduped.filter((row) => row.status === "refused").length;
    const guarded = deduped.filter(
      (row) => row.status === "guarded" || row.status === "refused"
    ).length;
    const social = deduped.filter((row) => row.status === "open").length;
    const decided = grounded + guarded;
    const avgConfidence =
      deduped.length > 0
        ? deduped.reduce((sum, row) => sum + (row.confidence ?? 0), 0) / deduped.length
        : 0;

    const gaps = deduped
      .filter((row) => row.status === "guarded" || row.status === "refused")
      .slice(0, 8)
      .map((row) => ({
        question: row.question,
        suggestion: `Add a knowledge card that covers: ${row.question}`,
        reason: row.guardReason,
      }));

    return {
      answers: recent,
      cards,
      stats: {
        grounded,
        guarded,
        refused,
        social,
        total: deduped.length,
        groundedRate: decided > 0 ? grounded / decided : 0,
        avgConfidence,
        cards: cards.length,
        embedded: cards.filter((card) => card.embedding).length,
      },
      gaps,
    };
  },
};
