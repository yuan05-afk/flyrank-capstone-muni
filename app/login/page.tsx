"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/BrandMark";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("muni_demo_key_001");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Login failed");
      setBusy(false);
      return;
    }
    window.location.href = "/desk";
  }

  return (
    <main className="hero-mesh min-h-screen">
      <header className="border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <BrandLockup />
          <Link href="/" className="text-sm text-muted hover:text-muni">Marketing</Link>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl place-items-center px-5 pb-16">
        <form onSubmit={onSubmit} className="surface w-full max-w-md p-8">
          <BrandMark className="h-12 w-12" />
          <h1 className="font-display mt-4 text-3xl font-semibold">Owner sign in</h1>
          <p className="mt-2 text-sm text-muted">Use the demo key to open the grounded inbox and knowledge editor.</p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-muted">Demo API key</label>
          <input className="input mt-2" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <button className="btn-primary mt-5 w-full" disabled={busy}>{busy ? "Signing in..." : "Open desk"}</button>
        </form>
      </div>
    </main>
  );
}
