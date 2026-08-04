import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const courseSchema = z.object({
  code: z.string().min(2).max(20),
  title: z.string().min(1).max(200),
  category: z
    .enum(["MATH", "PHYSICS", "ASTRONOMY", "PROGRAMMING", "RESEARCH", "QUANTUM", "GENERAL"])
    .default("GENERAL"),
  credits: z.coerce.number().min(0).max(12).default(3),
  semester: z.enum(["Fall", "Spring", "Summer"]).nullable().optional(),
  year: z.coerce.number().int().min(2020).max(2045).nullable().optional(),
  status: z
    .enum(["PLANNED", "PREPARING", "IN_PROGRESS", "COMPLETED", "TRANSFER"])
    .default("PLANNED"),
  grade: z.string().max(3).nullable().optional(),
  plannedGrade: z.string().max(3).nullable().optional(),
  isTransfer: z.boolean().default(false),
  isGradPrereq: z.boolean().default(false),
  prerequisites: z.array(z.string()).default([]),
});

export const degreePathSchema = z.object({
  name: z.string().min(1).max(120),
  type: z
    .enum([
      "PHYSICS_BS",
      "APS_BS",
      "CUSTOM_ASTROPHYSICS",
      "GRAD_PREP",
      "SETI_RESEARCH",
      "QUANTUM_SECONDARY",
    ])
    .default("CUSTOM_ASTROPHYSICS"),
  notes: z.string().max(2000).optional(),
});

export const tutorMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(8000),
  context: z.string().max(200).optional(),
});

export const quizSubmitSchema = z.object({
  attemptId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0).max(7),
    }),
  ),
});

export const reviewSchema = z.object({
  cardId: z.string(),
  rating: z.enum(["again", "hard", "good", "easy"]),
});

export const cardSchema = z.object({
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(4000),
  topic: z.string().min(1).max(100),
});

export const settingsSchema = z.object({
  aiProvider: z.enum(["anthropic", "openai", "offline"]),
  aiModel: z.string().min(1).max(80),
  tutorStyle: z.enum(["socratic", "direct", "detailed"]),
  targetGpa: z.coerce.number().min(0).max(4.33),
  weeklyStudyHoursGoal: z.coerce.number().int().min(1).max(80),
  dailyReviewGoal: z.coerce.number().int().min(1).max(500),
  remindersEnabled: z.boolean(),
});

export const studySessionSchema = z.object({
  minutes: z.coerce.number().int().min(1).max(720),
  subject: z.string().min(1).max(50).default("general"),
});

export const advisorImportSchema = z.object({
  text: z.string().min(10).max(100000),
  targetPathId: z.string().optional(),
  markCompleted: z.boolean().default(false),
});

export const researchProjectSchema = z.object({
  title: z.string().min(1).max(200),
  area: z.string().min(1).max(60),
  description: z.string().max(4000).default(""),
});

export const submissionSchema = z.object({
  challengeId: z.string(),
  code: z.string().max(20000),
  status: z.enum(["attempted", "solved"]),
});
