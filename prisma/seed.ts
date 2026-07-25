import { PERSONA_CARDS } from "../fixtures/persona/cards";
import { prisma } from "../lib/db";

async function main() {
  await prisma.costEvent.deleteMany();
  await prisma.job.deleteMany();
  await prisma.message.deleteMany();
  await prisma.agentAnswer.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.knowledgeCard.deleteMany();

  for (const card of PERSONA_CARDS) {
    await prisma.knowledgeCard.create({
      data: {
        kind: card.kind,
        title: card.title,
        body: card.body,
        sourceId: card.sourceId ?? null,
        tagsJson: JSON.stringify(card.tags),
      },
    });
  }

  console.log(`seeded ${PERSONA_CARDS.length} knowledge cards`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
