"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NotebookPen, Plus, Trash2, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { ReflectionJournal } from "@/components/dashboard/reflection-journal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function FocusPage() {
  const { quickCapture, addQuickCapture, removeQuickCapture, runAction } = useStore();
  const [draft, setDraft] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("focus-timer-sound");
    if (saved === "off") {
      setSoundEnabled(false);
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((value) => {
      const next = !value;
      window.localStorage.setItem("focus-timer-sound", next ? "on" : "off");
      return next;
    });
  };

  const addNote = () => {
    const note = draft.trim();
    if (!note) return;
    runAction(async () => {
      await addQuickCapture(note);
      setDraft("");
    }, "Could not save this note.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Mode"
        subtitle="Deep work, distraction-free"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label={soundEnabled ? "Switch timer sound off" : "Switch timer sound on"}
              onClick={toggleSound}
              className={soundEnabled ? "text-brand-cyan" : undefined}
            >
              {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </Button>
            <Button variant="secondary" size="icon" aria-label="Fullscreen">
              <Maximize2 className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="py-10">
            <PomodoroTimer soundEnabled={soundEnabled} />
          </CardContent>
        </Card>

        {/* Quick capture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="size-4 text-brand-cyan" /> Quick capture
            </CardTitle>
            <p className="text-sm text-muted">Jot a thought without breaking flow</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex min-w-0 items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Capture a thought..."
                className="min-w-0 flex-1"
              />
              <Button size="icon" onClick={addNote} aria-label="Add note" className="shrink-0">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {quickCapture.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex min-w-0 items-center gap-2 rounded-xl glass p-3"
                  >
                    <span className="min-w-0 flex-1 break-words text-sm">{note.content}</span>
                    <button
                      onClick={() =>
                        runAction(() => removeQuickCapture(note.id), "Could not delete this note.")
                      }
                      className="shrink-0 text-muted opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                      aria-label="Delete note"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {quickCapture.length === 0 && (
                <p className="py-6 text-center text-sm text-muted">No notes yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReflectionJournal />

        <Card className="relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-indigo/20 blur-3xl" />
          <CardHeader>
            <CardTitle>Focus tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Work in 25-minute sprints, then rest 5.",
              "Silence notifications and close extra tabs.",
              "Define one clear outcome before you start.",
              "After 4 sprints, take a longer 15-minute break.",
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl glass p-3"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm">{tip}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
