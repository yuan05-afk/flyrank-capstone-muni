import type { ChatProvider, EmbeddingProvider } from "./contracts";
import { GeminiChatProvider, GeminiEmbeddingProvider } from "./gemini";
import { GroqChatProvider } from "./groq";
import { SeedChatProvider, SeedEmbeddingProvider } from "./seed";

export function chatProvider(): ChatProvider {
  const mode = (process.env.CHAT_PROVIDER || "seed").toLowerCase();
  if (mode === "groq") return new GroqChatProvider();
  if (mode === "gemini") return new GeminiChatProvider();
  return new SeedChatProvider();
}

export function embeddingProvider(): EmbeddingProvider {
  const mode = (process.env.EMBEDDING_PROVIDER || "seed").toLowerCase();
  if (mode === "gemini") return new GeminiEmbeddingProvider();
  return new SeedEmbeddingProvider();
}
