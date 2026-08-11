import type { TimerSettings } from "@/lib/types";

/** Pomodoro durations applied to new accounts and used as the client fallback. */
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focus: 25,
  short: 5,
  long: 15,
};

/** Books per year target assigned to new accounts. */
export const DEFAULT_READING_GOAL = 24;
