"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AUDIENCE_OPENERS, type Audience } from "@/config/audience.config";
import { BrandLockup } from "@/components/BrandMark";
import { MuniMascot, type MuniState } from "@/components/MuniMascot";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  status?: string;
  citations?: Array<{ cardId: string; title: string; quote?: string }>;
};

export function ChatPanel() {
  const [audience, setAudience] = useState<Audience>("general");
  const [question, setQuestion] = useState(AUDIENCE_OPENERS.general.starter);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [muniState, setMuniState] = useState<MuniState>("wave");

  const opener = useMemo(() => AUDIENCE_OPENERS[audience], [audience]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || busy) return;
    const asked = question.trim();
    setBusy(true);
    setMuniState("listening");
    setMessages((items) => [...items, { role: "user", content: asked }]);
    setQuestion("");
    setMuniState("thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked, audience, conversationId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat failed");
      setConversationId(data.conversationId);
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content: data.answer.answer,
          status: data.answer.status,
          citations: data.citations,
        },
      ]);
      setMuniState(data.answer.status === "grounded" ? "answering" : "grounded-refuse");
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Something went wrong.",
          status: "refused",
        },
      ]);
      setMuniState("grounded-refuse");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="hero-mesh min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted hover:text-muni">Marketing</Link>
            <Link href="/login" className="btn-secondary !min-h-9 !py-1.5">Owner desk</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface p-5">
          <MuniMascot state={muniState} className="mx-auto h-36 w-36" />
          <p className="mt-3 text-center text-sm text-muted">{opener.opener}</p>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted">Audience</label>
          <select
            className="input mt-2"
            value={audience}
            onChange={(event) => {
              const next = event.target.value as Audience;
              setAudience(next);
              setQuestion(AUDIENCE_OPENERS[next].starter);
              setMuniState("wave");
            }}
          >
            {Object.entries(AUDIENCE_OPENERS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <div className="mt-4 space-y-2">
            {["What projects has Yuan shipped?", "What is Muni?", "What is Yuan's secret salary?"].map((sample) => (
              <button
                key={sample}
                type="button"
                className="btn-secondary w-full !justify-start !text-left text-sm"
                onClick={() => {
                  setQuestion(sample);
                  setMuniState("listening");
                }}
              >
                {sample}
              </button>
            ))}
          </div>
        </aside>

        <section className="surface flex min-h-[70vh] flex-col p-5">
          <div className="mb-4">
            <h1 className="font-display text-2xl font-semibold">Chat with Muni</h1>
            <p className="text-sm text-muted">Answers come from verified knowledge cards. No grounding means an honest refuse.</p>
          </div>
          <div className="signal-scroll flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-canvas/60 p-8 text-center text-sm text-muted">
                Ask about Yuan&apos;s Capstones, stack, or Muni. Try an out-of-scope question to see the guard.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-muni text-white"
                    : "bg-canvas border border-line"
                }`}
              >
                <p>{message.content}</p>
                {message.status && (
                  <span className={`badge mt-2 ${message.status === "grounded" ? "badge-ok" : "badge-danger"}`}>
                    {message.status}
                  </span>
                )}
                {!!message.citations?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <span key={citation.cardId} className="tag-chip !bg-white">{citation.title}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-4 flex gap-2">
            <input
              className="input"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setMuniState("listening");
              }}
              placeholder="Ask Muni something grounded..."
              disabled={busy}
            />
            <button className="btn-primary" disabled={busy}>{busy ? "Thinking" : "Ask"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
