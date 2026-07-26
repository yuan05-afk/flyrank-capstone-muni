import { describe, expect, it } from "vitest";
import { groundedAnswerSchema } from "@/lib/validation";
import { splitSentences } from "@/lib/sentences";
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

describe("sentence splitting", () => {
  it("keeps middle initials attached to the full name", () => {
    const parts = splitSentences(
      "Yuan Andrei C. Mariano is a FEU student. Yuan builds Capstones."
    );
    expect(parts[0]).toContain("Yuan Andrei C. Mariano");
    expect(parts[0]).not.toBe("Yuan Andrei C.");
    expect(parts).toHaveLength(2);
  });
});

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
  it("does not treat play as a match for display", async () => {
    const { topicalOverlap } = await import("@/services/guard.service");
    const score = topicalOverlap(
      "Which NBA team did Yuan play for last season?",
      "CheckMyDevice personal project display battery network sensors privacy-first browser"
    );
    expect(score).toBeLessThan(0.2);
  });

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

describe("deterministic fantasy guard", () => {
  it("blocks sports fantasy claims", async () => {
    const { isOutOfDomainFantasyQuestion } = await import("@/services/guard.service");
    expect(isOutOfDomainFantasyQuestion("Which NBA team did Yuan play for last season?")).toBe(
      true
    );
    expect(isOutOfDomainFantasyQuestion("What Capstone projects has Yuan shipped?")).toBe(false);
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

  it("grounds CheckMyDevice as a personal project, not a Capstone", async () => {
    const result = await chatService.ask({
      question: "What is CheckMyDevice and is it a Capstone?",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/checkmydevice/);
    expect(result.answer.answer.toLowerCase()).toMatch(/personal/);
    expect(result.answer.answer.toLowerCase()).toMatch(/not a flyrank capstone|not a capstone|personal project/);
    expect(result.retrieved.some((item) => /checkmydevice/i.test(item.title))).toBe(true);
  });

  it("grounds ShopScript as a CS0035 course project", async () => {
    const result = await chatService.ask({
      question: "What is ShopScript and which course is it for?",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/shopscript/);
    expect(result.answer.answer.toLowerCase()).toMatch(/cs0035|programming languages/);
    expect(result.answer.answer.toLowerCase()).toMatch(/course project|lead developer/);
    expect(result.retrieved.some((item) => /shopscript/i.test(item.title))).toBe(true);
  });

  it("grounds identity questions like who is yuan", async () => {
    const result = await chatService.ask({
      question: "who is yuan",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/yuan|flyrank|capstone/);
    expect(result.answer.answer.toLowerCase()).not.toContain("do not have verified knowledge");
    expect(result.answer.answer).not.toMatch(/^Mariano\b/);
    expect(result.answer.answer).not.toMatch(/Yuan Andrei C\.(?!\s*Mariano)/);
  });

  it("keeps opportunity answers grammatical with GitHub link intact", async () => {
    const result = await chatService.ask({
      question: "Is Yuan open to internship or collaboration opportunities?",
    });
    expect(result.answer.status).toBe("grounded");
    expect(result.answer.answer.toLowerCase()).toMatch(/internship|collaboration|github|note/);
    expect(result.answer.answer).toContain("https://github.com/yuan05-afk");
    expect(result.answer.answer).not.toMatch(/GitHub at Muni/i);
    expect(result.answer.answer).not.toMatch(/Yuan Andrei C\.(?!\s*Mariano)/);
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

  it("refuses code and exploit assist asks before retrieval", async () => {
    const { isCodeOrExploitAssistQuestion } = await import("@/services/guard.service");
    expect(isCodeOrExploitAssistQuestion("can you create a python code")).toBe(true);
    const result = await chatService.ask({
      question: "can you create a python code",
    });
    expect(result.answer.status).toBe("refused");
    expect(result.answer.answer.toLowerCase()).toMatch(/cannot write code|code|exploit|homework/);
    expect(result.answer.answer.toLowerCase()).not.toMatch(/you can ask about yuan/);
  });

  it("does not paste topic-catalog FAQs into specific project answers", async () => {
    const result = await chatService.ask({
      question: "Tell me more about Competitive programming.",
    });
    expect(result.answer.answer.toLowerCase()).not.toMatch(/you can ask about yuan/);
    expect(result.answer.answer.toLowerCase()).not.toMatch(/recruiters can ask about yuan/);
    expect(result.retrieved.every((item) => !/what can someone ask|what should recruiters ask/i.test(item.title))).toBe(
      true
    );
  });
});

describe("suggested next asks exploration", () => {
  it("walks outward from the current topic instead of repeating it", async () => {
    const { buildFollowUps } = await import("@/services/followups.service");
    const first = buildFollowUps({
      status: "grounded",
      question: "What Capstone projects has Yuan shipped?",
      retrievedTitles: ["Capstone portfolio overview"],
    });
    expect(first.map((item) => item.label)).not.toContain("Shipped Capstones");
    expect(first.some((item) => /Checkpoint|Lens|Broadcast|Muni|Project lanes/i.test(item.label))).toBe(true);

    const second = buildFollowUps({
      status: "grounded",
      question: "What is Checkpoint?",
      retrievedTitles: ["Checkpoint lead-capture platform"],
      priorQuestions: ["What Capstone projects has Yuan shipped?"],
    });
    expect(second.map((item) => item.label)).not.toContain("Shipped Capstones");
    expect(second.map((item) => item.label)).not.toContain("Checkpoint");
    expect(second.some((item) => /Lens|Broadcast|Preferred stack|Project lanes/i.test(item.label))).toBe(true);
  });

  it("keeps exploring new clusters after several turns", async () => {
    const { buildFollowUps } = await import("@/services/followups.service");
    const next = buildFollowUps({
      status: "grounded",
      question: "What is Lens and what does its mismatch guard do?",
      retrievedTitles: ["Lens image relevance"],
      priorQuestions: [
        "Who is Yuan and what does Yuan build?",
        "Where does Yuan go to college and what is Yuan studying?",
        "What Capstone projects has Yuan shipped?",
        "What is Checkpoint?",
      ],
    });
    const labels = next.map((item) => item.label);
    expect(labels).not.toContain("Who is Yuan?");
    expect(labels).not.toContain("College studies");
    expect(labels).not.toContain("Shipped Capstones");
    expect(labels).not.toContain("Checkpoint");
    expect(labels).not.toContain("Lens");
    expect(labels.length).toBeGreaterThan(0);
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
