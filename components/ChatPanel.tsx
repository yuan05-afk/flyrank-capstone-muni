"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CHAT_OPENER,
  CHAT_STARTER,
  STARTER_SUGGESTIONS,
  type StarterSuggestion,
} from "@/config/starters.config";
import { ContactSection } from "@/components/ContactSection";
import { MuniMascot, type MuniState } from "@/components/MuniMascot";
import { MotifReflect, MotifSend } from "@/components/Motifs";
import { SiteHeader } from "@/components/SiteHeader";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: string;
  suggestions?: Array<{ label: string; question: string }>;
  pending?: boolean;
};

const CHAT_SESSION_KEY = "muni-chat-session-v3";

type ChatSession = {
  conversationId?: string;
  messages?: ChatMessage[];
};

function loadChatSession(): ChatSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatSession;
  } catch {
    return null;
  }
}

function saveChatSession(session: ChatSession) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota / private mode */
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-pulse rounded-2xl bg-line/70 ${className}`} />;
}

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s.,!?)<])/g;
const IS_URL = /^https?:\/\//;

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <p className="leading-relaxed">
      {parts.map((part, index) =>
        IS_URL.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-muni underline decoration-muni/40 underline-offset-2 hover:decoration-muni"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}

function TypingDots() {
  return (
    <span className="typing-dots" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

function SuggestionList({
  suggestions,
  busy,
  reduce,
  onPick,
  layout = "rail",
}: {
  suggestions: StarterSuggestion[];
  busy: boolean;
  reduce: boolean | null;
  onPick: (item: StarterSuggestion) => void;
  layout?: "rail" | "stage";
}) {
  return (
    <div className={layout === "stage" ? "suggestion-stage-grid" : "space-y-2"}>
      {suggestions.map((item, index) => (
        <motion.button
          key={item.question}
          type="button"
          initial={reduce ? false : { opacity: 0, y: layout === "stage" ? 10 : 0, x: layout === "rail" ? -8 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: index * 0.05 }}
          disabled={busy}
          className={`suggestion-card focus-ring ${item.kind === "refuse-demo" ? "is-refuse" : ""} ${
            layout === "stage" ? "suggestion-card--stage" : ""
          }`}
          onClick={() => onPick(item)}
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-display text-sm font-semibold text-ink">{item.label}</span>
            <span
              className={`badge shrink-0 ${
                item.kind === "refuse-demo" ? "badge-danger" : "badge-ok"
              }`}
            >
              {item.kind === "refuse-demo" ? "refuse demo" : "grounds"}
            </span>
          </span>
          <span className="mt-1 block text-left text-xs leading-relaxed text-muted">
            {item.question}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function ChatPanel() {
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(true);
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "listening" | "thinking" | "typing">("idle");
  const [muniState, setMuniState] = useState<MuniState>("wave");
  const [sessionReady, setSessionReady] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const presetHandled = useRef(false);

  const emptySuggestions = STARTER_SUGGESTIONS.slice(0, 3);
  const railSuggestions = STARTER_SUGGESTIONS;

  useEffect(() => {
    const saved = loadChatSession();
    if (saved) {
      if (saved.conversationId) setConversationId(saved.conversationId);
      if (Array.isArray(saved.messages) && saved.messages.length > 0) {
        setMessages(saved.messages.filter((message) => !message.pending));
        setMuniState("idle");
      }
    }
    setSessionReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), reduce ? 120 : 700);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  useEffect(() => {
    if (!sessionReady) return;
    saveChatSession({
      conversationId,
      messages: messages.filter((message) => !message.pending),
    });
  }, [conversationId, messages, sessionReady]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, phase, reduce]);

  function startNewChat() {
    if (busy) return;
    setConversationId(undefined);
    setMessages([]);
    setQuestion("");
    setPhase("idle");
    setMuniState("wave");
    window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    inputRef.current?.focus();
  }

  async function ask(raw: string) {
    const asked = raw.trim();
    if (!asked || busy) return;

    const userId = uid();
    const pendingId = uid();
    setBusy(true);
    setPhase("thinking");
    setMuniState("thinking");
    setQuestion("");
    setMessages((items) => [
      ...items,
      { id: userId, role: "user", content: asked },
      {
        id: pendingId,
        role: "assistant",
        content: "Muni is thinking through verified cards...",
        pending: true,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: asked,
          conversationId,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Chat failed");

      setConversationId(payload.conversationId);
      setPhase("typing");
      setMuniState(
        payload.answer.status === "grounded"
          ? "answering"
          : payload.answer.status === "open"
            ? "wave"
            : "grounded-refuse"
      );
      setMessages((items) =>
        items.map((item) =>
          item.id === pendingId
            ? {
                id: pendingId,
                role: "assistant",
                content: payload.answer.answer,
                status: payload.answer.status,
                suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
                pending: false,
              }
            : item
        )
      );
      setPhase("idle");
      if (payload.answer.status === "grounded") setMuniState("idle");
    } catch (error) {
      setMessages((items) =>
        items.map((item) =>
          item.id === pendingId
            ? {
                id: pendingId,
                role: "assistant",
                content: error instanceof Error ? error.message : "Something went wrong.",
                status: "refused",
                suggestions: [
                  {
                    label: "Studies at FEU",
                    question: "Where does Yuan go to college and what is Yuan studying?",
                  },
                  {
                    label: "Shipped Capstones",
                    question: "What Capstone projects has Yuan shipped?",
                  },
                ],
                pending: false,
              }
            : item
        )
      );
      setMuniState("grounded-refuse");
      setPhase("idle");
    } finally {
      setBusy(false);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }

  useEffect(() => {
    if (!sessionReady || busy || presetHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("q")?.trim();
    if (!preset) return;
    presetHandled.current = true;
    window.history.replaceState({}, "", "/chat");
    void ask(preset);
  }, [sessionReady, busy]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  function onSuggestion(item: StarterSuggestion) {
    if (busy) return;
    setMuniState("listening");
    void ask(item.question);
  }

  const statusLabel =
    phase === "listening"
      ? "Listening"
      : phase === "thinking"
        ? "Thinking"
        : phase === "typing"
          ? "Typing"
          : "Ready";

  if (booting) {
    return (
      <main className="hero-mesh min-h-screen">
        <SiteHeader
          links={[
            { href: "/", label: "Home" },
            { href: "/login", label: "Owner desk", primary: true },
          ]}
        />
        <div className="chat-shell mx-auto max-w-6xl px-4 sm:px-5">
          <aside className="surface space-y-4 p-5">
            <SkeletonBlock className="mx-auto h-36 w-36 !rounded-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </aside>
          <section className="surface flex min-h-[60vh] flex-col gap-4 p-5">
            <SkeletonBlock className="h-10 w-56" />
            <SkeletonBlock className="h-4 w-80 max-w-full" />
            <div className="mt-4 flex-1 space-y-3">
              <SkeletonBlock className="ml-auto h-16 w-[70%]" />
              <SkeletonBlock className="h-24 w-[78%]" />
            </div>
            <SkeletonBlock className="h-14 w-full !rounded-2xl" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="hero-mesh min-h-screen">
      <SiteHeader
        links={[
          { href: "/", label: "Home" },
          { href: "/#contact", label: "Contact" },
          { href: "/login", label: "Owner desk", primary: true },
        ]}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="chat-shell mx-auto max-w-6xl px-4 sm:px-5"
      >
        <aside className="surface chat-aside signal-scroll p-4 sm:p-5">
          <MuniMascot state={muniState} className="relative mx-auto h-32 w-32 sm:h-36 sm:w-36" />
          <div className="relative mt-3 text-center">
            <p className="font-display text-lg font-semibold">Muni</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{CHAT_OPENER}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5">
              <span className={`status-dot ${phase === "idle" ? "is-ready" : "is-live"}`} />
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {statusLabel}
              </span>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="relative z-10 mt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Try these
                </p>
                <span className="mono text-[9px] text-muted">verified asks</span>
              </div>
              <SuggestionList
                suggestions={railSuggestions}
                busy={busy}
                reduce={reduce}
                onPick={onSuggestion}
                layout="rail"
              />
            </div>
          )}

          <ContactSection compact />
        </aside>

        <section className="surface chat-main p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
            <div className="min-w-0">
              <p className="eyebrow">
                <span className="muni-dot" /> grounded desk
              </p>
              <h1 className="mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                Chat with Muni
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Answers come from verified knowledge. Weak grounding means an honest refuse.
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                className="btn-secondary !min-h-9 !py-1.5 !text-xs"
                disabled={busy}
                onClick={startNewChat}
              >
                New chat
              </button>
            )}
          </div>

          <div
            ref={scrollerRef}
            className={`signal-scroll chat-thread space-y-3 pr-1 ${
              messages.length === 0 ? "is-empty" : ""
            }`}
          >
            {messages.length === 0 && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-stage"
              >
                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl border border-line bg-fog">
                  <MotifReflect className="h-8 w-8" />
                </div>
                <p className="font-display text-sm font-semibold sm:text-base">Start with a verified ask</p>
                <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
                  Pick a prompt below, or type your own. Grounded asks stay on verified knowledge.
                  Weak grounding refuses, and that still leaves a note in Yuan&apos;s owner inbox.
                </p>
                <div className="mt-5 w-full max-w-2xl text-left">
                  <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Try these
                    </p>
                    <span className="mono text-[9px] text-muted">verified asks</span>
                  </div>
                  <SuggestionList
                    suggestions={emptySuggestions}
                    busy={busy}
                    reduce={reduce}
                    onPick={onSuggestion}
                    layout="stage"
                  />
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold text-muni hover:underline"
                    disabled={busy}
                    onClick={() => {
                      setQuestion(CHAT_STARTER);
                      inputRef.current?.focus();
                    }}
                  >
                    Or start typing from the starter question
                  </button>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "ml-auto bg-muni text-white"
                      : "border border-line bg-white"
                  }`}
                >
                  {message.pending ? (
                    <div className="flex items-center gap-3 text-muted">
                      <TypingDots />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <LinkifiedText text={message.content} />
                  )}

                  {message.status && !message.pending && (
                    <span
                      className={`badge mt-2 ${
                        message.status === "grounded"
                          ? "badge-ok"
                          : message.status === "open"
                            ? "badge-warn"
                            : message.status === "guarded"
                              ? "badge-warn"
                              : "badge-danger"
                      }`}
                    >
                      {message.status === "open" ? "hello" : message.status}
                    </span>
                  )}

                  {!message.pending &&
                    message.role === "assistant" &&
                    message.suggestions &&
                    message.suggestions.length > 0 && (
                      <div className="followup-rail mt-3">
                        <p className="mono text-[9px] uppercase tracking-[0.14em] text-muted">
                          suggested next asks
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((item) => (
                            <button
                              key={`${message.id}:${item.question}`}
                              type="button"
                              className="followup-chip focus-ring"
                              disabled={busy}
                              onClick={() => {
                                setMuniState("listening");
                                void ask(item.question);
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={onSubmit} className="composer chat-composer">
            <div className="flex items-center gap-2 px-1 pb-2">
              <span className={`status-dot ${phase === "idle" ? "is-ready" : "is-live"}`} />
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {phase === "idle"
                  ? "Muni is ready"
                  : phase === "listening"
                    ? "Muni is listening"
                    : phase === "thinking"
                      ? "Muni is thinking"
                      : "Muni is typing"}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="input !rounded-2xl !py-3"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  if (!busy) {
                    setMuniState("listening");
                    setPhase("listening");
                  }
                }}
                onBlur={() => {
                  if (!busy && !question.trim()) {
                    setPhase("idle");
                    setMuniState(messages.length > 0 ? "idle" : "wave");
                  }
                }}
                placeholder="Ask Muni something grounded..."
                disabled={busy}
              />
              <button
                className="btn-primary !min-w-[52px] !rounded-2xl !px-0 sm:!w-auto"
                disabled={busy || !question.trim()}
                aria-label="Send message"
              >
                {busy ? <TypingDots /> : <MotifSend />}
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted">
              Tip: a refused ask still leaves a note in Yuan&apos;s owner inbox as a knowledge gap.
            </p>
          </form>
        </section>
      </motion.div>
    </main>
  );
}
