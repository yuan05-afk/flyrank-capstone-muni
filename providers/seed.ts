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
    const primaryNoUrls = primary.body
      .replace(/\s*https?:\/\/[^\s<]+[^\s.,!?)<]*/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\(/g, " (")
      .trim();
    // Lead with the first one or two real sentences so the reply reads like Muni, not a template.
    const sentences = primaryNoUrls.split(/(?<=[.!?])\s+/).filter(Boolean);
    const lead = (sentences.slice(0, 2).join(" ") || primaryNoUrls.slice(0, 200)).trim();

    // Collect any live links referenced by the cited cards so they render in full.
    const links: string[] = [];
    for (const card of support) {
      const urls = card.body.match(URL_PATTERN) ?? [];
      for (const url of urls) {
        if (!links.includes(url)) links.push(url);
      }
    }

    const answer = [
      lead.endsWith(".") || lead.endsWith("!") || lead.endsWith("?") ? lead : `${lead}.`,
      links.length ? ` You can open it live here: ${links.join(" | ")}` : "",
    ].join("");

    return groundedAnswerSchema.parse({
      answer: answer.trim(),
      citations: support.map((card) => {
        const urls = card.body.match(URL_PATTERN) ?? [];
        const firstUrl = urls[0];
        // Prefer a short prose snippet + full URL so the link never gets truncated mid-host.
        const prose = card.body
          .replace(/\s*https?:\/\/[^\s<]+[^\s.,!?)<]*/g, "")
          .replace(/\s{2,}/g, " ")
          .trim()
          .slice(0, 160);
        const quoteText = firstUrl ? `${prose} ${firstUrl}`.slice(0, 400) : prose.slice(0, 200);
        return { cardId: card.id, title: card.title, quote: quoteText };
      }),
      confidence: 0.9,
      grounded: true,
    });
  }
}
