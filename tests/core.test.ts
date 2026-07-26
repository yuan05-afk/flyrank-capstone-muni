import { describe, expect, it } from "vitest";
import { groundedAnswerSchema } from "@/lib/validation";
import {
  guardGrounding,
  isSensitivePrivateQuestion,
  isSocialOpener,
} from "@/services/guard.service";
import { SeedChatProvider, SeedEmbeddingProvider } from "@/providers/seed";
import { cosineSimilarity } from "@/lib/similarity";
import { chatService } from "@/services/chat.service";
import { jobsRepository, knowledgeRepository } from "@/repositories";
import { GROUNDING_POLICY_ID } from "@/config/guard.config";

describe("grounded answer schema", () => {
  it("accepts valid structured output", () => {
    const parsed = groundedAnswerSchema.parse({
      answer: "Yuan builds Capstone AI products.",
      citations: [{ cardId: "c1", title: "About Yuan" }],
      confidence: 0.91,
      grounded: true,
    });
    expect(parsed.grounded).toBe(true);
  });

  it("rejects invalid confidence", () => {
    expect(() =>
      groundedAnswerSchema.parse({
        answer: "x",
        citations: [],
        confidence: 2,
        grounded: false,
      })
    ).toThrow();
  });
});

describe("grounding guard", () => {
  it("refuses weak retrieval", () => {
    const verdict = guardGrounding({
      bestScore: 0.1,
      confidence: 0.95,
      retrievedCount: 1,
      citationCardIds: ["a"],
      allowedCardIds: ["a"],
    });
    expect(verdict.status).toBe("refused");
    expect(verdict.policyId).toBe(GROUNDING_POLICY_ID);
  });

  it("guards missing citations", () => {
    const verdict = guardGrounding({
      bestScore: 0.9,
      confidence: 0.95,
      retrievedCount: 1,
      citationCardIds: ["missing"],
      allowedCardIds: ["a"],
    });
    expect(verdict.status).toBe("guarded");
  });
});

describe("deterministic privacy guard", () => {
  it("blocks salary, phone, and pre-college requests before retrieval", () => {
    expect(isSensitivePrivateQuestion("What is Yuan's secret salary?")).toBe(true);
    expect(isSensitivePrivateQuestion("What is Yuan's phone number?")).toBe(true);
    expect(isSensitivePrivateQuestion("Where did Yuan go to senior high school?")).toBe(true);
  });

  it("does not block the public contact path", () => {
    expect(isSensitivePrivateQuestion("How can someone contact Yuan?")).toBe(false);
  });
});

describe("seed semantic neighborhood", () => {
  it("puts related persona phrases nearby", async () => {
    const provider = new SeedEmbeddingProvider();
    const a = await provider.embed("Lens mismatch guard image relevance");
    const b = await provider.embed("fox wolf image tagging Capstone Lens");
    const far = await provider.embed("basketball championship salary account");
    expect(cosineSimilarity(a, b)).toBeGreaterThan(cosineSimilarity(a, far));
  });
});

describe("chat decision core", () => {
  it("grounds an in-scope project question with citations", async () => {
    const cards = await knowledgeRepository.list();
    if (!cards.length) throw new Error("seed cards missing; run pnpm db:seed");
    const result = await chatService.ask({
      question: "What is Lens and what does its mismatch guard do?",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations.some((citation) => citation.title.toLowerCase().includes("lens"))).toBe(true);
  });

  it("refuses out-of-scope salary questions", async () => {
    const result = await chatService.ask({
      question: "What is Yuan's secret salary and bank account number?",
    });
    expect(result.answer.status).not.toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toContain("verified knowledge");
  });

  it("greets social openers without a grounding refuse", async () => {
    expect(isSocialOpener("Hi")).toBe(true);
    const result = await chatService.ask({
      question: "Hi",
    });
    expect(result.answer.status).toBe("open");
    expect(result.answer.answer.toLowerCase()).toContain("muni");
    expect(result.answer.answer.toLowerCase()).not.toContain("do not have verified knowledge");
  });

  it("grounds citation follow-ups when a focus card is pinned", async () => {
    const cards = await knowledgeRepository.list();
    const muni = cards.find((card) => card.title.toLowerCase().includes("muni grounded"));
    if (!muni) throw new Error("muni card missing");
    const result = await chatService.ask({
      question: `What does the "${muni.title}" knowledge card cover?`,
      focusCardId: muni.id,
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.citations.some((citation) => citation.cardId === muni.id)).toBe(true);
  });

  it("grounds Capstone portfolio asks without answering from the bio name line", async () => {
    const result = await chatService.ask({
      question: "What Capstone projects has Yuan shipped?",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/capstone|checkpoint|lens|broadcast|muni/);
    expect(result.answer.answer.toLowerCase()).not.toMatch(/^yuan andrei c\. mariano goes by yuan/);
    expect(
      result.retrieved.some((item) => /capstone|checkpoint|lens|broadcast|muni/i.test(item.title))
    ).toBe(true);
  });

  it("grounds identity questions like who is yuan", async () => {
    const result = await chatService.ask({
      question: "who is yuan",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/yuan|flyrank|capstone/);
    expect(result.answer.answer.toLowerCase()).not.toContain("do not have verified knowledge");
  });

  it("keeps conversation memory for expound follow-ups", async () => {
    const first = await chatService.ask({
      question: "What is Lens and what does its mismatch guard do?",
    });
    expect(first.answer.status).toBe("grounded");
    const second = await chatService.ask({
      question: "can you expound more",
      conversationId: first.conversationId,
    });
    expect(second.answer.status).toBe("grounded");
    expect(second.answer.answer.toLowerCase()).toMatch(/lens|mismatch|image/);
    expect(second.answer.answer.toLowerCase()).not.toContain("do not have verified knowledge");
  });
});

describe("job idempotency", () => {
  it("does not duplicate embed jobs for the same card key", async () => {
    const cards = await knowledgeRepository.list();
    const card = cards[0];
    if (!card) throw new Error("no cards; run pnpm db:seed");
    const first = await jobsRepository.enqueue("embed", JSON.stringify({ cardId: card.id }), `test-embed:${card.id}`);
    const second = await jobsRepository.enqueue("embed", JSON.stringify({ cardId: card.id }), `test-embed:${card.id}`);
    expect(second.id).toBe(first.id);
  });
});

describe("seed chat provider", () => {
  it("returns grounded structured answers for cards", async () => {
    const answer = await new SeedChatProvider().answer({
      question: "Who is Yuan?",
      cards: [{ id: "1", title: "About Yuan", body: "Yuan builds Capstones.", kind: "bio" }],
    });
    expect(answer.grounded).toBe(true);
    expect(answer.citations[0].cardId).toBe("1");
  });
});
