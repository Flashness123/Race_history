"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    let res: Response;
    try {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      setErr("Registration service unavailable. Please try again.");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      // Handle both string errors and validation error arrays
      if (typeof data.detail === 'string') {
        setErr(data.detail);
      } else if (Array.isArray(data.detail)) {
        // Extract error messages from validation errors
        const errorMessages = data.detail.map((error: any) => error.msg || error.message || 'Validation error').join(', ');
        setErr(errorMessages);
      } else {
        setErr("Failed to register");
      }
      return;
    }

    setOk("Registration successful! Please log in.");
  }

  return (
    <main className="max-w-md mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          className="border rounded p-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border rounded p-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border rounded p-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-black text-white rounded p-2">Register</button>
      </form>
      {ok && <p className="text-green-600">{ok}</p>}
      {err && <p className="text-red-600">{err}</p>}
    </main>
  );
}
