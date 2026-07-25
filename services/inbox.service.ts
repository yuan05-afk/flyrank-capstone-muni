import { answersRepository, knowledgeRepository } from "@/repositories";

export const inboxService = {
  async snapshot() {
    const [answers, cards] = await Promise.all([
      answersRepository.list(),
      knowledgeRepository.list(),
    ]);

    const grounded = answers.filter((row) => row.status === "grounded").length;
    const guarded = answers.filter((row) =>
      row.status === "guarded" || row.status === "refused"
    ).length;

    const gaps = answers
      .filter((row) => row.status === "guarded" || row.status === "refused")
      .slice(0, 8)
      .map((row) => ({
        question: row.question,
        suggestion: `Add a knowledge card that covers: ${row.question}`,
        reason: row.guardReason,
      }));

    return {
      answers,
      cards,
      stats: {
        grounded,
        guarded,
        total: answers.length,
        cards: cards.length,
        embedded: cards.filter((card) => card.embedding).length,
      },
      gaps,
    };
  },
};
