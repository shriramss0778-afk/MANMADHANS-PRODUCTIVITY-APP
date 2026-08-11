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

export async function bootstrapApp() {
  const response = await api.get<BootstrapPayload>("/bootstrap");
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

export async function loginWithPassword(email: string, password: string) {
  const response = await api.post<BootstrapPayload>("/auth/login", { email, password });
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

export async function logoutSession() {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function loginWithGoogle(credential: string) {
  const response = await api.post<BootstrapPayload>("/auth/google", { credential });
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
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

export async function fetchManagedUsers() {
  const response = await api.get("/users");
  return unwrap<ManagedUser[]>(response);
}

export async function createManagedUser(user: Omit<ManagedUser, "id" | "createdAt" | "updatedAt">) {
  const response = await api.post<{ data: ManagedUser; temporaryPassword: string }>("/users", user);
  return { user: response.data.data, temporaryPassword: response.data.temporaryPassword };
}

export async function updateManagedUser(
  id: string,
  user: Partial<Omit<ManagedUser, "id" | "createdAt" | "updatedAt">>,
) {
  const response = await api.patch(`/users/${id}`, user);
  return unwrap<ManagedUser>(response);
}

export async function deleteManagedUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function fetchAppSettings() {
  const response = await api.get("/app-settings");
  return unwrap<AppSettings>(response);
}

export async function updateAppSettings(settings: AppSettings) {
  const response = await api.put("/app-settings", settings);
  return unwrap<AppSettings>(response);
}

export async function createKnowledge(entry: Omit<KnowledgeEntry, "id">) {
  const response = await api.post("/knowledge", entry);
  return unwrap<KnowledgeEntry>(response);
}

export async function updateKnowledge(id: string, entry: Partial<Omit<KnowledgeEntry, "id">>) {
  const response = await api.patch(`/knowledge/${id}`, entry);
  return unwrap<KnowledgeEntry>(response);
}

export async function deleteKnowledge(id: string) {
  await api.delete(`/knowledge/${id}`);
}

export async function createBook(book: Omit<Book, "id">) {
  const response = await api.post("/books", book);
  return unwrap<Book>(response);
}

export async function updateBook(id: string, book: Partial<Omit<Book, "id">>) {
  const response = await api.patch(`/books/${id}`, book);
  return unwrap<Book>(response);
}

export async function deleteBook(id: string) {
  await api.delete(`/books/${id}`);
}

export async function createTask(task: Omit<Task, "id">) {
  const response = await api.post("/tasks", task);
  return unwrap<Task>(response);
}

export async function updateTask(id: string, task: Partial<Omit<Task, "id">>) {
  const response = await api.patch(`/tasks/${id}`, task);
  return unwrap<Task>(response);
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
}

export async function createEvent(event: Omit<CalendarEvent, "id">) {
  const response = await api.post("/calendar-events", event);
  return unwrap<CalendarEvent>(response);
}

export async function updateEvent(id: string, event: Partial<Omit<CalendarEvent, "id">>) {
  const response = await api.patch(`/calendar-events/${id}`, event);
  return unwrap<CalendarEvent>(response);
}

export async function deleteEvent(id: string) {
  await api.delete(`/calendar-events/${id}`);
}

export async function createHabit(habit: Omit<Habit, "id">) {
  const response = await api.post("/habits", habit);
  return unwrap<Habit>(response);
}

export async function updateHabit(id: string, habit: Partial<Omit<Habit, "id">>) {
  const response = await api.patch(`/habits/${id}`, habit);
  return unwrap<Habit>(response);
}

export async function deleteHabit(id: string) {
  await api.delete(`/habits/${id}`);
}

export async function createWeeklyTodo(todo: Omit<WeeklyTodo, "id">) {
  const response = await api.post("/weekly-todos", todo);
  return unwrap<WeeklyTodo>(response);
}

export async function updateWeeklyTodo(id: string, todo: Partial<Omit<WeeklyTodo, "id">>) {
  const response = await api.patch(`/weekly-todos/${id}`, todo);
  return unwrap<WeeklyTodo>(response);
}

export async function deleteWeeklyTodo(id: string) {
  await api.delete(`/weekly-todos/${id}`);
}

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
