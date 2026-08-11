"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, Flame, Pencil, Target } from "lucide-react";
import { Heatmap } from "@/components/analytics/heatmap";
import { WeeklyBars } from "@/components/analytics/charts";
import { AddBookDialog } from "@/components/dashboard/add-book-dialog";
import { BookCard } from "@/components/dashboard/book-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { BookStatus } from "@/lib/types";

export default function BooksPage() {
  const { user, books, addBook, updateBook, removeBook, updateReadingGoal, analytics, runAction } =
    useStore();
  const [tab, setTab] = useState<BookStatus | "all">("all");
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(user?.readingGoal ?? 24));

  const filtered = tab === "all" ? books : books.filter((b) => b.status === tab);
  const completed = books.filter((b) => b.status === "completed").length;
  const readingBooks = books.filter((b) => b.status === "reading");
  const reading = readingBooks.length;
  const currentBook = [...readingBooks].sort((a, b) => {
    const aDate = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const bDate = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return bDate - aDate;
  })[0];
  const totalPages = books.reduce((sum, book) => sum + book.pagesRead, 0);
  const yearGoal = user?.readingGoal ?? 24;

  const saveReadingGoal = () => {
    const nextGoal = Math.max(1, parseInt(goalInput, 10) || yearGoal || 24);
    runAction(async () => {
      await updateReadingGoal(nextGoal);
      setGoalInput(String(nextGoal));
      setGoalOpen(false);
    }, "Could not update your reading goal.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reading Tracker"
        subtitle="Build the streak, finish the shelf"
        action={
          <AddBookDialog onAdd={(book) => runAction(() => addBook(book), "Could not add this book.")} />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Currently Reading"
          value={currentBook?.title ?? `${reading} book${reading !== 1 ? "s" : ""}`}
          detail={`${reading} book${reading !== 1 ? "s" : ""}`}
          icon={BookOpen}
          accent="cyan"
          index={0}
          valueIsTitle={!!currentBook}
        />
        <StatCard label="Completed" value={`${completed}`} icon={CheckCircle2} delta={8} accent="green" index={1} />
        <StatCard label="Pages This Month" value={`${totalPages}`} icon={Target} delta={15} accent="indigo" index={2} />
        <StatCard label="Reading Streak" value="12 days" icon={Flame} delta={4} accent="orange" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reading heatmap</CardTitle>
            <p className="text-sm text-muted">Last 7 weeks of reading activity</p>
          </CardHeader>
          <CardContent>
            <Heatmap data={analytics.readingHeatmap} accent="green" />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <CardHeader className="items-center">
            <div className="flex items-center gap-2">
              <CardTitle>2026 reading goal</CardTitle>
              <Dialog
                open={goalOpen}
                onOpenChange={(open) => {
                  setGoalOpen(open);
                  if (open) {
                    setGoalInput(String(yearGoal));
                  }
                }}
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Edit reading goal"
                    className="grid size-8 place-items-center rounded-lg bg-[var(--surface)] text-muted transition-all hover:bg-[var(--surface-hover)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <Pencil className="size-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Edit reading goal</DialogTitle>
                    <DialogDescription>
                      Update the total number of books you want to finish this year.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="reading-goal">
                      Number of books
                    </label>
                    <Input
                      id="reading-goal"
                      type="number"
                      min={1}
                      max={500}
                      value={goalInput}
                      onChange={(event) => setGoalInput(event.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setGoalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveReadingGoal}>
                      Save goal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <CircularProgress
              value={Math.round((completed / yearGoal) * 100)}
              size={150}
              from="#01c3a8"
              to="#22d3ee"
              label={`${completed}/${yearGoal}`}
              sublabel="books"
              gradientId="book-goal"
            />
            <p className="text-center text-sm text-muted">
              {yearGoal - completed} books to reach your goal
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily pages read</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyBars data={analytics.dailyPages} dataKey="pages" color="#01c3a8" />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(value) => setTab(value as BookStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="grid gap-5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onEdit={(next) => runAction(() => updateBook(next), "Could not update this book.")}
                  onDelete={(id) => runAction(() => removeBook(id), "Could not delete this book.")}
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
