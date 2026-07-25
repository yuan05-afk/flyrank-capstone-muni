import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatProvider, EmbeddingProvider } from "./contracts";

const DIMS = 64;
const URL_PATTERN = /https?:\/\/[^\s<]+[^\s.,!?)<]/g;

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
    // Strip URLs before sentence-splitting so we do not cut a link at its dot (e.g. .vercel.app).
    const primaryNoUrls = primary.body.replace(URL_PATTERN, "").replace(/\s{2,}/g, " ");
    const quote = primaryNoUrls.split(/[.!?]/)[0]?.trim() || primaryNoUrls.slice(0, 140);

    // Collect any live links referenced by the cited cards so they render in full.
    const links: string[] = [];
    for (const card of support) {
      const urls = card.body.match(URL_PATTERN) ?? [];
      for (const url of urls) {
        const entry = `${card.title}: ${url}`;
        if (!links.includes(entry)) links.push(entry);
      }
    }

    const answer = [
      `From verified knowledge: ${quote}.`,
      support.length > 1 ? ` Related card: ${support[1].title}.` : "",
      input.audience && input.audience !== "general"
        ? ` Tailored for a ${input.audience} conversation.`
        : "",
      links.length ? ` Live links: ${links.join(" | ")}` : "",
    ].join("");

    return groundedAnswerSchema.parse({
      answer: answer.trim(),
      citations: support.map((card) => {
        const urls = card.body.match(URL_PATTERN) ?? [];
        const base = card.body.slice(0, 120);
        const firstUrl = urls[0];
        // Ensure the citation quote keeps a full link when the card has one.
        const quoteText =
          firstUrl && !base.includes(firstUrl) ? `${base.trim()} ${firstUrl}` : base;
        return { cardId: card.id, title: card.title, quote: quoteText };
      }),
      confidence: 0.9,
      grounded: true,
    });
  }
}
