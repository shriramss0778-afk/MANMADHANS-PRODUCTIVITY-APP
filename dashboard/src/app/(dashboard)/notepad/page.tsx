"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenText, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useStore } from "@/lib/store";

const AUTOSAVE_DELAY_MS = 450;

type DraftSnapshot = {
  title: string;
  content: string;
  updatedAt?: string;
};

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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const draftRef = useRef<DraftSnapshot>({ title: "", content: "" });
  const savedRef = useRef<DraftSnapshot>({ title: "", content: "" });
  const initializedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const remoteDraft = {
      title: scratchpad?.title ?? "",
      content: scratchpad?.content ?? "",
      updatedAt: scratchpad?.updatedAt,
    };
    const localDraft = draftRef.current;
    const hasUnsavedChanges =
      localDraft.title !== savedRef.current.title || localDraft.content !== savedRef.current.content;
    const matchesLocalDraft =
      remoteDraft.title === localDraft.title && remoteDraft.content === localDraft.content;
    const shouldHydrate =
      !initializedRef.current || matchesLocalDraft || !hasUnsavedChanges;

    if (!shouldHydrate) {
      return;
    }

    initializedRef.current = true;
    savedRef.current = remoteDraft;
    draftRef.current = remoteDraft;
    setTitle(remoteDraft.title);
    setContent(remoteDraft.content);
    setSaveState("saved");
  }, [scratchpad?.title, scratchpad?.content, scratchpad?.updatedAt]);

  useEffect(() => {
    if (!hydrated || !initializedRef.current) {
      return;
    }

    const hasChanges =
      title !== savedRef.current.title || content !== savedRef.current.content;

    if (!hasChanges) {
      setSaveState("saved");
      return;
    }

    setSaveState("saving");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const saveId = requestIdRef.current + 1;
      requestIdRef.current = saveId;
      const nextTitle = title.trim();
      const outgoingDraft = {
        title,
        content,
      };

      void saveScratchpad(content, nextTitle || undefined)
        .then((savedNote) => {
          savedRef.current = {
            title: savedNote.title ?? "",
            content: savedNote.content,
            updatedAt: savedNote.updatedAt,
          };

          if (
            draftRef.current.title === outgoingDraft.title &&
            draftRef.current.content === outgoingDraft.content &&
            saveId === requestIdRef.current
          ) {
            setSaveState("saved");
          }
        })
        .catch(() => {
          if (saveId === requestIdRef.current) {
            setSaveState("error");
          }
        });
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, hydrated, saveScratchpad, title]);

  const updateDraft = (nextTitle: string, nextContent: string) => {
    draftRef.current = { title: nextTitle, content: nextContent };
    setTitle(nextTitle);
    setContent(nextContent);
  };

  const clearDraft = () => {
    updateDraft("", "");
  };

  const saveNote = async () => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    if (!trimmedContent) return;

    await addQuickCapture(trimmedContent, trimmedTitle || "Untitled note");
    clearDraft();
  };

  const loadNote = (savedTitle: string | undefined, savedContent: string) => {
    updateDraft(savedTitle ?? "", savedContent);
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
              {!hydrated
                ? "Loading your draft..."
                : saveState === "saving"
                  ? "Saving in the background..."
                  : saveState === "error"
                    ? "Autosave paused. Keep typing and try again in a moment."
                    : "Saved automatically while you type."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Note name</label>
              <Input
                value={title}
                onChange={(e) => updateDraft(e.target.value, content)}
                placeholder="Meeting ideas, daily brain dump..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Content</label>
              <Textarea
                value={content}
                onChange={(e) => updateDraft(title, e.target.value)}
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
                    onClick={() => loadNote(note.title, note.content)}
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
