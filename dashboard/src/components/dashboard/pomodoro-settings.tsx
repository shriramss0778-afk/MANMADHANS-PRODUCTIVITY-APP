"use client";

import { useState, useEffect } from "react";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

export function PomodoroSettings() {
  const { timerSettings, setTimerSetting, resetTimerSettings, runAction } = useStore();
  const [values, setValues] = useState({ ...timerSettings });

  useEffect(() => {
    setValues({ ...timerSettings });
  }, [timerSettings]);

  function onChange(mode: keyof typeof values, v: string) {
    const n = Math.max(1, Math.round(Number(v) || 0));
    setValues((s) => ({ ...s, [mode]: n }));
    runAction(() => setTimerSetting(mode, n), "Could not save your timer settings.");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-0 shrink-0 px-2 sm:ml-2">
          <Settings className="size-4" />
          <span className="sr-only">Timer settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer settings</DialogTitle>
          <DialogDescription>Customize durations (minutes) used across the app.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <label className="flex items-center justify-between">
            <span>Focus</span>
            <input
              className="w-20 rounded-md bg-transparent text-right"
              type="number"
              min={1}
              value={values.focus}
              onChange={(e) => onChange("focus", e.target.value)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Short break</span>
            <input
              className="w-20 rounded-md bg-transparent text-right"
              type="number"
              min={1}
              value={values.short}
              onChange={(e) => onChange("short", e.target.value)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Long break</span>
            <input
              className="w-20 rounded-md bg-transparent text-right"
              type="number"
              min={1}
              value={values.long}
              onChange={(e) => onChange("long", e.target.value)}
            />
          </label>
        </div>

        <DialogFooter>
          <div className="flex flex-1 items-center justify-start">
            <Button
              variant="secondary"
              onClick={() =>
                runAction(resetTimerSettings, "Could not reset your timer settings.")
              }
            >
              <RefreshCw className="size-4 mr-2" /> Reset to defaults
            </Button>
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
