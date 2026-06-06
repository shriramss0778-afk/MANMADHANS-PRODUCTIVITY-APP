"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, BookOpen, ImageOff, Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { Book, BookStatus, Category } from "@/lib/types";

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

const STATUSES: BookStatus[] = ["reading", "completed", "wishlist"];

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80";

interface AddBookDialogProps {
  onAdd?: (book: Book) => void;
  onUpdate?: (book: Book) => void;
  book?: Book | null;
  trigger?: ReactNode;
}

export function AddBookDialog({ onAdd, onUpdate, book, trigger }: AddBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState("");
  const [category, setCategory] = useState("Technology");
  const [status, setStatus] = useState<BookStatus>("reading");
  const [totalPages, setTotalPages] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [imgError, setImgError] = useState(false);
  const isEdit = !!book;

  const reset = () => {
    setTitle(book?.title ?? "");
    setAuthor(book?.author ?? "");
    setCover(book?.cover ?? "");
    setCategory(book?.category ?? "Technology");
    setStatus(book?.status ?? "reading");
    setTotalPages(book ? String(book.totalPages) : "");
    setPagesRead(book ? String(book.pagesRead) : "");
    setImgError(false);
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [book, open]);

  const canSubmit =
    title.trim().length > 0 && author.trim().length > 0 && category.trim().length > 0;
  const previewCover = cover.trim() && !imgError ? cover.trim() : DEFAULT_COVER;

  const submit = () => {
    if (!canSubmit) return;
    const total = Math.max(1, parseInt(totalPages, 10) || 0) || 200;
    const readRaw = parseInt(pagesRead, 10) || 0;
    const read =
      status === "completed" ? total : Math.min(total, Math.max(0, readRaw));

    const nextBook: Book = {
      id: book?.id ?? `b-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      cover: cover.trim() || DEFAULT_COVER,
      category: category.trim(),
      status,
      totalPages: total,
      pagesRead: read,
      startedAt:
        status !== "wishlist"
          ? book?.startedAt ?? new Date().toISOString().slice(0, 10)
          : undefined,
      finishedAt:
        status === "completed"
          ? book?.finishedAt ?? new Date().toISOString().slice(0, 10)
          : undefined,
      highlights: book?.highlights ?? [],
      favoriteQuote: book?.favoriteQuote,
      rating: book?.rating,
    };
    if (isEdit) {
      onUpdate?.(nextBook);
    } else {
      onAdd?.(nextBook);
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> Add book
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit book" : "Add a book"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the cover, status, and reading progress for this book."
              : "Paste a cover image URL for the artwork, or leave it blank for a default cover."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Cover preview */}
          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-card-border bg-[var(--surface)]">
            {previewCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewCover}
                alt="Cover preview"
                className="size-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <ImageOff className="size-6" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep Work" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Author *</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Cal Newport" />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                <BookOpen className="size-3.5 text-brand-cyan" /> Cover image URL
              </label>
              <Input
                value={cover}
                onChange={(e) => {
                  setCover(e.target.value);
                  setImgError(false);
                }}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    status === s
                      ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white"
                      : "glass text-muted hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
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
            <div className="mt-3">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Add your own category"
              />
            </div>
          </div>

          {/* Pages */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Total pages</label>
              <Input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="304"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Pages read</label>
              <Input
                type="number"
                min={0}
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                placeholder="0"
                disabled={status === "wishlist"}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {isEdit ? "Save changes" : "Add book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
