/**
 * Sync fixtures/persona cards into a running Muni instance via authenticated PUT.
 * Usage:
 *   MUNI_SYNC_URL=https://muni-flyrank.vercel.app DEMO_API_KEY=... pnpm exec tsx scripts/sync-persona-http.ts
 */
import { PERSONA_CARDS } from "../fixtures/persona/cards";

async function main() {
  const base = (process.env.MUNI_SYNC_URL || "http://localhost:3000").replace(/\/$/, "");
  const key = process.env.DEMO_API_KEY;
  if (!key) throw new Error("DEMO_API_KEY is required");

  let updated = 0;
  for (const card of PERSONA_CARDS) {
    const response = await fetch(`${base}/api/knowledge`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-demo-key": key,
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        kind: card.kind,
        title: card.title,
        body: card.body,
        sourceId: card.sourceId,
        tags: card.tags,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`PUT failed for "${card.title}": ${response.status} ${detail}`);
    }
    updated += 1;
  }

  const embed = await fetch(`${base}/api/jobs/embed`, {
    method: "POST",
    headers: {
      "x-demo-key": key,
      authorization: `Bearer ${key}`,
    },
  });
  if (!embed.ok) {
    const detail = await embed.text();
    throw new Error(`embed enqueue failed: ${embed.status} ${detail}`);
  }

  const tick = await fetch(`${base}/api/worker/tick?drain=1`, {
    method: "POST",
    headers: {
      "x-demo-key": key,
      authorization: `Bearer ${key}`,
    },
  });
  if (!tick.ok) {
    const detail = await tick.text();
    throw new Error(`worker tick failed: ${tick.status} ${detail}`);
  }

  console.log(`synced ${updated} cards to ${base} and drained embed jobs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
