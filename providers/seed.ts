import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import { splitSentences } from "@/lib/sentences";
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
  "has", "have",
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
  if (/who is yuan|about yuan/i.test(question) && /who is yuan|about yuan/i.test(card.title)) {
    score += 0.5;
  }
  if (/project|capstone|portfolio/i.test(`${card.kind} ${card.title}`) &&
      /\b(capstone|project|shipped|portfolio|checkmydevice|shopscript|cs0035)\b/i.test(question)) {
    score += 0.35;
  }
  if (/all projects overview/i.test(card.title) &&
      /\b(project|shipped|projects|personal|course|besides)\b/i.test(question)) {
    score += 0.55;
  }
  if (/checkmydevice/i.test(card.title) && /\b(checkmydevice|personal project|hardware)\b/i.test(question)) {
    score += 0.5;
  }
  if (/shopscript/i.test(card.title) && /\b(shopscript|cs0035|course project|interpreter)\b/i.test(question)) {
    score += 0.5;
  }
  if (/portfolio|overview|difference between|project lanes/i.test(card.title) &&
      /\b(capstone|project|shipped|projects|personal|course)\b/i.test(question)) {
    score += 0.45;
  }
  if (/full name|identity/i.test(card.title) &&
      /\b(capstone|project|shipped|checkmydevice|shopscript)\b/i.test(question)) {
    score -= 0.4;
  }
  if (
    /what can someone ask|what should recruiters ask/i.test(card.title) &&
    !/\b(what can i ask|topics|help|recruiter|recruiters|interview)\b/i.test(question)
  ) {
    score -= 0.55;
  }
  return score;
}

function bestSentences(text: string, question: string, budget: number): string {
  const tokens = queryTokens(question);
  const sentences = splitSentences(text);
  if (!sentences.length) return text.slice(0, 280);

  const ranked = sentences
    .map((sentence, index) => {
      const hay = tokenize(sentence).join(" ");
      let hits = tokens.filter((token) => hay.includes(token)).length;
      // Prefer sentences that keep Yuan as the subject for identity asks.
      if (/who is yuan|about yuan/i.test(question) && /^yuan\b/i.test(sentence)) hits += 2;
      // Avoid orphan fragments that start with a surname leftover.
      if (/^mariano\b/i.test(sentence)) hits -= 5;
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

function cleanupProse(text: string): string {
  return text
    .replace(/\b(Live demo|Live links|Demo|Live site)\s*:?\s*(?=[.\s]|$)/gi, "")
    .replace(/\s+([.?!,;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\(/g, " (")
    .trim();
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
    // Never glue a second topic-catalog FAQ onto a specific answer.
    const support = ranked
      .slice(0, input.followUp ? 3 : 2)
      .filter((card, index) => {
        if (index === 0) return true;
        if (/what can someone ask|what should recruiters ask/i.test(card.title)) return false;
        if (/what can someone ask|what should recruiters ask/i.test(primary.title)) {
          return !/what can someone ask|what should recruiters ask/i.test(card.title);
        }
        return true;
      })
      .slice(0, input.followUp ? 2 : 1);

    const sentenceBudget = input.followUp ? 3 : 2;
    // Keep URLs inside the chosen sentences so contact/GitHub lines stay grammatical.
    let lead = cleanupProse(bestSentences(primary.body, input.question, sentenceBudget));

    const supportExtra =
      input.followUp && support[1]
        ? cleanupProse(bestSentences(support[1].body, input.question, 1))
        : "";

    const links: string[] = [];
    for (const card of support) {
      const urls = card.body.match(URL_PATTERN) ?? [];
      for (const url of urls) {
        if (!links.includes(url)) links.push(url);
      }
    }

    let answer = lead.endsWith(".") || lead.endsWith("!") || lead.endsWith("?") ? lead : `${lead}.`;
    if (supportExtra && !answer.includes(supportExtra)) {
      const extra = supportExtra.endsWith(".") ? supportExtra : `${supportExtra}.`;
      answer = `${answer} ${extra}`;
    }

    // Only append a live-link trailer when the answer does not already include the URL.
    const missingLinks = links.filter((url) => !answer.includes(url));
    if (missingLinks.length) {
      answer = `${answer} You can open it here: ${missingLinks.join(" | ")}`;
    }

    return groundedAnswerSchema.parse({
      answer: answer.trim(),
      citations: support.map((card) => {
        const urls = card.body.match(URL_PATTERN) ?? [];
        const firstUrl = urls[0];
        const prose = cleanupProse(card.body.replace(URL_PATTERN, "").trim()).slice(0, 160);
        const quoteText = firstUrl ? `${prose} ${firstUrl}`.slice(0, 400) : prose.slice(0, 200);
        return { cardId: card.id, title: card.title, quote: quoteText };
      }),
      confidence: 0.9,
      grounded: true,
    });
  }
}
