import { groundedAnswerSchema, type GroundedAnswer } from "@/lib/validation";
import type { ChatHistoryTurn, ChatProvider } from "./contracts";

function apiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is required for the Groq chat provider");
  return key;
}

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant";
const REQUEST_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS || 9000);
const MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS || 420);

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
    history?: ChatHistoryTurn[];
    followUp?: boolean;
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

    const system = `You are Muni, Yuan's grounded personal AI. "Muni" is Filipino for "muni-muni" (thoughtful reflection): think first, speak only from verified knowledge.

Voice:
- Warm, direct, and genuinely human. You are Muni speaking in the first person; talk about Yuan in the third person.
- Be specific and concrete. Never sound like a generic chatbot. Do not say "As an AI", "Based on the provided information", or "the knowledge cards say".
- ${input.followUp ? "This is a follow-up. Expand helpfully on the prior topic using the cards: add texture, connections, and clarity in 2 to 4 sentences. Do not invent new facts." : "Keep it tight: 1 to 3 sentences. Lead with the answer, not preamble."}
- Never paste a long laundry list of every possible topic. Answer the question that was asked.
- Never write code, scripts, exploits, or homework solutions. Refuse those asks.

Grounding rules:
- Use ONLY the provided knowledge cards. Never invent facts, numbers, dates, employers, or links.
- You may rephrase, synthesize, and connect details that appear in the cards. That is creativity inside the evidence, not hallucination.
- If a relevant card contains a URL, include that exact URL in the answer.
- If the cards do not actually support the question (even with conversation history), set grounded=false, confidence <= 0.3, citations=[], and refuse in one honest, friendly sentence that points visitors to the Contact section or to leave a note in chat.

Return ONE JSON object with keys:
- answer: string
- citations: array of {cardId, title, quote?} using only cardId values from the cards list
- confidence: number from 0 to 1 (0.85+ only when the cards clearly answer it)
- grounded: boolean`;

    const historyMessages = (input.history || []).map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          temperature: input.followUp ? 0.45 : 0.35,
          max_tokens: input.followUp ? Math.max(MAX_TOKENS, 480) : MAX_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            ...historyMessages,
            {
              role: "user",
              content: `Question: ${input.question}\n\nKnowledge cards:\n${context}`,
            },
          ],
        }),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Groq chat failed ${response.status}: ${detail}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq chat returned an empty message");

    const raw = extractJson(content) as Record<string, unknown>;
    const titleById = new Map(input.cards.map((card) => [card.id, card.title] as const));
    if (Array.isArray(raw.citations)) {
      raw.citations = (raw.citations as Array<Record<string, unknown>>)
        .map((citation) => {
          const cardId =
            typeof citation.cardId === "string" ? citation.cardId : String(citation.cardId ?? "");
          const title =
            typeof citation.title === "string" && citation.title.length > 0
              ? citation.title
              : titleById.get(cardId);
          if (!title) return null;
          return {
            cardId,
            title,
            quote: typeof citation.quote === "string" ? citation.quote.slice(0, 400) : undefined,
          };
        })
        .filter((citation): citation is NonNullable<typeof citation> => citation !== null)
        .filter((citation) => titleById.has(citation.cardId));
    }

    return groundedAnswerSchema.parse(raw);
  }
}
