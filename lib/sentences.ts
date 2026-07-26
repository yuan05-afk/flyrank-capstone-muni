/**
 * Sentence splitting that keeps middle initials like "C." intact.
 * Naive /(?<=[.!?])\s+/ turns "Yuan Andrei C. Mariano" into two broken fragments.
 */
export function splitSentences(text: string): string[] {
  const protectedText = text
    // Protect single-letter initials: "C. Mariano" -> "C<<DOT>> Mariano"
    .replace(/\b([A-Z])\.(?=\s+[A-Z])/g, "$1<<DOT>>")
    // Common abbreviations that should not end a sentence.
    .replace(/\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|e\.g|i\.e)\./gi, (match) =>
      match.replace(".", "<<DOT>>")
    );

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.replace(/<<DOT>>/g, ".").trim())
    .filter(Boolean);
}
