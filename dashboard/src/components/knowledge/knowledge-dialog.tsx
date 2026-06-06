"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Video, ImageOff, Plus, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Category, KnowledgeEntry } from "@/lib/types";
import { getYouTubeId, youTubeThumbnail, isYouTubeUrl } from "@/lib/youtube";

const CATEGORIES: Category[] = [
  "Technology",
  "Productivity",
  "Business",
  "Science",
  "Philosophy",
  "Finance",
  "Design",
  "Health",
];

const DEFAULT_THUMB =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80";

interface KnowledgeDialogProps {
  /** When provided, edits this entry; otherwise creates a new one. */
  entry?: KnowledgeEntry;
  onSave: (entry: KnowledgeEntry) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KnowledgeDialog({
  entry,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: KnowledgeDialogProps) {
  const isEdit = !!entry;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (o: boolean) => {
    if (isControlled) onOpenChange?.(o);
    else setInternalOpen(o);
  };

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState<Category>("Technology");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState("0");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (open && entry) {
      setTitle(entry.title);
      setLink(entry.sourceLink ?? "");
      setCategory(entry.category);
      setTags(entry.tags.join(", "));
      setNotes(entry.notes);
      setProgress(String(entry.progress));
      setImgError(false);
    }
  }, [open, entry]);

  // Derive YouTube id + thumbnail live from the link.
  const videoId = useMemo(() => getYouTubeId(link), [link]);
  const ytThumbnail = videoId ? youTubeThumbnail(videoId, "hq") : null;
  // In edit mode, fall back to the existing thumbnail if the link isn't YouTube.
  const previewThumb = ytThumbnail ?? (isEdit ? entry?.thumbnail ?? null : null);

  const reset = () => {
    setTitle("");
    setLink("");
    setCategory("Technology");
    setTags("");
    setNotes("");
    setProgress("0");
    setImgError(false);
  };

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const isYt = isYouTubeUrl(link) || !!videoId;
    const next: KnowledgeEntry = {
      id: entry?.id ?? `k-${Date.now()}`,
      title: title.trim(),
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sourceType: isYt ? "youtube" : link ? "article" : entry?.sourceType ?? "note",
      sourceLink: link.trim() || undefined,
      notes: notes.trim(),
      dateLearned: entry?.dateLearned ?? new Date().toISOString().slice(0, 10),
      progress: Math.min(100, Math.max(0, parseInt(progress, 10) || 0)),
      revisionStatus: entry?.revisionStatus ?? "fresh",
      lastReviewed: entry?.lastReviewed ?? new Date().toISOString().slice(0, 10),
      nextReview:
        entry?.nextReview ?? new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
      retention: entry?.retention ?? 50,
      thumbnail: ytThumbnail ?? entry?.thumbnail ?? DEFAULT_THUMB,
    };
    onSave(next);
    if (!isEdit) reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && !isEdit) reset();
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="size-4" /> Add entry
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit knowledge entry" : "Add knowledge entry"}</DialogTitle>
          <DialogDescription>
            Paste a YouTube link and the thumbnail becomes the cover automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
              <Video className="size-3.5 text-rose-400" /> YouTube link or source URL
            </label>
            <Input
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setImgError(false);
              }}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border border-card-border bg-[var(--surface)]">
            {previewThumb && !imgError ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumb}
                  alt="Cover preview"
                  className="size-full object-cover"
                  onError={() => setImgError(true)}
                />
                {ytThumbnail && (
                  <Badge variant="red" className="absolute left-2 top-2">
                    <Video className="size-3" /> Thumbnail
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <ImageOff className="size-6" />
                <p className="text-xs">
                  {link && !videoId
                    ? "Not a valid YouTube link — a default cover will be used"
                    : "Thumbnail preview appears here"}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How Transformers Actually Work"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, deep-learning"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Mastery %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key takeaways..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit ? (
              <>
                <Save className="size-4" /> Save changes
              </>
            ) : (
              <>
                <Plus className="size-4" /> Add entry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
