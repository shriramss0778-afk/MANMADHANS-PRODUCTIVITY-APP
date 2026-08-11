"use client";

import { api, setAccessToken } from "./client";
import type {
  AnalyticsPayload,
  AppSettings,
  AppNote,
  AuthenticatedUser,
  Book,
  CalendarEvent,
  FocusSession,
  Habit,
  KnowledgeEntry,
  ManagedUser,
  ReflectionEntry,
  Task,
  TimerSettings,
  WeeklyTodo,
} from "@/lib/types";

export interface BootstrapPayload {
  accessToken?: string;
  user: AuthenticatedUser;
  timerSettings: TimerSettings;
  knowledge: KnowledgeEntry[];
  books: Book[];
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  weeklyTodos: WeeklyTodo[];
  scratchpad: AppNote | null;
  quickCapture: AppNote[];
  reflections: ReflectionEntry[];
  focusSessions: FocusSession[];
  analytics: AnalyticsPayload;
}

function unwrap<T>(response: { data: { data: T } }) {
  return response.data.data;
}

/** Store the access token returned by a bootstrap/login response, then return the payload. */
function captureSession(response: { data: BootstrapPayload }) {
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

/** Create/update/delete calls for a REST collection that returns `{ data }` envelopes. */
function resource<T extends { id: string }, C = Omit<T, "id">>(path: string) {
  return {
    create: async (item: C) => unwrap<T>(await api.post(path, item)),
    update: async (id: string, item: Partial<C>) => unwrap<T>(await api.patch(`${path}/${id}`, item)),
    remove: async (id: string) => {
      await api.delete(`${path}/${id}`);
    },
  };
}

export async function bootstrapApp() {
  return captureSession(await api.get<BootstrapPayload>("/bootstrap"));
}

export async function loginWithPassword(email: string, password: string) {
  return captureSession(await api.post<BootstrapPayload>("/auth/login", { email, password }));
}

export async function logoutSession() {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function loginWithGoogle(credential: string) {
  return captureSession(await api.post<BootstrapPayload>("/auth/google", { credential }));
}

export async function updateProfileName(name: string) {
  const response = await api.patch("/profile", { name });
  return unwrap<AuthenticatedUser>(response);
}

export async function updateReadingGoal(readingGoal: number) {
  const response = await api.patch("/profile", { readingGoal });
  return unwrap<AuthenticatedUser>(response);
}

export async function changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
  const response = await api.post("/profile/password", {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  return unwrap<AuthenticatedUser>(response);
}

const managedUsers = resource<ManagedUser, Omit<ManagedUser, "id" | "createdAt" | "updatedAt">>("/users");
const knowledge = resource<KnowledgeEntry>("/knowledge");
const books = resource<Book>("/books");
const tasks = resource<Task>("/tasks");
const events = resource<CalendarEvent>("/calendar-events");
const habits = resource<Habit>("/habits");
const weeklyTodos = resource<WeeklyTodo>("/weekly-todos");

export async function fetchManagedUsers() {
  const response = await api.get("/users");
  return unwrap<ManagedUser[]>(response);
}

export const createManagedUser = managedUsers.create;
export const updateManagedUser = managedUsers.update;
export const deleteManagedUser = managedUsers.remove;

export async function fetchAppSettings() {
  const response = await api.get("/app-settings");
  return unwrap<AppSettings>(response);
}

export async function updateAppSettings(settings: AppSettings) {
  const response = await api.put("/app-settings", settings);
  return unwrap<AppSettings>(response);
}

export const createKnowledge = knowledge.create;
export const updateKnowledge = knowledge.update;
export const deleteKnowledge = knowledge.remove;

export const createBook = books.create;
export const updateBook = books.update;
export const deleteBook = books.remove;

export const createTask = tasks.create;
export const updateTask = tasks.update;
export const deleteTask = tasks.remove;

export const createEvent = events.create;
export const updateEvent = events.update;
export const deleteEvent = events.remove;

export const createHabit = habits.create;
export const updateHabit = habits.update;
export const deleteHabit = habits.remove;

export const createWeeklyTodo = weeklyTodos.create;
export const updateWeeklyTodo = weeklyTodos.update;
export const deleteWeeklyTodo = weeklyTodos.remove;

export async function saveScratchpad(content: string, title?: string) {
  const response = await api.put("/notes/scratchpad", { content, title });
  return unwrap<AppNote>(response);
}

export async function createQuickCapture(content: string, title?: string) {
  const response = await api.post("/notes/quick-capture", { content, title });
  return unwrap<AppNote>(response);
}

export async function deleteQuickCapture(id: string) {
  await api.delete(`/notes/quick-capture/${id}`);
}

export async function saveReflection(entry: Omit<ReflectionEntry, "id">) {
  const response = await api.post("/reflections", entry);
  return unwrap<ReflectionEntry>(response);
}

export async function updateTimerSettings(settings: TimerSettings) {
  const response = await api.put("/settings/timer", settings);
  return unwrap<TimerSettings>(response);
}

export async function createFocusSession(session: Omit<FocusSession, "id" | "completedAt">) {
  const response = await api.post("/focus-sessions", session);
  return unwrap<FocusSession>(response);
}

export async function fetchAnalytics() {
  const response = await api.get("/analytics");
  return unwrap<AnalyticsPayload>(response);
}
