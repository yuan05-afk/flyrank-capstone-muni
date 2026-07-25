import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/validation";
import { chatService } from "@/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    const body = chatRequestSchema.parse(await request.json());
    const result = await chatService.ask(body);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "chat failed" },
      { status: 400 }
    );
  }
}
