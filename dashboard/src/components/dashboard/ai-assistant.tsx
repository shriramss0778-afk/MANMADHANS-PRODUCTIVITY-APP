"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "What should I review today?",
  "Summarize my week",
  "Plan my deep work block",
  "Suggest a book to finish",
];

const CANNED: Record<string, string> = {
  default:
    "You have 2 overdue knowledge cards and 3 tasks due today. I'd start with the Transformers revision while your focus is highest, then a 30-min reading sprint.",
};

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey! I'm Manmadhan AI, your learning copilot. Ask me what to focus on, or capture a quick thought.",
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: CANNED.default },
    ]);
    setInput("");
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open AI assistant"
        className="fixed bottom-24 right-3 z-50 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-neon text-white shadow-xl shadow-brand-purple/40 sm:bottom-20 sm:right-4 sm:size-14 lg:bottom-6 lg:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Bot className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-36 right-2 z-50 flex w-[min(21rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl glass-strong glow-ring max-[430px]:bottom-24 max-[430px]:max-h-[58vh] max-[430px]:rounded-[20px] sm:right-4 sm:max-h-[32rem] sm:w-[min(24rem,calc(100vw-2rem))] lg:bottom-24 lg:right-6"
          >
            <div className="flex items-center gap-2 border-b border-card-border p-3 sm:p-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple p-[2px]">
                <Image
                  src="/APP LOGO.jpeg"
                  alt="Manmadhan's Productivity"
                  width={36}
                  height={36}
                  className="size-full rounded-[9px] object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Manmadhan AI</p>
                <p className="text-[11px] text-emerald-400">• online</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
                className="ml-auto grid size-8 place-items-center rounded-lg text-muted transition hover:bg-[var(--surface)] hover:text-foreground sm:hidden"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[88%] break-words rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-brand-indigo to-brand-purple text-white"
                      : "glass text-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:bg-[var(--surface)] hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-card-border p-3"
            >
              <Button type="button" variant="ghost" size="icon" aria-label="Quick capture">
                <NotebookPen className="size-[18px]" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or capture..."
                className="flex-1"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send className="size-[18px]" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
