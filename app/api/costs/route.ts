import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { costService } from "@/services/cost.service";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json(await costService.summary());
}
