import { STARTER_SUGGESTIONS } from "@/config/starters.config";

export type FollowUpSuggestion = {
  label: string;
  question: string;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function overlaps(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

/**
 * Build short next-ask prompts from the current turn.
 * Citations stay in the backend for grounding/evals; chat UI shows these instead.
 */
export function buildFollowUps(input: {
  status: string;
  question: string;
  retrievedTitles?: string[];
}): FollowUpSuggestion[] {
  const asked = normalize(input.question);
  const out: FollowUpSuggestion[] = [];
  const seen = new Set<string>();

  function push(label: string, question: string) {
    const key = normalize(question);
    if (!key || seen.has(key) || overlaps(key, asked)) return;
    seen.add(key);
    out.push({ label, question });
  }

  if (input.status === "open") {
    for (const starter of STARTER_SUGGESTIONS.filter((item) => item.kind === "grounded").slice(0, 3)) {
      push(starter.label, starter.question);
    }
    return out.slice(0, 3);
  }

  if (input.status === "refused" || input.status === "guarded") {
    push("College + FEU", "Where does Yuan go to college and what is Yuan studying?");
    push("Shipped Capstones", "What Capstone projects has Yuan shipped?");
    push("Contact Yuan", "How can someone contact Yuan?");
    return out.slice(0, 3);
  }

  for (const title of input.retrievedTitles || []) {
    const clean = title.trim();
    if (!clean) continue;
    if (/refuse|salary|privacy/i.test(clean)) continue;
    if (/full name|identity/i.test(clean)) {
      push("Who is Yuan?", "Who is Yuan and what does Yuan build?");
      continue;
    }
    if (/about yuan/i.test(clean)) {
      push("Who is Yuan?", "Who is Yuan and what does Yuan build?");
      continue;
    }
    if (/capstone portfolio|checkpoint|lens|broadcast|muni grounded/i.test(clean)) {
      push(
        /checkpoint/i.test(clean)
          ? "Checkpoint"
          : /lens/i.test(clean)
            ? "Lens"
            : /broadcast/i.test(clean)
              ? "Broadcast"
              : /muni/i.test(clean)
                ? "What is Muni?"
                : "Shipped Capstones",
        /checkpoint/i.test(clean)
          ? "What is Checkpoint?"
          : /lens/i.test(clean)
            ? "What is Lens and what does its mismatch guard do?"
            : /broadcast/i.test(clean)
              ? "What is Broadcast and what does it generate?"
              : /muni/i.test(clean)
                ? "What is Muni?"
                : "What Capstone projects has Yuan shipped?"
      );
      continue;
    }
    push(clean.length > 28 ? `${clean.slice(0, 26)}…` : clean, `Tell me more about ${clean}.`);
    if (out.length >= 2) break;
  }

  const backups = STARTER_SUGGESTIONS.filter((item) => item.kind === "grounded");
  for (const starter of backups) {
    push(starter.label, starter.question);
    if (out.length >= 3) break;
  }

  return out.slice(0, 3);
}
