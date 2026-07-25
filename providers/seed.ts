import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatProvider, EmbeddingProvider } from "./contracts";

const DIMS = 64;

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export class SeedEmbeddingProvider implements EmbeddingProvider {
  readonly id = "seed-embedding-v1";

  async embed(text: string): Promise<number[]> {
    const vector = new Array(DIMS).fill(0);
    for (const token of tokenize(text)) {
      const idx = hashToken(token) % DIMS;
      vector[idx] += 1;
      vector[(idx + 7) % DIMS] += 0.35;
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }
}

export class SeedChatProvider implements ChatProvider {
  readonly id = "seed-chat-v1";

  async answer(input: {
    question: string;
    cards: Array<{ id: string; title: string; body: string; kind: string }>;
    audience?: string;
  }): Promise<GroundedAnswer> {
    if (input.cards.length === 0) {
      return groundedAnswerSchema.parse({
        answer:
          "I do not have verified knowledge for that yet. Ask the owner to add a knowledge card, or reach out through the contact section.",
        citations: [],
        confidence: 0.2,
        grounded: false,
      });
    }

    const primary = input.cards[0];
    const support = input.cards.slice(0, 2);
    const quote = primary.body.split(/[.!?]/)[0]?.trim() || primary.body.slice(0, 140);
    const answer = [
      `From verified knowledge: ${quote}.`,
      support.length > 1
        ? ` Related card: ${support[1].title}.`
        : "",
      input.audience && input.audience !== "general"
        ? ` Tailored for a ${input.audience} conversation.`
        : "",
    ].join("");

    return groundedAnswerSchema.parse({
      answer: answer.trim(),
      citations: support.map((card) => ({
        cardId: card.id,
        title: card.title,
        quote: card.body.slice(0, 120),
      })),
      confidence: 0.9,
      grounded: true,
    });
  }
}
