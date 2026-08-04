import type { CategoryKey } from "./roadmap-templates";

export interface SeedLesson {
  slug: string;
  title: string;
  objectives: string[];
  minutes: number;
  content: string;
}

export interface SeedQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;
  topic: string;
  lessonSlug?: string;
}

export interface SeedModule {
  key: string;
  title: string;
  description: string;
  category: CategoryKey;
  sortOrder: number;
  lessons: SeedLesson[];
  questions: SeedQuestion[];
}

export interface SeedChallenge {
  key: string;
  title: string;
  track: string;
  prompt: string;
  starterCode: string;
  solution: string;
  hints: string[];
  sortOrder: number;
}

export interface SeedCard {
  front: string;
  back: string;
  topic: string;
}
