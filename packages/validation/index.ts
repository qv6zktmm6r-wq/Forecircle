import { z } from "zod";
export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/),
  general_region: z.string().trim().min(2).max(100),
  handicap: z.number().min(-10).max(54).nullable(),
  golf_style: z.enum(["Casual", "Competitive", "Social", "Beginner friendly"]),
});
export const roundSchema = z.object({
  title: z.string().trim().min(3).max(100),
  course: z.string().trim().min(3).max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  holes: z.union([z.literal(9), z.literal(18)]),
  spots: z.number().int().min(1).max(3),
  notes: z.string().max(1000),
});
export const registrationSchema = z.object({ eventId: z.string().uuid() });
export const messageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
