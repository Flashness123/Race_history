"use client";
import { useEffect, useMemo, useState } from "react";

type RiderSuggestion = {
  name: string;
  country: string | null;
  achievements_count: number;
};

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
      setNameSuggestions([]);
      setLoadingSuggestions(false);
      setNameSuggestionError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      setNameSuggestionError(null);

      try {
        const res = await fetch(
          `/api/bio/riders/search?q=${encodeURIComponent(trimmedName)}&limit=3`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          setNameSuggestions([]);
          setNameSuggestionError("Could not load rider suggestions right now.");
          return;
        }

        const data = await res.json();
        const suggestions = Array.isArray(data) ? data : [];
        setNameSuggestions(
          suggestions.filter((suggestion: RiderSuggestion) => {
            const normalizedSuggestion = suggestion.name
              .toLowerCase()
              .replace(/\s+/g, " ");
            return normalizedSuggestion !== normalizedTypedName;
          })
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        setNameSuggestions([]);
        setNameSuggestionError("Could not load rider suggestions right now.");
      } finally {
        setLoadingSuggestions(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [normalizedTypedName, trimmedName]);

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
        <div className="grid gap-2">
          <input
            className="border rounded p-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {trimmedName.length >= 2 && (
            <div className="rounded border bg-gray-50 p-3 text-sm">
              <p className="text-xs text-gray-600">
                Choose the exact rider name from existing achievements to link old results to your profile.
              </p>
              {loadingSuggestions ? (
                <p className="mt-2 text-xs text-gray-500">Looking for similar rider names...</p>
              ) : nameSuggestions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {nameSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.name}-${suggestion.country ?? "xx"}`}
                      type="button"
                      className="rounded border bg-white px-3 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, name: suggestion.name }));
                        setNameSuggestions([]);
                        setNameSuggestionError(null);
                      }}
                    >
                      <div className="font-medium text-gray-900">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">
                        {suggestion.achievements_count} achievement{suggestion.achievements_count === 1 ? "" : "s"}
                        {suggestion.country ? ` • ${suggestion.country}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  No close achievement names found. You can still keep typing your own name.
                </p>
              )}
              {nameSuggestionError && (
                <p className="mt-2 text-xs text-red-600">{nameSuggestionError}</p>
              )}
            </div>
          )}
        </div>
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
