"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";

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

function parseCitations(raw: string) {
  try {
    return JSON.parse(raw || "[]") as Array<{ cardId: string; title: string }>;
  } catch {
    return [];
  }
}

export function DeskClient() {
  const reduce = useReducedMotion();
  const [inbox, setInbox] = useState<InboxSnapshot | null>(null);
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const [evaluation, setEvaluation] = useState<EvalSummary | null>(null);
  const [busy, setBusy] = useState("boot");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("faq");
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (options?: { includeEval?: boolean }) => {
    const includeEval = options?.includeEval !== false;
    const [inboxData, costData] = await Promise.all([
      fetch("/api/inbox").then((r) => r.json()),
      fetch("/api/costs").then((r) => r.json()),
    ]);
    if (inboxData.error) throw new Error(inboxData.error);
    setInbox(inboxData);
    setCosts(costData);

    // Full live eval runs 5 chat rounds and is too slow for desk boot on Vercel.
    // Load it after the inbox paints so the owner desk never waits on it.
    if (includeEval) {
      void fetch("/api/eval")
        .then((r) => r.json())
        .then((evalData) => {
          if (!evalData?.error && typeof evalData.refusalRecall === "number") {
            setEvaluation(evalData);
          }
        })
        .catch(() => {
          /* keep prior eval metrics */
        });
    }
  }, []);

  useEffect(() => {
    void load({ includeEval: true })
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
    await load({ includeEval: false });
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
      await load({ includeEval: false });
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
        <SiteHeader links={[{ href: "/chat", label: "Chat" }, { href: "/", label: "Marketing" }]} />
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-5">
          <div className="skeleton-pulse h-10 w-64 rounded-xl" />
          <div className="skeleton-pulse h-[420px] rounded-2xl" />
        </div>
      </main>
    );
  }

  const stats = [
    [String(inbox.stats.cards), "knowledge cards"],
    [String(inbox.stats.grounded), "grounded answers"],
    [`$${(costs?.totalUsd ?? 0).toFixed(4)}`, `${(costs?.chatCalls ?? 0) + (costs?.embeddingCalls ?? 0)} tracked calls`],
    [evaluation ? `${(evaluation.refusalRecall * 100).toFixed(0)}%` : "...", "refusal recall"],
  ] as const;

  return (
    <main className="hero-mesh min-h-screen">
      <SiteHeader
        links={[
          { href: "/chat", label: "Chat" },
          { label: "Sign out", onClick: () => void signOut() },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-5 sm:py-7">
        {notice && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface p-3 text-sm text-muted"
          >
            {notice}
          </motion.div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([value, label], index) => (
            <motion.div
              key={label}
              className="surface p-4"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <b className="font-display text-3xl text-muni">{value}</b>
              <p className="mono mt-1 text-[10px] uppercase tracking-widest text-muted">{label}</p>
            </motion.div>
          ))}
        </section>

        <section className="surface p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">
                <span className="muni-dot" /> Owner desk
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">Decision inbox</h2>
              <p className="text-sm text-muted">
                Grounded answers, guard refusals, and gap suggestions in one ledger.
              </p>
            </div>
            <button className="btn-primary" onClick={runEmbed} disabled={!!busy}>
              Embed knowledge
            </button>
          </div>

          <div className="table-wrap signal-scroll desk-table">
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
                    <td>
                      <b>{row.question}</b>
                    </td>
                    <td>
                      <p className="max-w-md text-sm">{row.answer}</p>
                      {row.guardReason && (
                        <p className="mt-1 text-[11px] text-danger">{row.guardReason}</p>
                      )}
                    </td>
                    <td>
                      <div className="flex max-w-52 flex-wrap gap-1">
                        {parseCitations(row.citationsJson).map((citation) => (
                          <span key={citation.cardId} className="tag-chip !px-2 !py-1">
                            {citation.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="mono">{row.confidence.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === "grounded"
                            ? "badge-ok"
                            : row.status === "open" || row.status === "guarded"
                              ? "badge-warn"
                              : "badge-danger"
                        }`}
                      >
                        {row.status === "open" ? "hello" : row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {inbox.answers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted">
                      Ask Muni in chat to fill the inbox.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="desk-cards">
            {inbox.answers.map((row) => (
              <article key={row.id} className="rounded-2xl border border-line bg-canvas/50 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <b className="text-sm">{row.question}</b>
                  <span
                    className={`badge shrink-0 ${
                      row.status === "grounded"
                        ? "badge-ok"
                        : row.status === "open" || row.status === "guarded"
                          ? "badge-warn"
                          : "badge-danger"
                    }`}
                  >
                    {row.status === "open" ? "hello" : row.status}
                  </span>
                </div>
                <p className="text-sm text-muted">{row.answer}</p>
                {row.guardReason && <p className="mt-2 text-[11px] text-danger">{row.guardReason}</p>}
                <div className="mt-3 flex flex-wrap gap-1">
                  {parseCitations(row.citationsJson).map((citation) => (
                    <span key={citation.cardId} className="tag-chip !px-2 !py-1">
                      {citation.title}
                    </span>
                  ))}
                  <span className="mono text-[10px] text-muted">conf {row.confidence.toFixed(2)}</span>
                </div>
              </article>
            ))}
            {inbox.answers.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
                Ask Muni in chat to fill the inbox.
              </p>
            )}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="surface p-4 sm:p-5">
            <h2 className="font-display text-xl font-semibold">Knowledge gaps</h2>
            <p className="mb-4 text-sm text-muted">Refused questions become card suggestions.</p>
            <div className="space-y-3">
              {inbox.gaps.map((gap) => (
                <div key={gap.question} className="rounded-2xl border border-line bg-canvas/50 p-4">
                  <b className="text-sm">{gap.question}</b>
                  <p className="mt-1 text-sm text-muted">{gap.suggestion}</p>
                </div>
              ))}
              {inbox.gaps.length === 0 && (
                <p className="text-sm text-muted">No gaps yet. Force an out-of-scope question in chat.</p>
              )}
            </div>
          </section>

          <section className="surface p-4 sm:p-5">
            <h2 className="font-display text-xl font-semibold">Add knowledge card</h2>
            <p className="mb-4 text-sm text-muted">
              Extend Yuan&apos;s verified persona. Replace seed facts with your real details anytime.
            </p>
            <form onSubmit={addCard} className="space-y-3">
              <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
                {["bio", "project", "skill", "faq", "link"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="input min-h-28"
                placeholder="Verified body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <button className="btn-primary" disabled={!!busy}>
                Save card
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
