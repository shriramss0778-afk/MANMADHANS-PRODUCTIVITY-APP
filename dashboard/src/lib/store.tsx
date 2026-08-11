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
import { getErrorMessage, isUnauthorizedError } from "@/lib/api/errors";
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

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focus: 25,
  short: 5,
  long: 15,
};

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
  /** Set when the session could not be restored for a reason other than being signed out. */
  sessionError: string | null;
  /** Message for the most recent failed background action, surfaced by <ErrorToast />. */
  actionError: string | null;
  dismissActionError: () => void;
  reportError: (error: unknown, fallback: string) => void;
  /** Runs a mutation the caller does not await, surfacing failures instead of dropping them. */
  runAction: (action: () => Promise<unknown>, fallback: string) => void;
  retryHydration: () => void;
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
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const dismissActionError = useCallback(() => setActionError(null), []);

  const reportError = useCallback((error: unknown, fallback: string) => {
    console.error(fallback, error);
    setActionError(getErrorMessage(error, fallback));
  }, []);

  const runAction = useCallback(
    (action: () => Promise<unknown>, fallback: string) => {
      action().catch((error) => reportError(error, fallback));
    },
    [reportError],
  );

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bootstrapApp();
      applyBootstrapState(data);
      setSessionError(null);
    } catch (error) {
      resetSessionState();
      if (isUnauthorizedError(error)) {
        setSessionError(null);
        return;
      }
      console.error("Failed to restore session", error);
      setSessionError(getErrorMessage(error, "Could not load your workspace. Please try again."));
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [applyBootstrapState, resetSessionState]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const retryHydration = useCallback(() => {
    runAction(hydrate, "Could not load your workspace. Please try again.");
  }, [hydrate, runAction]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginWithPassword(email, password);
      applyBootstrapState(data);
      setSessionError(null);
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
      setSessionError(null);
      setHydrated(true);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrapState]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutSession();
    } catch (error) {
      reportError(error, "Signed out on this device, but the server could not be reached.");
    } finally {
      resetSessionState();
      setSessionError(null);
      setHydrated(true);
      setLoading(false);
    }
  }, [reportError, resetSessionState]);

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

  // Analytics are derived data: a refresh failure must not make a successful
  // mutation look like it failed, but it is still reported to the user.
  const syncAnalytics = useCallback(async () => {
    try {
      await refreshAnalytics();
    } catch (error) {
      reportError(error, "Your change was saved, but analytics could not be refreshed.");
    }
  }, [refreshAnalytics, reportError]);

  const addKnowledge = useCallback(async (entry: KnowledgeEntry) => {
    const saved = await createKnowledge(withoutId(entry));
    setKnowledge((prev) => [saved, ...prev]);
    await syncAnalytics();
  }, [syncAnalytics]);

  const updateKnowledge = useCallback(async (entry: KnowledgeEntry) => {
    const saved = await persistKnowledge(entry.id, withoutId(entry));
    setKnowledge((prev) => prev.map((item) => (item.id === entry.id ? saved : item)));
    await syncAnalytics();
  }, [syncAnalytics]);

  const removeKnowledge = useCallback(async (id: string) => {
    await deleteKnowledge(id);
    setKnowledge((prev) => prev.filter((item) => item.id !== id));
    await syncAnalytics();
  }, [syncAnalytics]);

  const addBook = useCallback(async (book: Book) => {
    const saved = await createBook(withoutId(book));
    setBooks((prev) => [saved, ...prev]);
    await syncAnalytics();
  }, [syncAnalytics]);

  const updateBook = useCallback(async (book: Book) => {
    const saved = await persistBook(book.id, withoutId(book));
    setBooks((prev) => prev.map((item) => (item.id === book.id ? saved : item)));
    await syncAnalytics();
  }, [syncAnalytics]);

  const removeBook = useCallback(async (id: string) => {
    await deleteBook(id);
    setBooks((prev) => prev.filter((item) => item.id !== id));
    await syncAnalytics();
  }, [syncAnalytics]);

  const addTask = useCallback(async (task: Task) => {
    const saved = await createTask(withoutId(task));
    setTasks((prev) => [saved, ...prev]);
    await syncAnalytics();
  }, [syncAnalytics]);

  const updateTask = useCallback(async (task: Task) => {
    const saved = await persistTask(task.id, withoutId(task));
    setTasks((prev) => prev.map((item) => (item.id === task.id ? saved : item)));
    await syncAnalytics();
  }, [syncAnalytics]);

  const removeTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
    await syncAnalytics();
  }, [syncAnalytics]);

  const setTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    const saved = await persistTask(id, { status });
    setTasks((prev) => prev.map((item) => (item.id === id ? saved : item)));
    await syncAnalytics();
  }, [syncAnalytics]);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const current = tasks.find((task) => task.id === taskId);
    if (!current) return;
    const saved = await persistTask(taskId, {
      subtasks: current.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
      ),
    });
    setTasks((prev) => prev.map((item) => (item.id === taskId ? saved : item)));
    await syncAnalytics();
  }, [tasks, syncAnalytics]);

  const addEvent = useCallback(async (event: CalendarEvent) => {
    const saved = await createEvent(withoutId(event));
    setEvents((prev) => [...prev, saved]);
  }, []);

  const updateEvent = useCallback(async (event: CalendarEvent) => {
    const saved = await persistEvent(event.id, withoutId(event));
    setEvents((prev) => prev.map((item) => (item.id === event.id ? saved : item)));
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    await deleteEvent(id);
    setEvents((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addHabit = useCallback(async (habit: Habit) => {
    const saved = await createHabit(withoutId(habit));
    setHabits((prev) => [...prev, saved]);
    await syncAnalytics();
  }, [syncAnalytics]);

  const updateHabit = useCallback(async (habit: Habit) => {
    const saved = await persistHabit(habit.id, withoutId(habit));
    setHabits((prev) => prev.map((item) => (item.id === habit.id ? saved : item)));
    await syncAnalytics();
  }, [syncAnalytics]);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((item) => item.id !== id));
    await syncAnalytics();
  }, [syncAnalytics]);

  const toggleHabitDay = useCallback(async (habitId: string, date: string) => {
    const current = habits.find((habit) => habit.id === habitId);
    if (!current) return;
    const nextLog = { ...(current.log ?? {}) };
    nextLog[date] = !nextLog[date];
    const saved = await persistHabit(habitId, { log: nextLog });
    setHabits((prev) => prev.map((item) => (item.id === habitId ? saved : item)));
    await syncAnalytics();
  }, [habits, syncAnalytics]);

  const addWeeklyTodo = useCallback(async (todo: WeeklyTodo) => {
    const saved = await createWeeklyTodo(withoutId(todo));
    setWeeklyTodos((prev) => [...prev, saved]);
  }, []);

  const removeWeeklyTodo = useCallback(async (id: string) => {
    await deleteWeeklyTodo(id);
    setWeeklyTodos((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleWeeklyTodo = useCallback(async (id: string) => {
    const current = weeklyTodos.find((todo) => todo.id === id);
    if (!current) return;
    const saved = await persistWeeklyTodo(id, { done: !current.done });
    setWeeklyTodos((prev) => prev.map((item) => (item.id === id ? saved : item)));
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
    setQuickCapture((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveReflection = useCallback(async (entry: Omit<ReflectionEntry, "id">) => {
    const saved = await persistReflection(entry);
    setReflections((prev) => {
      const existing = prev.find((item) => item.id === saved.id);
      if (existing) {
        return prev.map((item) => (item.id === saved.id ? saved : item));
      }
      return [saved, ...prev].slice(0, 20);
    });
    await syncAnalytics();
  }, [syncAnalytics]);

  const recordFocusSession = useCallback(async (mode: FocusSession["mode"], durationMins: number) => {
    const saved = await createFocusSession({ mode, durationMins });
    setFocusSessions((prev) => [saved, ...prev].slice(0, 200));
    await syncAnalytics();
  }, [syncAnalytics]);

  const value = useMemo<StoreValue>(() => ({
    hydrated,
    loading,
    user,
    sessionError,
    actionError,
    dismissActionError,
    reportError,
    runAction,
    retryHydration,
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
    sessionError,
    actionError,
    dismissActionError,
    reportError,
    runAction,
    retryHydration,
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
