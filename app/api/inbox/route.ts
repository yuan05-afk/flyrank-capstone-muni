import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { inboxService } from "@/services/inbox.service";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json(await inboxService.snapshot());
}
