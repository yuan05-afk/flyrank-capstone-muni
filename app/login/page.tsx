"use client";

import { FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "@/components/BrandMark";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  const reduce = useReducedMotion();
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
      <SiteHeader
        links={[
          { href: "/", label: "Marketing" },
          { href: "/chat", label: "Chat with Muni", primary: true },
        ]}
      />
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl place-items-center px-4 pb-16 sm:px-5">
        <motion.form
          onSubmit={onSubmit}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface w-full max-w-md p-6 sm:p-8"
        >
          <BrandMark className="h-12 w-12" />
          <h1 className="font-display mt-4 text-3xl font-semibold">Owner sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Use the demo key to open the grounded inbox and knowledge editor.
          </p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-muted">
            Demo API key
          </label>
          <input
            className="input mt-2"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <button className="btn-primary mt-5 w-full" disabled={busy}>
            {busy ? "Signing in..." : "Open desk"}
          </button>
        </motion.form>
      </div>
    </main>
  );
}
