import { z } from "zod";

export const categorySchema = z.enum([
  "Technology",
  "Business",
  "Design",
  "Science",
  "Health",
  "Philosophy",
  "Productivity",
  "Finance",
]);

export const knowledgeSchema = z.object({
  title: z.string().min(1),
  category: categorySchema,
  tags: z.array(z.string().min(1)).default([]),
  sourceType: z.enum(["youtube", "book", "article", "course", "note"]),
  sourceLink: z.string().url().optional().or(z.literal("")).transform((value) => value || undefined),
  notes: z.string().default(""),
  dateLearned: z.string().min(1),
  progress: z.number().int().min(0).max(100),
  revisionStatus: z.enum(["fresh", "due", "overdue", "mastered"]),
  lastReviewed: z.string().optional(),
  nextReview: z.string().optional(),
  retention: z.number().int().min(0).max(100),
  thumbnail: z.string().url().optional().or(z.literal("")).transform((value) => value || undefined),
});

export const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  cover: z.string().url(),
  category: z.string().min(1),
  status: z.enum(["reading", "completed", "wishlist"]),
  totalPages: z.number().int().min(1),
  pagesRead: z.number().int().min(0),
  rating: z.number().int().min(0).max(5).optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  favoriteQuote: z.string().optional(),
});

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  done: z.boolean().default(false),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "delayed"]),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(subtaskSchema).default([]),
  goalScope: z.enum(["daily", "weekly", "monthly"]),
});

export const calendarEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["focus", "meeting", "revision", "habit", "deadline", "break"]),
  typeLabel: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  color: z.string().min(1),
});

export const habitSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  streak: z.number().int().min(0).default(0),
  goalPerWeek: z.number().int().min(1).max(7),
  log: z.record(z.string(), z.boolean()).default({}),
});

export const weeklyTodoSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  done: z.boolean().default(false),
});

export const noteSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
});

export const reflectionSchema = z.object({
  date: z.string().min(1),
  mood: z.enum(["great", "good", "okay", "low"]),
  gratitude: z.string().default(""),
  wins: z.string().default(""),
  improve: z.string().default(""),
});

export const timerSettingsSchema = z.object({
  focus: z.number().int().min(1).max(240),
  short: z.number().int().min(1).max(120),
  long: z.number().int().min(1).max(240),
});

export const focusSessionSchema = z.object({
  mode: z.enum(["focus", "short", "long"]),
  durationMins: z.number().int().min(1).max(240),
});

export const authLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const managedUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  isActive: z.boolean().default(true),
  googleLoginEnabled: z.boolean().default(true),
});

export const appSettingsSchema = z.object({
  accessPortalUrl: z.string().url(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  readingGoal: z.coerce.number().int().min(1).max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
