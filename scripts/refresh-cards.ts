import "dotenv/config";
import { PERSONA_CARDS } from "../fixtures/persona/cards";
import { prisma } from "../lib/db";
import { embeddingService } from "../services/embedding.service";
import { workerService } from "../services/worker.service";

async function main() {
  for (const card of PERSONA_CARDS) {
    const existing = await prisma.knowledgeCard.findFirst({ where: { title: card.title } });
    if (!existing) continue;
    await prisma.knowledgeCard.update({
      where: { id: existing.id },
      data: {
        body: card.body,
        kind: card.kind,
        tagsJson: JSON.stringify(card.tags),
        sourceId: card.sourceId ?? null,
      },
    });
  }

  await prisma.embedding.deleteMany();
  await prisma.job.deleteMany({ where: { type: "embed" } });
  await embeddingService.enqueueAll();

  for (let i = 0; i < 30; i += 1) {
    const result = await workerService.drain(20);
    if (!result.processed) break;
  }

  console.log(
    JSON.stringify({
      cards: await prisma.knowledgeCard.count(),
      embeddings: await prisma.embedding.count(),
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
