import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72)
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional().default("")
});

export const issueSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).optional().default(""),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  projectId: objectIdSchema
});
