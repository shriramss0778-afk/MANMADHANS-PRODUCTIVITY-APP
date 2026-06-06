import {
  BookStatus,
  EventType,
  GoalScope,
  Mood,
  Priority,
  RevisionStatus,
  TaskStatus,
  type Book,
  type CalendarEvent,
  type FocusSession,
  type Habit,
  type HabitLog,
  type KnowledgeEntry,
  type Note,
  type Reflection,
  type Role,
  type Subtask,
  type Task,
  type TimerSettings,
  type WeeklyTodo,
} from "@prisma/client";

const dateOnly = (value: Date | null | undefined) => (value ? value.toISOString().slice(0, 10) : undefined);

export const fromRevisionStatus = (value: string) =>
  ({
    fresh: RevisionStatus.FRESH,
    due: RevisionStatus.DUE,
    overdue: RevisionStatus.OVERDUE,
    mastered: RevisionStatus.MASTERED,
  })[value] ?? RevisionStatus.FRESH;

export const toRevisionStatus = (value: RevisionStatus) =>
  ({
    [RevisionStatus.FRESH]: "fresh",
    [RevisionStatus.DUE]: "due",
    [RevisionStatus.OVERDUE]: "overdue",
    [RevisionStatus.MASTERED]: "mastered",
  })[value];

export const fromBookStatus = (value: string) =>
  ({
    reading: BookStatus.READING,
    completed: BookStatus.COMPLETED,
    wishlist: BookStatus.WISHLIST,
  })[value] ?? BookStatus.READING;

export const toBookStatus = (value: BookStatus) =>
  ({
    [BookStatus.READING]: "reading",
    [BookStatus.COMPLETED]: "completed",
    [BookStatus.WISHLIST]: "wishlist",
  })[value];

export const fromTaskStatus = (value: string) =>
  ({
    pending: TaskStatus.PENDING,
    "in-progress": TaskStatus.IN_PROGRESS,
    completed: TaskStatus.COMPLETED,
    delayed: TaskStatus.DELAYED,
  })[value] ?? TaskStatus.PENDING;

export const toTaskStatus = (value: TaskStatus) =>
  ({
    [TaskStatus.PENDING]: "pending",
    [TaskStatus.IN_PROGRESS]: "in-progress",
    [TaskStatus.COMPLETED]: "completed",
    [TaskStatus.DELAYED]: "delayed",
  })[value];

export const fromPriority = (value: string) =>
  ({
    low: Priority.LOW,
    medium: Priority.MEDIUM,
    high: Priority.HIGH,
  })[value] ?? Priority.MEDIUM;

export const toPriority = (value: Priority) =>
  ({
    [Priority.LOW]: "low",
    [Priority.MEDIUM]: "medium",
    [Priority.HIGH]: "high",
  })[value];

export const fromGoalScope = (value: string) =>
  ({
    daily: GoalScope.DAILY,
    weekly: GoalScope.WEEKLY,
    monthly: GoalScope.MONTHLY,
  })[value] ?? GoalScope.DAILY;

export const toGoalScope = (value: GoalScope) =>
  ({
    [GoalScope.DAILY]: "daily",
    [GoalScope.WEEKLY]: "weekly",
    [GoalScope.MONTHLY]: "monthly",
  })[value];

export const fromEventType = (value: string) =>
  ({
    focus: EventType.FOCUS,
    meeting: EventType.MEETING,
    revision: EventType.REVISION,
    habit: EventType.HABIT,
    deadline: EventType.DEADLINE,
    break: EventType.BREAK,
  })[value] ?? EventType.FOCUS;

export const toEventType = (value: EventType) =>
  ({
    [EventType.FOCUS]: "focus",
    [EventType.MEETING]: "meeting",
    [EventType.REVISION]: "revision",
    [EventType.HABIT]: "habit",
    [EventType.DEADLINE]: "deadline",
    [EventType.BREAK]: "break",
  })[value];

export const fromMood = (value: string) =>
  ({
    great: Mood.GREAT,
    good: Mood.GOOD,
    okay: Mood.OKAY,
    low: Mood.LOW,
  })[value] ?? Mood.GOOD;

export const toMood = (value: Mood) =>
  ({
    [Mood.GREAT]: "great",
    [Mood.GOOD]: "good",
    [Mood.OKAY]: "okay",
    [Mood.LOW]: "low",
  })[value];

export const toRole = (value: Role | string) =>
  ({
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    USER: "USER",
  })[value];

export function mapKnowledgeEntry(entry: KnowledgeEntry) {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    tags: entry.tags,
    sourceType: entry.sourceType,
    sourceLink: entry.sourceLink ?? undefined,
    notes: entry.notes,
    dateLearned: dateOnly(entry.dateLearned)!,
    progress: entry.progress,
    revisionStatus: toRevisionStatus(entry.revisionStatus),
    lastReviewed: dateOnly(entry.lastReviewed),
    nextReview: dateOnly(entry.nextReview),
    retention: entry.retention,
    thumbnail: entry.thumbnail ?? undefined,
  };
}

export function mapBook(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    cover: book.cover,
    category: book.category,
    status: toBookStatus(book.status),
    totalPages: book.totalPages,
    pagesRead: book.pagesRead,
    rating: book.rating ?? undefined,
    startedAt: dateOnly(book.startedAt),
    finishedAt: dateOnly(book.finishedAt),
    highlights: book.highlights,
    favoriteQuote: book.favoriteQuote ?? undefined,
  };
}

export function mapTask(task: Task & { subtasks: Subtask[] }) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: toTaskStatus(task.status),
    priority: toPriority(task.priority),
    deadline: dateOnly(task.deadline),
    tags: task.tags,
    goalScope: toGoalScope(task.goalScope),
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      done: subtask.done,
    })),
  };
}

export function mapCalendarEvent(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    type: toEventType(event.type),
    typeLabel: event.typeLabel ?? undefined,
    date: dateOnly(event.date)!,
    startTime: event.startTime,
    endTime: event.endTime,
    color: event.color,
  };
}

function buildHabitHistory(logs: HabitLog[]) {
  const dates = new Set(
    logs.filter((log) => log.done).map((log) => log.date.toISOString().slice(0, 10)),
  );
  return Array.from({ length: 49 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (48 - index));
    return dates.has(date.toISOString().slice(0, 10));
  });
}

export function mapHabit(habit: Habit & { logs: HabitLog[] }) {
  const log = Object.fromEntries(
    habit.logs.map((item) => [item.date.toISOString().slice(0, 10), item.done]),
  );

  return {
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    streak: habit.streak,
    goalPerWeek: habit.goalPerWeek,
    history: buildHabitHistory(habit.logs),
    log,
  };
}

export function mapWeeklyTodo(todo: WeeklyTodo) {
  return {
    id: todo.id,
    date: dateOnly(todo.date)!,
    title: todo.title,
    done: todo.done,
  };
}

export function mapNote(note: Note) {
  return {
    id: note.id,
    title: note.title ?? undefined,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function mapReflection(reflection: Reflection) {
  return {
    id: reflection.id,
    date: dateOnly(reflection.date)!,
    mood: toMood(reflection.mood),
    gratitude: reflection.gratitude,
    wins: reflection.wins,
    improve: reflection.improve,
  };
}

export function mapTimerSettings(settings: TimerSettings | null | undefined) {
  return {
    focus: settings?.focus ?? 25,
    short: settings?.short ?? 5,
    long: settings?.long ?? 15,
  };
}

export function mapFocusSession(session: FocusSession) {
  return {
    id: session.id,
    mode: session.mode,
    durationMins: session.durationMins,
    completedAt: session.completedAt.toISOString(),
  };
}

export function mapManagedUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  googleLoginEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toRole(user.role),
    isActive: user.isActive,
    googleLoginEnabled: user.googleLoginEnabled,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
