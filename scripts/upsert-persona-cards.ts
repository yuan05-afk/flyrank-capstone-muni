import { PERSONA_CARDS } from "../fixtures/persona/cards";
import { embeddingProvider } from "../providers/registry";
import { embeddingsRepository, knowledgeRepository } from "../repositories";
import { prisma } from "../lib/db";

async function main() {
  const provider = embeddingProvider();
  let updated = 0;
  for (const card of PERSONA_CARDS) {
    const row = await knowledgeRepository.upsertByTitle({
      kind: card.kind,
      title: card.title,
      body: card.body,
      sourceId: card.sourceId ?? null,
      tagsJson: JSON.stringify(card.tags),
    });
    const vector = await provider.embed(`${card.title} ${card.body}`);
    await embeddingsRepository.upsertForCard(row.id, provider.id, vector);
    updated += 1;
  }
  console.log(`upserted+embedded ${updated} persona cards via ${provider.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
