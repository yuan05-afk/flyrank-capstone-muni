import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { workerService } from "@/services/worker.service";

function authorizeWorkerTick(request: NextRequest): Response | null {
  const expected = process.env.DEMO_API_KEY || "muni_demo_key_001";
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return null;
  if (request.headers.get("x-vercel-cron") === "1") return null;
  return requireDemoAuth(request);
}

async function runTick(request: NextRequest) {
  const drain = request.nextUrl.searchParams.get("drain") === "1";
  return Response.json(drain ? await workerService.drain() : await workerService.tickOnce());
}

/** Vercel Cron invokes GET; desk and tests use POST with session cookie. */
export async function GET(request: NextRequest) {
  const denied = authorizeWorkerTick(request);
  if (denied) return denied;
  try {
    return await runTick(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "worker tick failed", processed: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  try {
    return await runTick(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "worker tick failed", processed: 0 },
      { status: 500 }
    );
  }
}
