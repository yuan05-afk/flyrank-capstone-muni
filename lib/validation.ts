import { z } from "zod";

export const groundedAnswerSchema = z.object({
  answer: z.string().min(1).max(4000),
  citations: z
    .array(
      z.object({
        cardId: z.string().min(1),
        title: z.string().min(1),
        quote: z.string().max(400).optional(),
      })
    )
    .max(12),
  confidence: z.number().min(0).max(1),
  grounded: z.boolean(),
});

export type GroundedAnswer = z.infer<typeof groundedAnswerSchema>;

export const chatRequestSchema = z.object({
  question: z.string().min(1).max(1200),
  audience: z
    .enum(["recruiter", "investor", "client", "peer", "general"])
    .optional()
    .default("general"),
  conversationId: z.string().optional(),
});

export const knowledgeCardSchema = z.object({
  kind: z.enum(["bio", "project", "skill", "faq", "link"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  sourceId: z.string().max(120).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
});
