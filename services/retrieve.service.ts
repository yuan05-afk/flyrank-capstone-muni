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
  "yuan", "me", "my", "you", "your", "give", "all", "with", "about", "can",
  "could", "would", "should", "i", "us", "our", "as", "so", "if", "than", "then",
  "into", "from", "have", "has", "had", "be", "been", "being", "there", "their",
]);

// The seed embedding is only 64-dim hashed bag-of-words, so distinctive keywords
// (e.g. "broadcast", "checkpoint") can get buried. A lexical bonus never lowers a
// card's semantic score; it only lifts cards that literally share query terms.
const LEXICAL_WEIGHT = 0.45;

function contentTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
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

function lexicalScore(queryTokens: string[], cardText: string): number {
  if (queryTokens.length === 0) return 0;
  const cardTokens = new Set(contentTokens(cardText));
  let hits = 0;
  for (const token of queryTokens) {
    if (cardTokens.has(token)) hits += 1;
  }
  return hits / queryTokens.length;
}

export const retrieveService = {
  async topK(question: string, k = GUARD_CONFIG.topK, focusCardId?: string) {
    const provider = embeddingProvider();
    const questionVector = await provider.embed(question);
    const cards = await knowledgeRepository.list();
    const queryTokens = contentTokens(question);
    let ranked = cards
      .filter((card) => card.embedding)
      .map((card) => {
        const semantic = cosineSimilarity(questionVector, vectorOf(card.embedding?.vectorJson));
        const lexical = lexicalScore(
          queryTokens,
          `${card.title} ${card.body} ${tagsOf(card.tagsJson)}`
        );
        // Additive, clamped: keyword hits lift the score but never demote a card.
        const score = Math.min(1, semantic + LEXICAL_WEIGHT * lexical);
        return { card, score };
      })
      .sort((a, b) => b.score - a.score);

    if (focusCardId) {
      const focused = ranked.find((item) => item.card.id === focusCardId);
      if (focused) {
        ranked = [
          { ...focused, score: Math.max(focused.score, 0.92) },
          ...ranked.filter((item) => item.card.id !== focusCardId),
        ];
      }
    }

    const candidates = ranked.slice(0, k);
    return {
      bestScore: candidates[0]?.score ?? 0,
      candidates,
    };
  },
};
