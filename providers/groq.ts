import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatProvider } from "./contracts";

function apiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is required for the Groq chat provider");
  return key;
}

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Groq chat returned non-JSON content");
  }
}

export class GroqChatProvider implements ChatProvider {
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

    const context = input.cards
      .map((card) => `[${card.id}] (${card.kind}) ${card.title}: ${card.body}`)
      .join("\n");

    const system = `You are Muni, a grounded personal AI for Yuan.
Answer ONLY using the provided knowledge cards. Never invent facts.
Return a single JSON object with keys:
- answer: string (clear, natural prose; 2-5 sentences when grounded)
- citations: array of {cardId, title, quote?} using only card ids from the cards list
- confidence: number from 0 to 1
- grounded: boolean
If the cards do not support the question, set grounded=false, confidence <= 0.3, citations=[], and refuse honestly.
Audience tone: ${input.audience || "general"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Question: ${input.question}\n\nKnowledge cards:\n${context}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Groq chat failed ${response.status}: ${detail}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq chat returned an empty message");
    return groundedAnswerSchema.parse(extractJson(content));
  }
}
