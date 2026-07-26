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

function lightStem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses")) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us")) {
    return token.slice(0, -1);
  }
  return token;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(lightStem);
}

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "is", "are",
  "was", "what", "who", "how", "does", "did", "about", "with", "from", "which",
  "like", "using", "this", "that", "can", "you", "me", "more", "please", "tell",
  "has", "have", "yuan",
]);

function queryTokens(question: string): string[] {
  return tokenize(question).filter((token) => token.length > 2 && !STOP.has(token));
}

function cardRelevance(
  question: string,
  card: { title: string; body: string; kind: string }
): number {
  const tokens = queryTokens(question);
  if (!tokens.length) return 0;
  const hay = tokenize(`${card.title} ${card.body} ${card.kind}`).join(" ");
  const hits = tokens.filter((token) => hay.includes(token)).length;
  let score = hits / tokens.length;
  if (/project|capstone|portfolio/i.test(`${card.kind} ${card.title}`) &&
      /\b(capstone|project|shipped|portfolio)\b/i.test(question)) {
    score += 0.35;
  }
  if (/portfolio|overview|difference between/i.test(card.title) &&
      /\b(capstone|project|shipped|projects)\b/i.test(question)) {
    score += 0.45;
  }
  if (/full name|identity/i.test(card.title) && /\b(capstone|project|shipped)\b/i.test(question)) {
    score -= 0.4;
  }
  return score;
}

function bestSentences(text: string, question: string, budget: number): string {
  const tokens = queryTokens(question);
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!sentences.length) return text.slice(0, 240);

  const ranked = sentences
    .map((sentence, index) => {
      const hay = tokenize(sentence).join(" ");
      const hits = tokens.filter((token) => hay.includes(token)).length;
      return { sentence, index, hits };
    })
    .sort((a, b) => b.hits - a.hits || a.index - b.index);

  const chosen = ranked
    .filter((item) => item.hits > 0)
    .slice(0, budget)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  if (chosen.length) return chosen.join(" ");
  return sentences.slice(0, budget).join(" ");
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
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    followUp?: boolean;
  }): Promise<GroundedAnswer> {
    if (input.cards.length === 0) {
      return groundedAnswerSchema.parse({
        answer:
          "I do not have verified knowledge for that yet. Ask the owner to add a knowledge card, leave a note in chat, or open the Contact section on the Muni site.",
        citations: [],
        confidence: 0.2,
        grounded: false,
      });
    }

    // Prefer the card that actually matches the question, not just retrieval rank 1.
    const ranked = [...input.cards].sort(
      (a, b) => cardRelevance(input.question, b) - cardRelevance(input.question, a)
    );
    const primary = ranked[0];
    const support = ranked.slice(0, input.followUp ? 3 : 2);

    const primaryNoUrls = primary.body
      .replace(/\s*https?:\/\/[^\s<]+[^\s.,!?)<]*/g, "")
      .replace(/\b(Live demo|Live links|Demo|Live site)\s*:?\s*(?=[.\s]|$)/gi, "")
      .replace(/\s*[:;]\s*\./g, ".")
      .replace(/\.{2,}/g, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\(/g, " (")
      .trim();

    const sentenceBudget = input.followUp ? 3 : 2;
    const lead = (
      bestSentences(primaryNoUrls, input.question, sentenceBudget) ||
      primaryNoUrls.slice(0, 240)
    ).trim();

    const supportExtra =
      input.followUp && support[1]
        ? ` ${bestSentences(
            support[1].body
              .replace(/\s*https?:\/\/[^\s<]+[^\s.,!?)<]*/g, "")
              .replace(/\s{2,}/g, " ")
              .trim(),
            input.question,
            1
          )}`
        : "";

    const links: string[] = [];
    for (const card of support) {
      const urls = card.body.match(URL_PATTERN) ?? [];
      for (const url of urls) {
        if (!links.includes(url)) links.push(url);
      }
    }

    const answer = [
      lead.endsWith(".") || lead.endsWith("!") || lead.endsWith("?") ? lead : `${lead}.`,
      supportExtra.trim() ? ` ${supportExtra.trim().replace(/\.*$/, ".")}` : "",
      links.length ? ` You can open it live here: ${links.join(" | ")}` : "",
    ].join("");

    return groundedAnswerSchema.parse({
      answer: answer.trim(),
      citations: support.map((card) => {
        const urls = card.body.match(URL_PATTERN) ?? [];
        const firstUrl = urls[0];
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
