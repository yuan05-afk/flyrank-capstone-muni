import { PrismaClient } from "@prisma/client";
import { embeddingProvider } from "../providers/registry";
import { embeddingsRepository } from "../repositories";

const prisma = new PrismaClient();

const body =
  "Use the Contact section on the Muni site (https://muni-flyrank.vercel.app/#contact): open Yuan's GitHub at https://github.com/yuan05-afk, leave a note in chat so it lands in the owner inbox, or open any live Capstone demo (Checkpoint, Lens, Broadcast, Muni).";

async function main() {
  await prisma.job.deleteMany({ where: { type: "embed_card" } });
  const card = await prisma.knowledgeCard.findFirst({
    where: { title: "How can someone contact Yuan?" },
  });
  if (!card) throw new Error("contact card missing");
  await prisma.knowledgeCard.update({
    where: { id: card.id },
    data: {
      body,
      tagsJson: JSON.stringify(["contact", "outreach", "github"]),
    },
  });
  const provider = embeddingProvider();
  const vector = await provider.embed(`${card.title} ${body}`);
  await embeddingsRepository.upsertForCard(card.id, provider.id, vector);
  console.log("updated + embedded contact card", card.id, provider.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
