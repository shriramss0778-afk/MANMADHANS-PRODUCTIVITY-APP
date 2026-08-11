"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  bootstrapApp,
  createBook,
  createEvent,
  createFocusSession,
  createHabit,
  createKnowledge,
  createQuickCapture,
  createTask,
  createWeeklyTodo,
  deleteBook,
  deleteEvent,
  deleteHabit,
  deleteKnowledge,
  deleteQuickCapture,
  deleteTask,
  deleteWeeklyTodo,
  fetchAnalytics,
  loginWithGoogle,
  loginWithPassword,
  logoutSession,
  saveReflection as persistReflection,
  saveScratchpad as persistScratchpad,
  changePassword as persistPasswordChange,
  updateReadingGoal as persistReadingGoal,
  updateBook as persistBook,
  updateEvent as persistEvent,
  updateHabit as persistHabit,
  updateKnowledge as persistKnowledge,
  updateProfileName as persistProfileName,
  updateTask as persistTask,
  updateTimerSettings as persistTimerSettings,
  updateWeeklyTodo as persistWeeklyTodo,
} from "@/lib/api/dashboard";
import { setAccessToken } from "@/lib/api/client";
import { removeById, replaceById } from "@/lib/collections";
import { DEFAULT_TIMER_SETTINGS } from "@/lib/defaults";
import type {
  AnalyticsPayload,
  AppNote,
  AuthenticatedUser,
  Book,
  CalendarEvent,
  FocusSession,
  Habit,
  KnowledgeEntry,
  ReflectionEntry,
  Task,
  TaskStatus,
  TimerSettings,
  WeeklyTodo,
} from "@/lib/types";

const EMPTY_ANALYTICS: AnalyticsPayload = {
  weeklyLearningHours: [],
  knowledgeGrowth: [],
  categoryDistribution: [],
  productivityRadar: [],
  focusHeatmap: [],
  readingHeatmap: [],
  dailyPages: [],
};

interface StoreValue {
  hydrated: boolean;
  loading: boolean;
  user: AuthenticatedUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  updateReadingGoal: (readingGoal: number) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  analytics: AnalyticsPayload;
  scratchpad: AppNote | null;
  quickCapture: AppNote[];
  reflections: ReflectionEntry[];
  focusSessions: FocusSession[];
  knowledge: KnowledgeEntry[];
  addKnowledge: (entry: KnowledgeEntry) => Promise<void>;
  updateKnowledge: (entry: KnowledgeEntry) => Promise<void>;
  removeKnowledge: (id: string) => Promise<void>;
  books: Book[];
  addBook: (book: Book) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  habits: Habit[];
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabitDay: (habitId: string, date: string) => Promise<void>;
  weeklyTodos: WeeklyTodo[];
  addWeeklyTodo: (todo: WeeklyTodo) => Promise<void>;
  removeWeeklyTodo: (id: string) => Promise<void>;
  toggleWeeklyTodo: (id: string) => Promise<void>;
  timerSettings: TimerSettings;
  setTimerSetting: (mode: keyof TimerSettings, minutes: number) => Promise<void>;
  resetTimerSettings: () => Promise<void>;
  saveScratchpad: (content: string, title?: string) => Promise<AppNote>;
  addQuickCapture: (content: string, title?: string) => Promise<void>;
  removeQuickCapture: (id: string) => Promise<void>;
  saveReflection: (entry: Omit<ReflectionEntry, "id">) => Promise<void>;
  recordFocusSession: (mode: FocusSession["mode"], durationMins: number) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

function withoutId<T extends { id: string }>(value: T): Omit<T, "id"> {
  const { id: _id, ...rest } = value;
  return rest;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPayload>(EMPTY_ANALYTICS);
  const [scratchpad, setScratchpad] = useState<AppNote | null>(null);
  const [quickCapture, setQuickCapture] = useState<AppNote[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyTodos, setWeeklyTodos] = useState<WeeklyTodo[]>([]);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const scratchpadSaveRequestRef = useRef(0);

  const applyBootstrapState = useCallback((data: Awaited<ReturnType<typeof bootstrapApp>>) => {
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    setUser(data.user);
    setAnalytics(data.analytics);
    setScratchpad(data.scratchpad);
    setQuickCapture(data.quickCapture);
    setReflections(data.reflections);
    setFocusSessions(data.focusSessions);
    setKnowledge(data.knowledge);
    setBooks(data.books);
    setTasks(data.tasks);
    setEvents(data.events);
    setHabits(data.habits);
    setWeeklyTodos(data.weeklyTodos);
    setTimerSettings(data.timerSettings);
  }, []);

  const resetSessionState = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setAnalytics(EMPTY_ANALYTICS);
    setScratchpad(null);
    setQuickCapture([]);
    setReflections([]);
    setFocusSessions([]);
    setKnowledge([]);
    setBooks([]);
    setTasks([]);
    setEvents([]);
    setHabits([]);
    setWeeklyTodos([]);
    setTimerSettings(DEFAULT_TIMER_SETTINGS);
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bootstrapApp();
      applyBootstrapState(data);
    } catch {
      resetSessionState();
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [applyBootstrapState, resetSessionState]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginWithPassword(email, password);
      applyBootstrapState(data);
      setHydrated(true);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrapState]);

  const handleGoogleLogin = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const data = await loginWithGoogle(credential);
      applyBootstrapState(data);
      setHydrated(true);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrapState]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutSession();
      resetSessionState();
      setHydrated(true);
    } finally {
      setLoading(false);
    }
  }, [resetSessionState]);

  const updateProfileName = useCallback(async (name: string) => {
    const nextUser = await persistProfileName(name);
    setUser(nextUser);
  }, []);

  const updateReadingGoal = useCallback(async (readingGoal: number) => {
    const nextUser = await persistReadingGoal(readingGoal);
    setUser(nextUser);
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const nextUser = await persistPasswordChange(oldPassword, newPassword, confirmPassword);
    setUser(nextUser);
  }, []);

  const refreshAnalytics = useCallback(async () => {
    const next = await fetchAnalytics();
    setAnalytics(next);
  }, []);

  const addKnowledge = useCallback(async (entry: KnowledgeEntry) => {
    const saved = await createKnowledge(withoutId(entry));
    setKnowledge((prev) => [saved, ...prev]);
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const updateKnowledge = useCallback(async (entry: KnowledgeEntry) => {
    const saved = await persistKnowledge(entry.id, withoutId(entry));
    setKnowledge((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const removeKnowledge = useCallback(async (id: string) => {
    await deleteKnowledge(id);
    setKnowledge((prev) => removeById(prev, id));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const addBook = useCallback(async (book: Book) => {
    const saved = await createBook(withoutId(book));
    setBooks((prev) => [saved, ...prev]);
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const updateBook = useCallback(async (book: Book) => {
    const saved = await persistBook(book.id, withoutId(book));
    setBooks((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const removeBook = useCallback(async (id: string) => {
    await deleteBook(id);
    setBooks((prev) => removeById(prev, id));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const addTask = useCallback(async (task: Task) => {
    const saved = await createTask(withoutId(task));
    setTasks((prev) => [saved, ...prev]);
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const updateTask = useCallback(async (task: Task) => {
    const saved = await persistTask(task.id, withoutId(task));
    setTasks((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const removeTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => removeById(prev, id));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const setTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    const saved = await persistTask(id, { status });
    setTasks((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const current = tasks.find((task) => task.id === taskId);
    if (!current) return;
    const saved = await persistTask(taskId, {
      subtasks: current.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
      ),
    });
    setTasks((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [tasks, refreshAnalytics]);

  const addEvent = useCallback(async (event: CalendarEvent) => {
    const saved = await createEvent(withoutId(event));
    setEvents((prev) => [...prev, saved]);
  }, []);

  const updateEvent = useCallback(async (event: CalendarEvent) => {
    const saved = await persistEvent(event.id, withoutId(event));
    setEvents((prev) => replaceById(prev, saved));
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    await deleteEvent(id);
    setEvents((prev) => removeById(prev, id));
  }, []);

  const addHabit = useCallback(async (habit: Habit) => {
    const saved = await createHabit(withoutId(habit));
    setHabits((prev) => [...prev, saved]);
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const updateHabit = useCallback(async (habit: Habit) => {
    const saved = await persistHabit(habit.id, withoutId(habit));
    setHabits((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((prev) => removeById(prev, id));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const toggleHabitDay = useCallback(async (habitId: string, date: string) => {
    const current = habits.find((habit) => habit.id === habitId);
    if (!current) return;
    const nextLog = { ...(current.log ?? {}) };
    nextLog[date] = !nextLog[date];
    const saved = await persistHabit(habitId, { log: nextLog });
    setHabits((prev) => replaceById(prev, saved));
    await refreshAnalytics();
  }, [habits, refreshAnalytics]);

  const addWeeklyTodo = useCallback(async (todo: WeeklyTodo) => {
    const saved = await createWeeklyTodo(withoutId(todo));
    setWeeklyTodos((prev) => [...prev, saved]);
  }, []);

  const removeWeeklyTodo = useCallback(async (id: string) => {
    await deleteWeeklyTodo(id);
    setWeeklyTodos((prev) => removeById(prev, id));
  }, []);

  const toggleWeeklyTodo = useCallback(async (id: string) => {
    const current = weeklyTodos.find((todo) => todo.id === id);
    if (!current) return;
    const saved = await persistWeeklyTodo(id, { done: !current.done });
    setWeeklyTodos((prev) => replaceById(prev, saved));
  }, [weeklyTodos]);

  const setTimerSetting = useCallback(async (mode: keyof TimerSettings, minutes: number) => {
    const saved = await persistTimerSettings({
      ...timerSettings,
      [mode]: Math.max(1, Math.round(minutes)),
    });
    setTimerSettings(saved);
  }, [timerSettings]);

  const resetTimerSettings = useCallback(async () => {
    const saved = await persistTimerSettings(DEFAULT_TIMER_SETTINGS);
    setTimerSettings(saved);
  }, []);

  const saveScratchpad = useCallback(async (content: string, title?: string) => {
    const requestId = scratchpadSaveRequestRef.current + 1;
    scratchpadSaveRequestRef.current = requestId;
    const saved = await persistScratchpad(content, title);
    if (requestId === scratchpadSaveRequestRef.current) {
      setScratchpad(saved);
    }
    return saved;
  }, []);

  const addQuickCapture = useCallback(async (content: string, title?: string) => {
    const saved = await createQuickCapture(content, title);
    setQuickCapture((prev) => [saved, ...prev]);
  }, []);

  const removeQuickCapture = useCallback(async (id: string) => {
    await deleteQuickCapture(id);
    setQuickCapture((prev) => removeById(prev, id));
  }, []);

  const saveReflection = useCallback(async (entry: Omit<ReflectionEntry, "id">) => {
    const saved = await persistReflection(entry);
    setReflections((prev) => {
      const existing = prev.find((item) => item.id === saved.id);
      if (existing) {
        return replaceById(prev, saved);
      }
      return [saved, ...prev].slice(0, 20);
    });
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const recordFocusSession = useCallback(async (mode: FocusSession["mode"], durationMins: number) => {
    const saved = await createFocusSession({ mode, durationMins });
    setFocusSessions((prev) => [saved, ...prev].slice(0, 200));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  const value = useMemo<StoreValue>(() => ({
    hydrated,
    loading,
    user,
    login,
    loginWithGoogle: handleGoogleLogin,
    logout,
    updateProfileName,
    updateReadingGoal,
    changePassword,
    analytics,
    scratchpad,
    quickCapture,
    reflections,
    focusSessions,
    knowledge,
    addKnowledge,
    updateKnowledge,
    removeKnowledge,
    books,
    addBook,
    updateBook,
    removeBook,
    tasks,
    addTask,
    updateTask,
    removeTask,
    setTaskStatus,
    toggleSubtask,
    events,
    addEvent,
    updateEvent,
    removeEvent,
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    toggleHabitDay,
    weeklyTodos,
    addWeeklyTodo,
    removeWeeklyTodo,
    toggleWeeklyTodo,
    timerSettings,
    setTimerSetting,
    resetTimerSettings,
    saveScratchpad,
    addQuickCapture,
    removeQuickCapture,
    saveReflection,
    recordFocusSession,
    refreshAnalytics,
  }), [
    hydrated,
    loading,
    user,
    login,
    handleGoogleLogin,
    logout,
    updateProfileName,
    updateReadingGoal,
    changePassword,
    analytics,
    scratchpad,
    quickCapture,
    reflections,
    focusSessions,
    knowledge,
    addKnowledge,
    updateKnowledge,
    removeKnowledge,
    books,
    addBook,
    updateBook,
    removeBook,
    tasks,
    addTask,
    updateTask,
    removeTask,
    setTaskStatus,
    toggleSubtask,
    events,
    addEvent,
    updateEvent,
    removeEvent,
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    toggleHabitDay,
    weeklyTodos,
    addWeeklyTodo,
    removeWeeklyTodo,
    toggleWeeklyTodo,
    timerSettings,
    setTimerSetting,
    resetTimerSettings,
    saveScratchpad,
    addQuickCapture,
    removeQuickCapture,
    saveReflection,
    recordFocusSession,
    refreshAnalytics,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within <StoreProvider>");
  }
  return ctx;
}
