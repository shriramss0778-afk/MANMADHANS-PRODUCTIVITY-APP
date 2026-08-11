"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, LayoutGrid, Clock, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { KnowledgeCard } from "@/components/knowledge/knowledge-card";
import { KnowledgeDialog } from "@/components/knowledge/knowledge-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { Category, KnowledgeEntry } from "@/lib/types";

const CATEGORIES: (Category | "All")[] = [
  "All",
  "Technology",
  "Productivity",
  "Business",
  "Science",
  "Philosophy",
  "Finance",
  "Design",
];

export default function KnowledgePage() {
  const { knowledge: entries, addKnowledge, updateKnowledge, removeKnowledge, runAction } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((k) => {
      const matchesCategory = category === "All" || k.category === category;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        k.title.toLowerCase().includes(q) ||
        k.notes.toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [entries, query, category]);

  const timeline = useMemo(
    () =>
      [...entries].sort(
        (a, b) => +new Date(b.dateLearned) - +new Date(a.dateLearned),
      ),
    [entries],
  );

  const thisWeek = entries.filter(
    (k) => +new Date() - +new Date(k.dateLearned) < 7 * 864e5,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Everything you've learned, searchable and revisable"
        action={
          <KnowledgeDialog
            onSave={(entry) => runAction(() => addKnowledge(entry), "Could not save this entry.")}
          />
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total entries", value: entries.length, icon: LayoutGrid },
          { label: "Learned this week", value: thisWeek, icon: TrendingUp },
          { label: "Due for review", value: entries.filter((k) => k.revisionStatus === "due" || k.revisionStatus === "overdue").length, icon: Clock },
          { label: "Mastered", value: entries.filter((k) => k.revisionStatus === "mastered").length, icon: TrendingUp },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-[var(--surface)]">
                <s.icon className="size-4 text-brand-cyan" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="grid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="size-4" /> Library
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="size-4" /> Timeline
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, notes, tags..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Category filter chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === c
                  ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white"
                  : "glass text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <TabsContent value="grid">
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((entry, i) => (
                <KnowledgeCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onDelete={(id) => runAction(() => removeKnowledge(id), "Could not delete this entry.")}
                  onEdit={setEditing}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-muted">No entries match your search.</p>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Learning timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 border-l border-card-border pl-6">
                {timeline.map((k, i) => (
                  <motion.div
                    key={k.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative"
                  >
                    <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple ring-4 ring-background" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-muted">
                        {new Date(k.dateLearned).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <Badge variant="indigo">{k.category}</Badge>
                    </div>
                    <p className="mt-1 font-medium">{k.title}</p>
                    <p className="text-sm text-muted">{k.notes}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Controlled edit dialog */}
      {editing && (
        <KnowledgeDialog
          entry={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSave={(e) => {
            runAction(() => updateKnowledge(e), "Could not update this entry.");
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
