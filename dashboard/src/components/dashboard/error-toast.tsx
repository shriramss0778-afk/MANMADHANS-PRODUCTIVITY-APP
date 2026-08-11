"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * Surfaces failures from actions the UI does not await (toggles, autosaves,
 * drag-and-drop) so they are not lost as unhandled rejections.
 */
export function ErrorToast() {
  const { actionError, dismissActionError } = useStore();

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(dismissActionError, 8000);
    return () => clearTimeout(timer);
  }, [actionError, dismissActionError]);

  return (
    <AnimatePresence>
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 24, x: "-50%" }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed bottom-24 left-1/2 z-[70] w-[calc(100vw-2rem)] max-w-sm lg:bottom-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="glass-strong flex items-start gap-3 rounded-2xl border border-rose-500/40 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/20">
              <AlertTriangle className="size-5 text-rose-400" />
            </span>
            <p className="min-w-0 flex-1 text-sm text-foreground">{actionError}</p>
            <button
              onClick={dismissActionError}
              aria-label="Dismiss error"
              className="text-muted transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
