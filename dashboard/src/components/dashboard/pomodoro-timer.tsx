"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { PomodoroSettings } from "./pomodoro-settings";

type Mode = "focus" | "short" | "long";

const MODE_META: Record<Mode, { label: string; from: string; to: string }> = {
  focus: { label: "Focus", from: "#6366f1", to: "#a855f7" },
  short: { label: "Short break", from: "#01c3a8", to: "#22d3ee" },
  long: { label: "Long break", from: "#ffb741", to: "#f97316" },
};

export function PomodoroTimer({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [mode, setMode] = useState<Mode>("focus");
  const { timerSettings, focusSessions, recordFocusSession } = useStore();
  const durations: Record<Mode, number> = useMemo(
    () => ({
      focus: timerSettings.focus * 60,
      short: timerSettings.short * 60,
      long: timerSettings.long * 60,
    }),
    [timerSettings],
  );

  const [remaining, setRemaining] = useState(() => durations.focus);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [size, setSize] = useState(280);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTimerDoneSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;

    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = audioContextRef.current ?? new AudioCtx();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const notes = [880, 1174.66, 1567.98];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.16;
      const end = start + 0.14;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end);
    });
  }, [soundEnabled]);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setSize(width < 380 ? Math.max(200, width - 120) : 280);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const switchMode = useCallback(
    (nextMode: Mode) => {
      setMode(nextMode);
      setRemaining(durations[nextMode]);
      setRunning(false);
    },
    [durations],
  );

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          if (mode === "focus") {
            setCompleted((count) => count + 1);
            void recordFocusSession("focus", timerSettings.focus);
          }
          playTimerDoneSound();
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, playTimerDoneSound, recordFocusSession, running, timerSettings.focus]);

  useEffect(() => {
    setRemaining(durations[mode]);
    setRunning(false);
  }, [durations, mode]);

  const total = durations[mode];
  const progress = ((total - remaining) / total) * 100;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const meta = MODE_META[mode];
  const todayKey = new Date().toISOString().slice(0, 10);
  const persistedToday = focusSessions.filter(
    (session) => session.mode === "focus" && session.completedAt.slice(0, 10) === todayKey,
  ).length;
  const totalCompletedToday = Math.max(completed, persistedToday);

  return (
    <div className="flex min-w-0 flex-col items-center gap-6">
      <div className="flex w-full min-w-0 items-center gap-1 rounded-xl glass p-1 sm:w-auto sm:gap-2">
        {(Object.keys(durations) as Mode[]).map((item) => (
          <button
            key={item}
            onClick={() => switchMode(item)}
            className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              mode === item
                ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {MODE_META[item].label}
          </button>
        ))}
        <PomodoroSettings />
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="pomo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={meta.from} />
              <stop offset="100%" stopColor={meta.to} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#pomo-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {mode === "focus" ? (
            <Brain className="mb-2 size-6 text-brand-purple" />
          ) : (
            <Coffee className="mb-2 size-6 text-amber-400" />
          )}
          <span className="font-mono text-5xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-muted">{meta.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={() => setRunning((value) => !value)} className="w-32">
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="lg" variant="secondary" onClick={() => switchMode(mode)} aria-label="Reset">
          <RotateCcw className="size-5" />
        </Button>
      </div>

      <p className="text-sm text-muted">
        {totalCompletedToday} focus session{totalCompletedToday === 1 ? "" : "s"} completed today
      </p>
    </div>
  );
}
