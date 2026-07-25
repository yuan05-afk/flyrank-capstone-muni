import { GoogleGenerativeAI } from "@google/generative-ai";
import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatProvider, EmbeddingProvider } from "./contracts";

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is required for live Gemini providers");
  return key;
}

const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-1.5-flash";
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";

export class GeminiChatProvider implements ChatProvider {
  readonly id = CHAT_MODEL;

  async answer(input: {
    question: string;
    cards: Array<{ id: string; title: string; body: string; kind: string }>;
    audience?: string;
  }): Promise<GroundedAnswer> {
    if (input.cards.length === 0) {
      return groundedAnswerSchema.parse({
        answer:
          "I do not have verified knowledge for that yet. Ask the owner to add a knowledge card.",
        citations: [],
        confidence: 0.15,
        grounded: false,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey());
    const model = genAI.getGenerativeModel({
      model: CHAT_MODEL,
      generationConfig: { responseMimeType: "application/json" },
    });

    const context = input.cards
      .map((card) => `[${card.id}] (${card.kind}) ${card.title}: ${card.body}`)
      .join("\n");

    const prompt = `You are Muni, a grounded personal AI. Answer ONLY using the knowledge cards.
Return JSON with keys: answer (string), citations (array of {cardId, title, quote?}), confidence (0..1), grounded (boolean).
If the cards do not support an answer, set grounded=false, confidence low, citations=[], and refuse honestly.
Audience: ${input.audience || "general"}
Question: ${input.question}
Cards:
${context}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return groundedAnswerSchema.parse(JSON.parse(text));
  }
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly id = EMBED_MODEL;

  async embed(text: string): Promise<number[]> {
    const genAI = new GoogleGenerativeAI(apiKey());
    // Prefer the dedicated embeddings endpoint. Some Gemini model ids are
    // chat-only and return 404 for embedContent.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${EMBED_MODEL}`,
          content: { parts: [{ text }] },
        }),
      }
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Gemini embedding failed ${response.status}: ${detail}`);
    }
    const json = (await response.json()) as {
      embedding?: { values?: number[] };
    };
    const values = json.embedding?.values;
    if (!values?.length) throw new Error("Gemini embedding returned empty vector");
    return values;
  }
}
