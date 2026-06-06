"use client";

import { motion } from "framer-motion";
import { Star, Quote, BookMarked, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookCard({
  book,
  index = 0,
  onDelete,
}: {
  book: Book;
  index?: number;
  onDelete?: (id: string) => void;
}) {
  const pct = Math.round((book.pagesRead / book.totalPages) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group glass-strong glow-ring flex gap-4 overflow-hidden rounded-2xl p-4"
    >
      <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.cover}
          alt={book.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {book.status === "completed" && (
          <div className="absolute inset-0 grid place-items-center bg-emerald-500/30 backdrop-blur-[1px]">
            <BookMarked className="size-7 text-white drop-shadow" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="min-w-0">
            <h3 className="break-words text-sm font-semibold leading-5 sm:line-clamp-2 sm:text-base">
              {book.title}
            </h3>
            <p className="text-xs text-muted">{book.author}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              variant={
                book.status === "completed" ? "green" : book.status === "reading" ? "cyan" : "outline"
              }
              className="capitalize"
            >
              {book.status}
            </Badge>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(book.id)}
                aria-label={`Delete ${book.title}`}
                className="grid size-7 place-items-center rounded-lg bg-[var(--surface)] text-muted transition-all hover:bg-rose-500/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        {book.rating !== undefined && (
          <div className="mt-1.5 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i < (book.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-white/20",
                )}
              />
            ))}
          </div>
        )}

        {book.favoriteQuote && (
          <p className="mt-2 line-clamp-2 flex gap-1 text-xs italic text-muted">
            <Quote className="size-3 shrink-0 text-brand-purple" />
            {book.favoriteQuote}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
            <span>
              {book.pagesRead}/{book.totalPages} pages
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </div>
    </motion.div>
  );
}
