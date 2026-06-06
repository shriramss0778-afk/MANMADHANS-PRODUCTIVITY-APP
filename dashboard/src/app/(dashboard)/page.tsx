"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  ArrowRight,
  Quote,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LearningHoursChart } from "@/components/analytics/charts";
import { HabitTracker } from "@/components/dashboard/habit-tracker";
import { useStore } from "@/lib/store";

const DAILY_QUOTES = [
  "Success belongs to the person who keeps moving forward when others stop.",
  "Every master was once a student who chose to keep learning.",
  "Great things happen when consistency is stronger than excuses.",
  "The difference between ordinary and extraordinary is persistence.",
  "Small progress each day creates remarkable results over time.",
  "Champions are built in the moments when no one is watching.",
  "Your future is created by what you do today, not tomorrow.",
  "Dreams work when determination works harder.",
  "The road to success is paved with patience and effort.",
  "Failures are lessons disguised as stepping stones.",
  "A strong mindset can overcome almost any obstacle.",
  "The person who refuses to quit is already ahead of most people.",
  "Every achievement begins with the decision to try.",
  "Growth starts where comfort ends.",
  "Hard work turns potential into reality.",
  "The climb may be difficult, but the view is worth it.",
  "Discipline is choosing what you want most over what you want now.",
  "Your only limit is the one you refuse to challenge.",
  "Progress is progress, no matter how small.",
  "Success is the result of thousands of unseen efforts.",
  "The strongest people are shaped by the toughest challenges.",
  "Keep going; every step forward counts.",
  "A winner is simply someone who never stopped improving.",
  "Believe in the process, even when results are invisible.",
  "Every setback is preparation for a comeback.",
  "The habit of persistence creates the power of success.",
  "Confidence grows through action, not waiting.",
  "One determined person can achieve what many think is impossible.",
  "Your effort today becomes your achievement tomorrow.",
  "The journey of a thousand miles begins with a single step.",
  "Success is earned one disciplined day at a time.",
  "What seems impossible today can become your reality tomorrow.",
  "The best investment is the effort you put into yourself.",
  "Stay focused on progress, not perfection.",
  "Every expert was once confused, uncertain, and inexperienced.",
  "Greatness is built through daily commitment.",
  "The harder the challenge, the greater the growth.",
  "Persistence can open doors that talent alone cannot.",
  "Your dreams deserve your dedication.",
  "Success starts when excuses end.",
  "Every day is another opportunity to become better.",
  "Determination transforms obstacles into opportunities.",
  "The strongest victories come after the hardest battles.",
  "Effort never goes to waste; it always teaches or rewards.",
  "The key to success is showing up even on difficult days.",
  "Your future self will thank you for not giving up today.",
  "Success is not about speed; it is about direction.",
  "The person who keeps learning never stops growing.",
  "Challenges are temporary, but growth lasts forever.",
  "The expert in anything was once a beginner who refused to give up.",
];

export default function OverviewPage() {
  const { tasks, knowledge: knowledgeEntries, books, analytics, user } = useStore();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dueToday = tasks.filter((t) => t.status === "pending" || t.status === "in-progress");
  const reading = books.filter((b) => b.status === "reading");
  const dueReview = knowledgeEntries.filter(
    (k) => k.revisionStatus === "due" || k.revisionStatus === "overdue",
  );
  const learningHours = analytics.weeklyLearningHours.reduce((sum, item) => sum + item.hours, 0);
  const completedBooks = books.filter((book) => book.status === "completed").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const productivityScore = Math.round(
    analytics.productivityRadar.reduce((sum, item) => sum + item.value, 0) /
      Math.max(1, analytics.productivityRadar.length),
  );
  const focusMetric = analytics.productivityRadar.find((item) => item.metric === "Focus")?.value ?? 0;
  const consistencyMetric =
    analytics.productivityRadar.find((item) => item.metric === "Consistency")?.value ?? 0;
  const readingMetric = analytics.productivityRadar.find((item) => item.metric === "Reading")?.value ?? 0;
  const topStreak = Math.max(0, ...analytics.productivityRadar.map((item) => item.value));
  const quoteIndex = Math.floor(Date.now() / 86_400_000) % DAILY_QUOTES.length;
  const dailyQuote = DAILY_QUOTES[quoteIndex];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good to see you, ${user?.name ?? "there"}`}
        subtitle={today}
        action={
          <Button asChild>
            <Link href="/focus">
              Start focus session <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Learning hours" value={`${learningHours.toFixed(1)}h`} icon={Clock} delta={12} accent="indigo" index={0} />
        <StatCard label="Books completed" value={`${completedBooks}`} icon={BookOpen} delta={8} accent="cyan" index={1} />
        <StatCard label="Tasks done" value={`${completedTasks}`} icon={CheckCircle2} delta={-3} accent="green" index={2} />
        <StatCard label="Day streak" value={`${topStreak}`} icon={Flame} delta={5} accent="orange" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Learning hours chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Learning activity</CardTitle>
              <p className="text-sm text-muted">Hours this week</p>
            </div>
            <Badge variant="purple">+12% vs last week</Badge>
          </CardHeader>
          <CardContent>
            <LearningHoursChart data={analytics.weeklyLearningHours} />
          </CardContent>
        </Card>

        {/* Productivity score */}
        <Card className="flex flex-col items-center justify-center">
          <CardHeader className="items-center">
            <CardTitle>Productivity score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <CircularProgress value={productivityScore} size={160} strokeWidth={12} sublabel="this week" />
            <div className="grid w-full grid-cols-3 gap-2 text-center">
              <div className="rounded-xl glass p-2">
                <p className="text-sm font-bold">{focusMetric}%</p>
                <p className="text-[10px] text-muted">Focus</p>
              </div>
              <div className="rounded-xl glass p-2">
                <p className="text-sm font-bold">{consistencyMetric}%</p>
                <p className="text-[10px] text-muted">Consistency</p>
              </div>
              <div className="rounded-xl glass p-2">
                <p className="text-sm font-bold">{readingMetric}%</p>
                <p className="text-[10px] text-muted">Reading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-brand-cyan" /> Today&apos;s focus
            </CardTitle>
            <Link href="/tasks" className="text-xs text-brand-cyan hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueToday.slice(0, 4).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex min-w-0 flex-col gap-2 rounded-xl glass p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${
                    t.priority === "high"
                      ? "bg-rose-400"
                      : t.priority === "medium"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium leading-5">{t.title}</p>
                  <p className="text-[11px] text-muted capitalize">{t.status.replace("-", " ")}</p>
                </div>
                <Badge variant="outline" className="self-start sm:self-center">{t.goalScope}</Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Continue reading */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-4 text-brand-purple" /> Continue reading
            </CardTitle>
            <Link href="/books" className="text-xs text-brand-cyan hover:underline">
              Library
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {reading.slice(0, 3).map((b) => {
              const pct = Math.round((b.pagesRead / b.totalPages) * 100);
              return (
                <div key={b.id} className="min-w-0 space-y-1.5 rounded-xl glass p-3">
                  <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{b.title}</span>
                    <span className="shrink-0 text-muted">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                  <p className="text-[11px] text-muted">
                    {b.pagesRead}/{b.totalPages} pages · {b.author}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Review due */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-4 text-brand-cyan" /> Review due
            </CardTitle>
            <Link href="/knowledge" className="text-xs text-brand-cyan hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueReview.slice(0, 4).map((k) => (
              <div key={k.id} className="flex min-w-0 flex-col gap-2 rounded-xl glass p-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium leading-5">{k.title}</p>
                  <p className="text-[11px] text-muted">Retention {k.retention}%</p>
                </div>
                <Badge variant={k.revisionStatus === "overdue" ? "red" : "orange"} className="self-start sm:self-center">
                  {k.revisionStatus}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Habits + motivation */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitTracker />
        </div>
        <Card className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-brand-purple/20 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="size-4 text-brand-purple" /> Daily motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium leading-relaxed">&ldquo;{dailyQuote}&rdquo;</p>
            <p className="mt-3 text-sm text-muted">Keep your 21-day streak alive 🔥</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
