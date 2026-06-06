"use client";

import { motion } from "framer-motion";
import {
  Video,
  BookText,
  FileText,
  GraduationCap,
  StickyNote,
  ExternalLink,
  Clock,
  Trash2,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { KnowledgeEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const sourceIcon: Record<KnowledgeEntry["sourceType"], LucideIcon> = {
  youtube: Video,
  book: BookText,
  article: FileText,
  course: GraduationCap,
  note: StickyNote,
};

const statusVariant = {
  fresh: "green",
  due: "orange",
  overdue: "red",
  mastered: "purple",
} as const;

export function KnowledgeCard({
  entry,
  index = 0,
  onDelete,
  onEdit,
}: {
  entry: KnowledgeEntry;
  index?: number;
  onDelete?: (id: string) => void;
  onEdit?: (entry: KnowledgeEntry) => void;
}) {
  const Icon = sourceIcon[entry.sourceType];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -5 }}
      className="group glass-strong glow-ring flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative h-32 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.thumbnail}
          alt={entry.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-black/50 backdrop-blur">
            <Icon className="size-4 text-white" />
          </span>
          <Badge variant="indigo">{entry.category}</Badge>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <Badge
            variant={statusVariant[entry.revisionStatus]}
            className="capitalize"
          >
            {entry.revisionStatus}
          </Badge>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(entry)}
              aria-label={`Edit ${entry.title}`}
              className="grid size-7 place-items-center rounded-lg bg-black/50 text-white/80 backdrop-blur transition-all hover:bg-brand-cyan/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan md:opacity-0 md:group-hover:opacity-100"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              aria-label={`Delete ${entry.title}`}
              className="grid size-7 place-items-center rounded-lg bg-black/50 text-white/80 backdrop-blur transition-all hover:bg-rose-500/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 md:opacity-0 md:group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold">{entry.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{entry.notes}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[11px] text-muted">
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>Mastery</span>
            <span>{entry.progress}%</span>
          </div>
          <Progress value={entry.progress} className="h-1.5" />
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Clock className="size-3" />
              {new Date(entry.dateLearned).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {entry.sourceLink && (
              <a
                href={entry.sourceLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-1 text-[11px] text-brand-cyan hover:underline",
                )}
              >
                Source <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
