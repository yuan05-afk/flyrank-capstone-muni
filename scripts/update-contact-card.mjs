import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const body =
  "Use the Contact section on the Muni site (https://muni-flyrank.vercel.app/#contact): open Yuan's GitHub at https://github.com/yuan05-afk, leave a note in chat so it lands in the owner inbox, or open any live Capstone demo (Checkpoint, Lens, Broadcast, Muni).";

async function main() {
  const card = await prisma.knowledgeCard.findFirst({
    where: { title: "How can someone contact Yuan?" },
  });
  if (!card) {
    console.error("contact card missing");
    process.exit(1);
  }
  await prisma.knowledgeCard.update({
    where: { id: card.id },
    data: {
      body,
      tagsJson: JSON.stringify(["contact", "outreach", "github"]),
    },
  });
  await prisma.embedding.deleteMany({ where: { cardId: card.id } });
  await prisma.job.create({
    data: {
      type: "embed",
      payload: JSON.stringify({ cardId: card.id }),
      idempotencyKey: `embed-contact-${Date.now()}`,
    },
  });
  console.log("updated contact card", card.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
