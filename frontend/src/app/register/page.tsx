"use client";
import { useEffect, useMemo, useState } from "react";

type RiderSuggestion = {
  name: string;
  country: string | null;
  achievements_count: number;
};

const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" } as const;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<RiderSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [nameSuggestionError, setNameSuggestionError] = useState<string | null>(null);

  const trimmedName = form.name.trim();
  const normalizedTypedName = useMemo(
    () => trimmedName.toLowerCase().replace(/\s+/g, " "),
    [trimmedName]
  );

  useEffect(() => {
    if (trimmedName.length < 2) {
      setNameSuggestions([]); setLoadingSuggestions(false); setNameSuggestionError(null);
      return;
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true); setNameSuggestionError(null);
      try {
        const res = await fetch(
          `/api/bio/riders/search?q=${encodeURIComponent(trimmedName)}&limit=3`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) { setNameSuggestions([]); setNameSuggestionError("Could not load rider suggestions right now."); return; }
        const data = await res.json();
        const suggestions = Array.isArray(data) ? data : [];
        setNameSuggestions(suggestions.filter((s: RiderSuggestion) =>
          s.name.toLowerCase().replace(/\s+/g, " ") !== normalizedTypedName
        ));
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setNameSuggestions([]); setNameSuggestionError("Could not load rider suggestions right now.");
      } finally { setLoadingSuggestions(false); }
    }, 220);
    return () => { controller.abort(); window.clearTimeout(timeoutId); };
  }, [normalizedTypedName, trimmedName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setOk(null);
    let res: Response;
    try {
      res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { setErr("Registration service unavailable. Please try again."); return; }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (typeof data.detail === 'string') { setErr(data.detail); }
      else if (Array.isArray(data.detail)) { setErr(data.detail.map((e: any) => e.msg || 'Validation error').join(', ')); }
      else { setErr("Failed to register"); }
      return;
    }
    setOk("Registration successful! Please log in.");
  }

  return (
    <main className="max-w-md mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Register</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-2">
          <input
            className="rounded p-2"
            style={inputStyle}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {trimmedName.length >= 2 && (
            <div className="rounded p-3 text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Choose the exact rider name from existing achievements to link old results to your profile.
              </p>
              {loadingSuggestions ? (
                <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>Looking for similar rider names...</p>
              ) : nameSuggestions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {nameSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.name}-${suggestion.country ?? "xx"}`}
                      type="button"
                      className="rounded px-3 py-2 text-left transition-colors hover:opacity-80"
                      style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}
                      onClick={() => { setForm((prev) => ({ ...prev, name: suggestion.name })); setNameSuggestions([]); setNameSuggestionError(null); }}
                    >
                      <div className="font-medium" style={{ color: "var(--paper)" }}>{suggestion.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {suggestion.achievements_count} achievement{suggestion.achievements_count === 1 ? "" : "s"}
                        {suggestion.country ? ` • ${suggestion.country}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                  No close achievement names found. You can still keep typing your own name.
                </p>
              )}
              {nameSuggestionError && <p className="mt-2 text-xs" style={{ color: "var(--accent)" }}>{nameSuggestionError}</p>}
            </div>
          )}
        </div>
        <input className="rounded p-2" style={inputStyle} type="email" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="rounded p-2" style={inputStyle} type="password" placeholder="Password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="rounded p-2 font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--paper)" }}>
          Register
        </button>
      </form>
      {ok && <p style={{ color: "#4ade80" }}>{ok}</p>}
      {err && <p style={{ color: "var(--accent)" }}>{err}</p>}
    </main>
  );
}
