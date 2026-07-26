import { EVAL_CASES } from "@/fixtures/persona/cards";
import { GUARD_CONFIG } from "@/config/guard.config";
import { chatService } from "./chat.service";
import { retrieveService } from "./retrieve.service";

export const evalService = {
  async run() {
    const results = [];
    let groundedCorrect = 0;
    let citationCorrect = 0;
    let refuseExpected = 0;
    let refuseCorrect = 0;
    let groundedExpected = 0;

    for (const testCase of EVAL_CASES) {
      const response = await chatService.ask({
        question: testCase.question,
      });
      const status = response.answer.status;
      const titles = response.citations.map((citation) => citation.title).join(" ");
      const passStatus = status === testCase.expectedStatus ||
        (testCase.expectedStatus === "refused" && status !== "grounded");

      if (testCase.expectedStatus === "grounded") {
        groundedExpected += 1;
        if (status === "grounded") groundedCorrect += 1;
        if (
          testCase.expectedTitleIncludes &&
          titles.toLowerCase().includes(testCase.expectedTitleIncludes.toLowerCase())
        ) {
          citationCorrect += 1;
        }
      } else {
        refuseExpected += 1;
        if (status !== "grounded") refuseCorrect += 1;
      }

      results.push({
        id: testCase.id,
        question: testCase.question,
        expectedStatus: testCase.expectedStatus,
        status,
        citations: response.citations,
        pass: passStatus,
      });
    }

    return {
      total: results.length,
      groundedAccuracy: groundedExpected ? groundedCorrect / groundedExpected : 1,
      citationPrecision: groundedExpected ? citationCorrect / groundedExpected : 1,
      refusalRecall: refuseExpected ? refuseCorrect / refuseExpected : 1,
      results,
    };
  },

  async thresholdSweep() {
    const simValues = [0.3, 0.36, 0.42, 0.48, 0.54];
    const points = [];
    for (const similarityThreshold of simValues) {
      let refuseHits = 0;
      let groundedHits = 0;
      for (const testCase of EVAL_CASES) {
        const retrieved = await retrieveService.topK(testCase.question);
        const wouldGround = retrieved.bestScore >= similarityThreshold;
        if (testCase.expectedStatus === "grounded" && wouldGround) groundedHits += 1;
        if (testCase.expectedStatus === "refused" && !wouldGround) refuseHits += 1;
      }
      const groundedCases = EVAL_CASES.filter((row) => row.expectedStatus === "grounded").length;
      const refuseCases = EVAL_CASES.filter((row) => row.expectedStatus === "refused").length;
      points.push({
        similarityThreshold,
        groundedRecall: groundedCases ? groundedHits / groundedCases : 1,
        refusalRecall: refuseCases ? refuseHits / refuseCases : 1,
      });
    }
    return {
      current: GUARD_CONFIG.similarityThreshold,
      points,
      best: [...points].sort(
        (a, b) =>
          b.groundedRecall + b.refusalRecall - (a.groundedRecall + a.refusalRecall)
      )[0],
    };
  },
};
