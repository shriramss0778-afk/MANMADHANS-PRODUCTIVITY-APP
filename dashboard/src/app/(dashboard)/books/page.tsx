"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, Flame, Target } from "lucide-react";
import { Heatmap } from "@/components/analytics/heatmap";
import { WeeklyBars } from "@/components/analytics/charts";
import { AddBookDialog } from "@/components/dashboard/add-book-dialog";
import { BookCard } from "@/components/dashboard/book-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { BookStatus } from "@/lib/types";

export default function BooksPage() {
  const { books, addBook, removeBook, analytics } = useStore();
  const [tab, setTab] = useState<BookStatus | "all">("all");

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
  const yearGoal = 24;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reading Tracker"
        subtitle="Build the streak, finish the shelf"
        action={<AddBookDialog onAdd={addBook} />}
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
            <CardTitle>2026 reading goal</CardTitle>
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
                <BookCard key={book.id} book={book} index={index} onDelete={removeBook} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
