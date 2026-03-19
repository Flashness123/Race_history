"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    const res = await fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password }) });
    if (!res.ok) { setErr("Invalid email or password"); return; }
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--ink)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent)" }}>
            <span className="font-bold text-2xl" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>D</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Welcome Back</h1>
          <p style={{ color: "var(--muted)" }}>Sign in to your account to continue</p>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Email Address</label>
              <input
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Password</label>
              <input
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
              />
            </div>

            {err && (
              <div className="p-4 rounded-lg border" style={{ background: "var(--surface-raised)", borderColor: "var(--accent)", color: "var(--accent)" }}>
                <p className="text-sm font-medium">⚠ {err}</p>
              </div>
            )}

            <button
              className="w-full px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90 hover-lift"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
              type="submit"
            >
              <div className="flex items-center justify-center gap-2">
                <span>🔐</span>
                <span>Sign In</span>
              </div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Don't have an account?{" "}
              <a href="/register" className="font-medium transition-colors duration-200" style={{ color: "var(--accent)" }}>
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
