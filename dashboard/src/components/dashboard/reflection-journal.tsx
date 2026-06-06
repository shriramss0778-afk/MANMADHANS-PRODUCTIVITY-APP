"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Laugh, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const MOODS = [
  { id: "great", icon: Laugh, label: "Great", color: "#01c3a8" },
  { id: "good", icon: Smile, label: "Good", color: "#22d3ee" },
  { id: "okay", icon: Meh, label: "Okay", color: "#ffb741" },
  { id: "low", icon: Frown, label: "Low", color: "#a63d2a" },
] as const;

export function ReflectionJournal() {
  const { reflections, saveReflection } = useStore();
  const [mood, setMood] = useState<string>("good");
  const [gratitude, setGratitude] = useState("");
  const [wins, setWins] = useState("");
  const [improve, setImprove] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await saveReflection({
      date: new Date().toISOString().slice(0, 10),
      mood: mood as "great" | "good" | "okay" | "low",
      gratitude,
      wins,
      improve,
    });
    setSaved(true);
    setGratitude("");
    setWins("");
    setImprove("");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily reflection</CardTitle>
        <p className="text-sm text-muted">End your day with intention</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">How was your day?</p>
          <div className="flex gap-2">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 transition-all",
                    active ? "border-transparent" : "border-card-border hover:bg-[var(--surface)]",
                  )}
                  style={active ? { background: `${m.color}22`, borderColor: `${m.color}66` } : {}}
                >
                  <Icon className="size-5" style={{ color: active ? m.color : undefined }} />
                  <span className="text-[11px] text-muted">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Grateful for</label>
            <Textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="Today I'm grateful for..." className="min-h-[60px]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Wins</label>
            <Textarea value={wins} onChange={(e) => setWins(e.target.value)} placeholder="What went well?" className="min-h-[60px]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Improve tomorrow</label>
            <Textarea value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="One thing to do better..." className="min-h-[60px]" />
          </div>
        </div>

        <Button onClick={() => void save()} className="w-full">
          <Save className="size-4" /> {saved ? "Saved!" : "Save reflection"}
        </Button>

        <div className="border-t border-card-border pt-3">
          <p className="mb-2 text-xs font-medium text-muted">Recent entries</p>
          <div className="space-y-2">
            {reflections.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl glass p-3 text-xs"
              >
                <p className="font-medium text-foreground">
                  {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <p className="mt-1 text-muted">{r.wins}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
