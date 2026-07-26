import { GUARD_CONFIG } from "@/config/guard.config";
import { cosineSimilarity } from "@/lib/similarity";
import { embeddingProvider } from "@/providers/registry";
import { knowledgeRepository } from "@/repositories";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

// Common words that should not count as a distinctive lexical match.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "for", "is", "are", "was", "were",
  "what", "who", "whom", "which", "how", "why", "when", "where", "do", "does",
  "did", "in", "on", "at", "by", "this", "that", "these", "those", "its", "it",
  "me", "my", "you", "your", "give", "all", "with", "about", "can",
  "could", "would", "should", "i", "us", "our", "as", "so", "if", "than", "then",
  "into", "from", "have", "has", "had", "be", "been", "being", "there", "their",
  "more", "please", "tell", "expound", "elaborate", "has",
]);

// The seed embedding is only 64-dim hashed bag-of-words, so distinctive keywords
// (e.g. "broadcast", "checkpoint", "yuan") can get buried. A lexical bonus never
// lowers a card's semantic score; it only lifts cards that literally share query terms.
const LEXICAL_WEIGHT = 0.5;
const IDENTITY_BIO_BOOST = 0.35;
const PROJECT_BOOST = 0.32;
const IDENTITY_BIO_DEMOTE = 0.22;

function lightStem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses")) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us")) {
    return token.slice(0, -1);
  }
  return token;
}

function contentTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
    .map(lightStem);
}

function tagsOf(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(" ") : "";
  } catch {
    return "";
  }
}

export function lexicalScore(queryTokens: string[], cardText: string): number {
  if (queryTokens.length === 0) return 0;
  const cardTokens = new Set(contentTokens(cardText));
  let hits = 0;
  for (const token of queryTokens) {
    if (cardTokens.has(token)) hits += 1;
  }
  return hits / queryTokens.length;
}

function isIdentityQuery(question: string): boolean {
  return /\b(who\s+is\s+yuan|about\s+yuan|tell\s+me\s+about\s+yuan)\b/i.test(question);
}

function isProjectQuery(question: string): boolean {
  if (isIdentityQuery(question)) return false;
  return /\b(capstone|project|shipped|portfolio|demo|checkpoint|lens|broadcast|checkmydevice|shopscript|cs0035)\b/i.test(
    question
  );
}

function isProjectCard(card: { kind: string; title: string; tagsJson: string | null }) {
  const tags = tagsOf(card.tagsJson).toLowerCase();
  return (
    card.kind === "project" ||
    /portfolio|capstone|checkpoint|lens|broadcast|muni grounded|checkmydevice|shopscript|all projects/i.test(
      card.title
    ) ||
    /\b(portfolio|capstones|checkpoint|lens|broadcast|projects|checkmydevice|shopscript|cs0035)\b/.test(
      tags
    )
  );
}

function isIdentityBioCard(card: { kind: string; title: string }) {
  return card.kind === "bio" && /about yuan|full name|identity/i.test(card.title);
}

export const retrieveService = {
  async topK(question: string, k = GUARD_CONFIG.topK, focusCardId?: string) {
    const provider = embeddingProvider();
    const questionVector = await provider.embed(question);
    const cards = await knowledgeRepository.list();
    const queryTokens = contentTokens(question);
    const identity = isIdentityQuery(question);
    const projectAsk = isProjectQuery(question);

    let ranked = cards
      .filter((card) => card.embedding)
      .map((card) => {
        const semantic = cosineSimilarity(questionVector, vectorOf(card.embedding?.vectorJson));
        const lexical = lexicalScore(
          queryTokens,
          `${card.title} ${card.body} ${tagsOf(card.tagsJson)}`
        );
        let score = Math.min(1, semantic + LEXICAL_WEIGHT * lexical);

        // Identity asks should surface the bio card even when the seed embedding is weak.
        if (identity && (card.kind === "bio" || /about yuan/i.test(card.title))) {
          score = Math.min(1, score + IDENTITY_BIO_BOOST);
        }

        // Project / Capstone asks must not lose to a bio that merely mentions Capstones.
        if (projectAsk && isProjectCard(card)) {
          score = Math.min(1, score + PROJECT_BOOST);
          if (/portfolio|overview|difference between/i.test(card.title)) {
            score = Math.min(1, score + 0.12);
          }
        }
        if (projectAsk && isIdentityBioCard(card)) {
          score = Math.max(0, score - IDENTITY_BIO_DEMOTE);
        }

        return { card, score, lexical };
      })
      .sort((a, b) => b.score - a.score || b.lexical - a.lexical);

    if (focusCardId) {
      const focused = ranked.find((item) => item.card.id === focusCardId);
      if (focused) {
        ranked = [
          { ...focused, score: Math.max(focused.score, 0.92) },
          ...ranked.filter((item) => item.card.id !== focusCardId),
        ];
      }
    }

    const candidates = ranked.slice(0, k).map(({ card, score }) => ({ card, score }));
    return {
      bestScore: candidates[0]?.score ?? 0,
      candidates,
      // Return the full card set so callers can build a topical-overlap corpus
      // without a second round-trip to the database.
      allCards: cards,
    };
  },
};
