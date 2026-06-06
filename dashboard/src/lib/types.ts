/* ----------------------------------------------------------------------------
   Domain types shared across the dashboard.
---------------------------------------------------------------------------- */

export type Category =
  | "Technology"
  | "Business"
  | "Design"
  | "Science"
  | "Health"
  | "Philosophy"
  | "Productivity"
  | "Finance";

export type BookCategory = string;

export type RevisionStatus = "fresh" | "due" | "overdue" | "mastered";

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  sourceType: "youtube" | "book" | "article" | "course" | "note";
  sourceLink?: string;
  notes: string;
  dateLearned: string;
  progress: number;
  revisionStatus: RevisionStatus;
  lastReviewed?: string;
  nextReview?: string;
  retention: number;
  thumbnail?: string;
}

export type BookStatus = "reading" | "completed" | "wishlist";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: BookCategory;
  status: BookStatus;
  totalPages: number;
  pagesRead: number;
  rating?: number;
  startedAt?: string;
  finishedAt?: string;
  highlights: string[];
  favoriteQuote?: string;
}

export type TaskStatus = "pending" | "in-progress" | "completed" | "delayed";
export type Priority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  tags: string[];
  subtasks: Subtask[];
  goalScope: "daily" | "weekly" | "monthly";
}

export type EventType = "focus" | "meeting" | "revision" | "habit" | "deadline" | "break";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  typeLabel?: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  goalPerWeek: number;
  history: boolean[];
  log?: Record<string, boolean>;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  mood: "great" | "good" | "okay" | "low";
  gratitude: string;
  wins: string;
  improve: string;
}

export interface WeeklyTodo {
  id: string;
  date: string;
  title: string;
  done: boolean;
}

export interface AppNote {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  mode: "focus" | "short" | "long";
  durationMins: number;
  completedAt: string;
}

export interface TimerSettings {
  focus: number;
  short: number;
  long: number;
}

export interface LearningHoursPoint {
  day: string;
  hours: number;
  focus: number;
}

export interface KnowledgeGrowthPoint {
  month: string;
  entries: number;
  retention: number;
}

export interface CategoryDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface ProductivityRadarPoint {
  metric: string;
  value: number;
}

export interface DailyPagesPoint {
  day: string;
  pages: number;
}

export interface AnalyticsPayload {
  weeklyLearningHours: LearningHoursPoint[];
  knowledgeGrowth: KnowledgeGrowthPoint[];
  categoryDistribution: CategoryDistributionPoint[];
  productivityRadar: ProductivityRadarPoint[];
  focusHeatmap: number[];
  readingHeatmap: number[];
  dailyPages: DailyPagesPoint[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  isActive: boolean;
  googleLoginEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  accessPortalUrl: string;
}
