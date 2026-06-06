"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function NotepadPage() {
  const {
    scratchpad,
    quickCapture,
    hydrated,
    saveScratchpad,
    addQuickCapture,
    removeQuickCapture,
  } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setTitle(scratchpad?.title ?? "");
    setContent(scratchpad?.content ?? "");
  }, [scratchpad?.title, scratchpad?.content]);

  const updateDraft = async (nextTitle: string, nextContent: string) => {
    setTitle(nextTitle);
    setContent(nextContent);
    await saveScratchpad(nextContent, nextTitle || undefined);
  };

  const clearDraft = async () => {
    setTitle("");
    setContent("");
    await saveScratchpad("", undefined);
  };

  const saveNote = async () => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    if (!trimmedContent) return;

    await addQuickCapture(trimmedContent, trimmedTitle || "Untitled note");
    await clearDraft();
  };

  const loadNote = async (savedTitle: string | undefined, savedContent: string) => {
    await updateDraft(savedTitle ?? "", savedContent);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notepad"
        subtitle="Write with a note name, save it, and reopen older notes anytime."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void clearDraft()}>
              <Trash2 className="size-4" /> Clear draft
            </Button>
            <Button onClick={() => void saveNote()} disabled={!content.trim()}>
              <Save className="size-4" /> Save note
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.85fr)]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Current draft</CardTitle>
            <p className="text-sm text-muted">
              {hydrated ? "Saved automatically while you type." : "Loading your draft..."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Note name</label>
              <Input
                value={title}
                onChange={(e) => void updateDraft(e.target.value, content)}
                placeholder="Meeting ideas, daily brain dump..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Content</label>
              <Textarea
                value={content}
                onChange={(e) => void updateDraft(title, e.target.value)}
                placeholder="Start typing..."
                className="min-h-[62vh] resize-none rounded-2xl bg-background/40 p-5 text-base leading-7 md:min-h-[70vh] lg:min-h-[calc(100vh-22rem)]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-4 text-brand-cyan" /> Saved notes
            </CardTitle>
            <p className="text-sm text-muted">Tap a saved note to load it back into the draft.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickCapture.length === 0 && (
              <p className="rounded-xl glass p-4 text-sm text-muted">No saved notes yet.</p>
            )}

            {quickCapture.map((note) => (
              <div key={note.id} className="rounded-2xl glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void loadNote(note.title, note.content)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-foreground">
                      {note.title?.trim() || "Untitled note"}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm text-muted">{note.content}</p>
                    <p className="mt-2 text-[11px] text-muted">
                      {new Date(note.updatedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => void removeQuickCapture(note.id)}
                    aria-label={`Delete ${note.title ?? "note"}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-muted transition-all hover:bg-rose-500/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
