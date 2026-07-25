import { GoogleGenerativeAI } from "@google/generative-ai";
import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatProvider, EmbeddingProvider } from "./contracts";

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is required for live Gemini providers");
  return key;
}

export class GeminiChatProvider implements ChatProvider {
  readonly id = "gemini-2.0-flash";

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
      model: "gemini-2.0-flash",
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
  readonly id = "text-embedding-004";

  async embed(text: string): Promise<number[]> {
    const genAI = new GoogleGenerativeAI(apiKey());
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    const values = result.embedding.values;
    if (!values?.length) throw new Error("Gemini embedding returned empty vector");
    return values;
  }
}
