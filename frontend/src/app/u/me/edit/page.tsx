"use client";
import { useEffect, useState } from "react";

export default function EditMyBio() {
  const [form, setForm] = useState({ nationality: "", place_of_birth: "", date_of_birth: "", message: "" });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/me", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Failed"); return; }
      setForm({
        nationality: data.nationality || "",
        place_of_birth: data.place_of_birth || "",
        date_of_birth: data.date_of_birth || "",
        message: data.message || "",
      });
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setOk(null); setErr(null);
    const res = await fetch("/api/bio/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data?.error || "Failed"); return; }
    setOk("Saved!");
  }

  return (
    <main className="max-w-xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Edit my bio</h1>
      <form onSubmit={save} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Nationality (ISO-2)
          <input className="border rounded p-2" value={form.nationality} maxLength={2} onChange={e=>setForm(f=>({...f, nationality:e.target.value.toUpperCase()}))} />
        </label>
        <label className="grid gap-1 text-sm">
          Place of birth
          <input className="border rounded p-2" value={form.place_of_birth} onChange={e=>setForm(f=>({...f, place_of_birth:e.target.value}))} />
        </label>
        <label className="grid gap-1 text-sm">
          Date of birth (YYYY-MM-DD)
          <input className="border rounded p-2" value={form.date_of_birth} onChange={e=>setForm(f=>({...f, date_of_birth:e.target.value}))} />
        </label>
        <label className="grid gap-1 text-sm">
          Message to riders
          <textarea className="border rounded p-2 min-h-[100px]" value={form.message} onChange={e=>setForm(f=>({...f, message:e.target.value}))} />
        </label>
        <button className="bg-black text-white rounded p-2 w-fit">Save</button>
      </form>
      {ok && <p className="text-green-700">{ok}</p>}
      {err && <p className="text-red-700">{err}</p>}
    </main>
  );
}
