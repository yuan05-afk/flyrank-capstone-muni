import type { GroundedAnswer } from "@/lib/validation";

export type ChatHistoryTurn = { role: "user" | "assistant"; content: string };

export interface ChatProvider {
  readonly id: string;
  answer(input: {
    question: string;
    cards: Array<{ id: string; title: string; body: string; kind: string }>;
    history?: ChatHistoryTurn[];
    followUp?: boolean;
  }): Promise<GroundedAnswer>;
}

export interface EmbeddingProvider {
  readonly id: string;
  embed(text: string): Promise<number[]>;
}
