"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/BrandMark";

type InboxSnapshot = {
  answers: Array<{
    id: string;
    question: string;
    answer: string;
    status: string;
    guardReason: string | null;
    confidence: number;
    citationsJson: string;
  }>;
  cards: Array<{ id: string; kind: string; title: string; body: string }>;
  stats: { grounded: number; guarded: number; total: number; cards: number; embedded: number };
  gaps: Array<{ question: string; suggestion: string; reason: string | null }>;
};

type CostSummary = {
  totalUsd: number;
  chatCalls: number;
  embeddingCalls: number;
  remainingUsd?: number;
};

type EvalSummary = {
  groundedAccuracy: number;
  citationPrecision: number;
  refusalRecall: number;
};

export function DeskClient() {
  const [inbox, setInbox] = useState<InboxSnapshot | null>(null);
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const [evaluation, setEvaluation] = useState<EvalSummary | null>(null);
  const [busy, setBusy] = useState("boot");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("faq");
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [inboxData, costData, evalData] = await Promise.all([
      fetch("/api/inbox").then((r) => r.json()),
      fetch("/api/costs").then((r) => r.json()),
      fetch("/api/eval").then((r) => r.json()),
    ]);
    if (inboxData.error) throw new Error(inboxData.error);
    setInbox(inboxData);
    setCosts(costData);
    setEvaluation(evalData);
  }, []);

  useEffect(() => {
    void load()
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setBusy(""));
  }, [load]);

  async function runEmbed() {
    setBusy("embed");
    await fetch("/api/jobs/embed", { method: "POST" });
    const tick = await fetch("/api/worker/tick?drain=1", { method: "POST" });
    const result = await tick.json().catch(() => ({ processed: 0 }));
    await load();
    setNotice(`${result.processed ?? 0} embed jobs processed.`);
    setBusy("");
  }

  async function addCard(event: FormEvent) {
    event.preventDefault();
    setBusy("card");
    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, title, body, tags: [] }),
    });
    if (response.ok) {
      setTitle("");
      setBody("");
      await load();
      setNotice("Knowledge card saved. Run embed to index it.");
    }
    setBusy("");
  }

  async function signOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/";
  }

  if (busy === "boot" || !inbox) {
    return (
      <main className="hero-mesh min-h-screen">
        <div className="mx-auto max-w-7xl space-y-5 px-5 py-8">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="hero-mesh min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <BrandLockup />
            <span className="eyebrow"><span className="muni-dot" /> Owner desk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chat" className="text-sm text-muted hover:text-muni">Chat</Link>
            <button onClick={signOut} className="text-sm text-muted hover:text-muni">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-5 py-7">
        {notice && <div className="surface p-3 text-sm text-muted">{notice}</div>}
        <section className="grid gap-3 sm:grid-cols-4">
          <div className="surface p-4"><b className="font-display text-3xl text-muni">{inbox.stats.cards}</b><p className="mono mt-1 text-[10px] uppercase tracking-widest text-muted">knowledge cards</p></div>
          <div className="surface p-4"><b className="font-display text-3xl text-muni">{inbox.stats.grounded}</b><p className="mono mt-1 text-[10px] uppercase tracking-widest text-muted">grounded answers</p></div>
          <div className="surface p-4"><b className="font-display text-3xl text-muni">${(costs?.totalUsd ?? 0).toFixed(4)}</b><p className="mono mt-1 text-[10px] uppercase tracking-widest text-muted">{(costs?.chatCalls ?? 0) + (costs?.embeddingCalls ?? 0)} tracked calls</p></div>
          <div className="surface p-4"><b className="font-display text-3xl text-muni">{evaluation ? `${(evaluation.refusalRecall * 100).toFixed(0)}%` : "..."}</b><p className="mono mt-1 text-[10px] uppercase tracking-widest text-muted">refusal recall</p></div>
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">Decision inbox</h2>
              <p className="text-sm text-muted">Grounded answers, guard refusals, and gap suggestions in one ledger.</p>
            </div>
            <button className="btn-primary" onClick={runEmbed} disabled={!!busy}>Embed knowledge</button>
          </div>
          <div className="table-wrap signal-scroll">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Citations</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inbox.answers.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.question}</b></td>
                    <td>
                      <p className="max-w-md text-sm">{row.answer}</p>
                      {row.guardReason && <p className="mt-1 text-[11px] text-danger">{row.guardReason}</p>}
                    </td>
                    <td>
                      <div className="flex max-w-52 flex-wrap gap-1">
                        {JSON.parse(row.citationsJson || "[]").map((citation: { cardId: string; title: string }) => (
                          <span key={citation.cardId} className="tag-chip !px-2 !py-1">{citation.title}</span>
                        ))}
                      </div>
                    </td>
                    <td className="mono">{row.confidence.toFixed(2)}</td>
                    <td><span className={`badge ${row.status === "grounded" ? "badge-ok" : "badge-danger"}`}>{row.status}</span></td>
                  </tr>
                ))}
                {inbox.answers.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-muted">Ask Muni in chat to fill the inbox.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="surface p-5">
            <h2 className="font-display text-xl font-semibold">Knowledge gaps</h2>
            <p className="mb-4 text-sm text-muted">Refused questions become card suggestions.</p>
            <div className="space-y-3">
              {inbox.gaps.map((gap) => (
                <div key={gap.question} className="rounded-2xl border border-line bg-canvas/50 p-4">
                  <b className="text-sm">{gap.question}</b>
                  <p className="mt-1 text-sm text-muted">{gap.suggestion}</p>
                </div>
              ))}
              {inbox.gaps.length === 0 && <p className="text-sm text-muted">No gaps yet. Force an out-of-scope question in chat.</p>}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-semibold">Add knowledge card</h2>
            <p className="mb-4 text-sm text-muted">Extend Yuan&apos;s verified persona. Replace seed facts with your real details anytime.</p>
            <form onSubmit={addCard} className="space-y-3">
              <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
                {["bio", "project", "skill", "faq", "link"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea className="input min-h-28" placeholder="Verified body" value={body} onChange={(e) => setBody(e.target.value)} required />
              <button className="btn-primary" disabled={!!busy}>Save card</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
