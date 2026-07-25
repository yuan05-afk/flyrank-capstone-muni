import type { GroundedAnswer } from "@/lib/validation";

export interface ChatProvider {
  readonly id: string;
  answer(input: {
    question: string;
    cards: Array<{ id: string; title: string; body: string; kind: string }>;
    audience?: string;
  }): Promise<GroundedAnswer>;
}

export interface EmbeddingProvider {
  readonly id: string;
  embed(text: string): Promise<number[]>;
}
