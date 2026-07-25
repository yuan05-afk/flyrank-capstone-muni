import { prisma } from "@/lib/db";

export const knowledgeRepository = {
  list() {
    return prisma.knowledgeCard.findMany({
      include: { embedding: true },
      orderBy: { createdAt: "asc" },
    });
  },
  findById(id: string) {
    return prisma.knowledgeCard.findUnique({
      where: { id },
      include: { embedding: true },
    });
  },
  create(data: {
    kind: string;
    title: string;
    body: string;
    sourceId?: string | null;
    tagsJson: string;
  }) {
    return prisma.knowledgeCard.create({ data });
  },
  upsertByTitle(data: {
    kind: string;
    title: string;
    body: string;
    sourceId?: string | null;
    tagsJson: string;
  }) {
    const existing = prisma.knowledgeCard.findFirst({ where: { title: data.title } });
    return existing.then((row) => {
      if (row) {
        return prisma.knowledgeCard.update({
          where: { id: row.id },
          data,
        });
      }
      return prisma.knowledgeCard.create({ data });
    });
  },
};

export const embeddingsRepository = {
  upsertForCard(cardId: string, model: string, vector: number[]) {
    return prisma.embedding.upsert({
      where: { ownerId: cardId },
      create: {
        ownerType: "card",
        ownerId: cardId,
        cardId,
        model,
        dims: vector.length,
        vectorJson: JSON.stringify(vector),
      },
      update: {
        model,
        dims: vector.length,
        vectorJson: JSON.stringify(vector),
      },
    });
  },
};

export const jobsRepository = {
  enqueue(type: string, payload = "{}", idempotencyKey?: string) {
    if (idempotencyKey) {
      return prisma.job.upsert({
        where: { idempotencyKey },
        create: { type, payload, idempotencyKey },
        update: {},
      });
    }
    return prisma.job.create({ data: { type, payload } });
  },
  async claimDue(leaseMs: number) {
    const now = new Date();
    const job = await prisma.job.findFirst({
      where: {
        doneAt: null,
        runAt: { lte: now },
        OR: [{ lockedAt: null }, { leaseUntil: { lt: now } }],
      },
      orderBy: { createdAt: "asc" },
    });
    if (!job) return null;
    const leaseUntil = new Date(Date.now() + leaseMs);
    return prisma.job.update({
      where: { id: job.id },
      data: {
        lockedAt: now,
        leaseUntil,
        heartbeatAt: now,
        attempts: { increment: 1 },
      },
    });
  },
  heartbeat(id: string, leaseMs: number) {
    const now = new Date();
    return prisma.job.update({
      where: { id },
      data: { heartbeatAt: now, leaseUntil: new Date(now.getTime() + leaseMs) },
    });
  },
  done(id: string) {
    return prisma.job.update({
      where: { id },
      data: { doneAt: new Date(), lockedAt: null, leaseUntil: null, lastError: null },
    });
  },
  retry(id: string, message: string, delayMs: number, terminal: boolean) {
    return prisma.job.update({
      where: { id },
      data: {
        lockedAt: null,
        leaseUntil: null,
        lastError: message,
        runAt: new Date(Date.now() + delayMs),
        doneAt: terminal ? new Date() : null,
      },
    });
  },
};

export const costsRepository = {
  create(data: {
    kind: string;
    model: string;
    units: number;
    unitCostUsd: number;
    totalUsd: number;
    refType: string;
    refId: string;
  }) {
    return prisma.costEvent.create({ data });
  },
  list() {
    return prisma.costEvent.findMany({ orderBy: { createdAt: "desc" } });
  },
  async totalUsd() {
    const events = await prisma.costEvent.findMany({ select: { totalUsd: true } });
    return events.reduce((sum, event) => sum + event.totalUsd, 0);
  },
};

export const conversationRepository = {
  create(audience: string) {
    return prisma.conversation.create({ data: { audience } });
  },
  findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } }, answers: true },
    });
  },
  addMessage(conversationId: string, role: string, content: string) {
    return prisma.message.create({ data: { conversationId, role, content } });
  },
};

export const answersRepository = {
  create(data: {
    conversationId?: string | null;
    question: string;
    answer: string;
    citationsJson: string;
    grounded: boolean;
    status: string;
    guardReason?: string | null;
    confidence: number;
    policyId?: string | null;
    featuresJson?: string | null;
  }) {
    return prisma.agentAnswer.create({ data });
  },
  list() {
    return prisma.agentAnswer.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  },
};
