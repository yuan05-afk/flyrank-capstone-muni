import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { knowledgeCardSchema } from "@/lib/validation";
import { knowledgeRepository } from "@/repositories";

export async function GET() {
  const cards = await knowledgeRepository.list();
  return Response.json({ cards });
}

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const body = knowledgeCardSchema.parse(await request.json());
  const card = await knowledgeRepository.create({
    kind: body.kind,
    title: body.title,
    body: body.body,
    sourceId: body.sourceId ?? null,
    tagsJson: JSON.stringify(body.tags),
  });
  return Response.json({ card }, { status: 201 });
}
