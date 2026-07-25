import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { embeddingService } from "@/services/embedding.service";

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  try {
    return Response.json(await embeddingService.enqueueAll(), { status: 202 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "embed enqueue failed", enqueued: 0 },
      { status: 500 }
    );
  }
}
