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
    window.location.href = "/submit";
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600">{err}</p>}
        <button className="bg-black text-white rounded p-2">Sign in</button>
      </form>
    </main>
  );
}
