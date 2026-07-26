import { STARTER_SUGGESTIONS } from "@/config/starters.config";

export type FollowUpSuggestion = {
  label: string;
  question: string;
};

type TopicNode = {
  id: string;
  label: string;
  question: string;
  /** Patterns that mark this topic as already explored. */
  match: RegExp[];
  /** Neighbor topic ids: the exploration web edges. */
  next: string[];
};

/**
 * Curated exploration web over persona knowledge.
 * Suggested next asks walk unexplored neighbors first so a chat can travel
 * start → finish across connected cards instead of looping the same three chips.
 */
const TOPIC_GRAPH: TopicNode[] = [
  {
    id: "who",
    label: "Who is Yuan?",
    question: "Who is Yuan and what does Yuan build?",
    match: [/who is yuan/, /about yuan/, /full name/, /identity/],
    next: ["college", "internship", "capstones", "orgs"],
  },
  {
    id: "college",
    label: "College studies",
    question: "Where does Yuan go to college and what is Yuan studying?",
    match: [/college/, /feu/, /studying/, /education/, /academic standing/, /dean/, /president/],
    next: ["academics", "internship", "orgs", "stack"],
  },
  {
    id: "academics",
    label: "Academic honors",
    question: "What academic honors has Yuan earned at FEU Tech?",
    match: [/academic standing/, /dean/, /president/, /honors/, /lister/],
    next: ["college", "orgs", "training"],
  },
  {
    id: "internship",
    label: "FlyRank internship",
    question: "What does Yuan do as a FlyRankAI intern?",
    match: [/internship/, /flyrank/, /intern/],
    next: ["capstones", "craft", "stack", "who"],
  },
  {
    id: "capstones",
    label: "Shipped Capstones",
    question: "What Capstone projects has Yuan shipped?",
    match: [/capstone portfolio/, /shipped capstone/, /five live/, /four live/, /flyrank capstones/],
    next: ["checkpoint", "lens", "broadcast", "ledger", "muni", "lanes"],
  },
  {
    id: "checkpoint",
    label: "Checkpoint",
    question: "What is Checkpoint?",
    match: [/checkpoint/],
    next: ["lens", "broadcast", "ledger", "capstones"],
  },
  {
    id: "lens",
    label: "Lens",
    question: "What is Lens and what does its mismatch guard do?",
    match: [/lens/, /mismatch/],
    next: ["broadcast", "ledger", "muni", "capstones"],
  },
  {
    id: "broadcast",
    label: "Broadcast",
    question: "What is Broadcast and what does it generate?",
    match: [/broadcast/],
    next: ["ledger", "muni", "checkpoint", "capstones"],
  },
  {
    id: "ledger",
    label: "Ledger",
    question: "What is Ledger and how does it stop double charges?",
    match: [/ledger/, /quota meter/, /idempotenc/, /double charge/, /usage metering/],
    next: ["muni", "broadcast", "craft", "capstones"],
  },
  {
    id: "muni",
    label: "What is Muni?",
    question: "What is Muni?",
    match: [/muni grounded/, /what is muni/, /\bmuni\b/],
    next: ["grounding", "contact", "who", "capstones"],
  },
  {
    id: "lanes",
    label: "Project lanes",
    question: "How do Capstones differ from CheckMyDevice and ShopScript?",
    match: [/project lanes/, /all projects/, /differ from checkmydevice/, /three lanes/],
    next: ["checkmydevice", "shopscript", "capstones"],
  },
  {
    id: "checkmydevice",
    label: "CheckMyDevice",
    question: "What is CheckMyDevice and is it a Capstone?",
    match: [/checkmydevice/, /check my device/],
    next: ["shopscript", "lanes", "stack"],
  },
  {
    id: "shopscript",
    label: "ShopScript",
    question: "What is ShopScript and which course is it for?",
    match: [/shopscript/, /cs0035/],
    next: ["checkmydevice", "lanes", "college"],
  },
  {
    id: "stack",
    label: "Preferred stack",
    question: "Which technologies does Yuan like using for Capstone AI apps?",
    match: [/preferred capstone stack/, /preferred stack/, /technologies does yuan like/],
    next: ["languages", "craft", "tools", "capstones"],
  },
  {
    id: "languages",
    label: "Languages",
    question: "Which programming languages does Yuan work with?",
    match: [/programming languages/, /\blanguages\b/],
    next: ["data", "competitive", "stack"],
  },
  {
    id: "data",
    label: "Data skills",
    question: "What data analytics and database skills does Yuan have?",
    match: [/data analytics/, /databases/, /tableau/, /mysql/, /oracle/],
    next: ["stack", "college", "craft"],
  },
  {
    id: "craft",
    label: "Backend AI craft",
    question: "What is Yuan's Backend AI craft focus?",
    match: [/backend ai craft/, /retrieval with refusal/, /eval harness/],
    next: ["grounding", "training", "stack", "muni"],
  },
  {
    id: "tools",
    label: "Dev tools",
    question: "What development tools does Yuan use day to day?",
    match: [/development tools/, /vscode/, /colab/, /xampp/],
    next: ["github", "training", "stack"],
  },
  {
    id: "training",
    label: "AI training",
    question: "What AI training has Yuan completed?",
    match: [/ai training/, /naipdc/, /copilot bootcamp/, /prompt design/],
    next: ["craft", "competitive", "orgs"],
  },
  {
    id: "competitive",
    label: "Code Wars",
    question: "What competitive programming experience does Yuan have?",
    match: [/competitive programming/, /code wars/, /uplb/],
    next: ["typing", "training", "languages"],
  },
  {
    id: "typing",
    label: "Typing speed",
    question: "How fast does Yuan type?",
    match: [/typing/, /\bwpm\b/, /120 words/],
    next: ["competitive", "tools"],
  },
  {
    id: "orgs",
    label: "Organizations",
    question: "What organizations is Yuan part of?",
    match: [/organizations/, /\bjpcs\b/, /\bacm\b/, /organization experience/],
    next: ["training", "contact", "who", "academics"],
  },
  {
    id: "grounding",
    label: "Honest AI",
    question: "How does Yuan keep AI honest?",
    match: [/keep ai honest/, /grounding show/, /how does grounding/, /honest ai/],
    next: ["muni", "craft", "capstones"],
  },
  {
    id: "contact",
    label: "Contact Yuan",
    question: "How can someone contact Yuan?",
    match: [/contact yuan/, /how can someone contact/, /leave a note/],
    next: ["github", "opportunities", "who"],
  },
  {
    id: "github",
    label: "GitHub",
    question: "Where is Yuan's GitHub profile?",
    match: [/github profile/, /yuan05-afk/, /where is yuan.?s github/],
    next: ["contact", "capstones", "checkmydevice"],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    question: "Is Yuan open to opportunities?",
    match: [/open to opportunities/, /hire/, /collaborate/],
    next: ["contact", "internship", "capstones"],
  },
];

const TOPIC_BY_ID = new Map(TOPIC_GRAPH.map((node) => [node.id, node]));

/** Entry hubs used when the chat is open or after a refusal. */
const ENTRY_ORDER = ["who", "college", "capstones", "lanes", "stack", "orgs", "contact"] as const;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function overlaps(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

function matchesTopic(node: TopicNode, text: string) {
  const hay = normalize(text);
  if (!hay) return false;
  if (overlaps(hay, node.question) || overlaps(hay, node.label)) return true;
  return node.match.some((pattern) => pattern.test(hay));
}

function exploredIds(texts: string[]): Set<string> {
  const visited = new Set<string>();
  for (const text of texts) {
    for (const node of TOPIC_GRAPH) {
      if (matchesTopic(node, text)) visited.add(node.id);
    }
  }
  return visited;
}

function detectCurrentIds(question: string, retrievedTitles: string[] = []): string[] {
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const title of retrievedTitles) {
    for (const node of TOPIC_GRAPH) {
      if (matchesTopic(node, title) && !seen.has(node.id)) {
        seen.add(node.id);
        hits.push(node.id);
      }
    }
  }
  for (const node of TOPIC_GRAPH) {
    if (matchesTopic(node, question) && !seen.has(node.id)) {
      seen.add(node.id);
      hits.push(node.id);
    }
  }
  return hits;
}

/**
 * Walk the topic web: neighbors of the current focus first, then BFS outward,
 * then any remaining unexplored nodes. Never re-suggest explored topics.
 */
function exploreFrom(currentIds: string[], visited: Set<string>, limit = 3): FollowUpSuggestion[] {
  const out: FollowUpSuggestion[] = [];
  const queued = new Set<string>();

  function pushNode(id: string) {
    if (visited.has(id) || queued.has(id)) return;
    const node = TOPIC_BY_ID.get(id);
    if (!node) return;
    queued.add(id);
    out.push({ label: node.label, question: node.question });
  }

  // 1) Direct neighbors of the current focus.
  for (const id of currentIds) {
    const node = TOPIC_BY_ID.get(id);
    if (!node) continue;
    for (const nextId of node.next) {
      pushNode(nextId);
      if (out.length >= limit) return out;
    }
  }

  // 2) BFS outward through the web.
  const frontier = [...currentIds];
  const walked = new Set(currentIds);
  while (frontier.length && out.length < limit) {
    const id = frontier.shift()!;
    const node = TOPIC_BY_ID.get(id);
    if (!node) continue;
    for (const nextId of node.next) {
      if (!walked.has(nextId)) {
        walked.add(nextId);
        frontier.push(nextId);
      }
      pushNode(nextId);
      if (out.length >= limit) return out;
    }
  }

  // 3) Any leftover unexplored topics so long chats still cover the full web.
  for (const node of TOPIC_GRAPH) {
    pushNode(node.id);
    if (out.length >= limit) break;
  }

  return out;
}

/**
 * Build short next-ask prompts from the current turn.
 * Citations stay in the backend for grounding/evals; chat UI shows these instead.
 */
export function buildFollowUps(input: {
  status: string;
  question: string;
  retrievedTitles?: string[];
  /** Prior user questions in this conversation, oldest → newest. */
  priorQuestions?: string[];
}): FollowUpSuggestion[] {
  const asked = normalize(input.question);
  const history = [...(input.priorQuestions || []), input.question].filter(Boolean);
  const visited = exploredIds(history);

  const out: FollowUpSuggestion[] = [];
  const seenQuestions = new Set<string>();

  function push(label: string, question: string) {
    const key = normalize(question);
    if (!key || seenQuestions.has(key) || overlaps(key, asked)) return;
    for (const node of TOPIC_GRAPH) {
      if (visited.has(node.id) && overlaps(key, node.question)) return;
    }
    seenQuestions.add(key);
    out.push({ label, question });
  }

  if (input.status === "open") {
    for (const id of ENTRY_ORDER) {
      if (visited.has(id)) continue;
      const node = TOPIC_BY_ID.get(id);
      if (!node) continue;
      push(node.label, node.question);
      if (out.length >= 3) break;
    }
    return out.slice(0, 3);
  }

  if (input.status === "refused" || input.status === "guarded") {
    for (const id of ENTRY_ORDER) {
      if (visited.has(id)) continue;
      const node = TOPIC_BY_ID.get(id);
      if (!node) continue;
      push(node.label, node.question);
      if (out.length >= 3) break;
    }
    return out.slice(0, 3);
  }

  const currentIds = detectCurrentIds(input.question, input.retrievedTitles);
  // Mark current focus visited so we move outward, not sideways into the same card.
  for (const id of currentIds) visited.add(id);

  for (const suggestion of exploreFrom(currentIds, visited, 3)) {
    push(suggestion.label, suggestion.question);
    if (out.length >= 3) break;
  }

  if (out.length < 3) {
    for (const starter of STARTER_SUGGESTIONS.filter((item) => item.kind === "grounded")) {
      push(starter.label, starter.question);
      if (out.length >= 3) break;
    }
  }

  return out.slice(0, 3);
}
