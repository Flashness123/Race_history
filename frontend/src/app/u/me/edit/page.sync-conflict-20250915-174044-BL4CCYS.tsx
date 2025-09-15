"use client";
import { useEffect, useState, useRef } from "react";

export default function EditMyBio() {
  const [form, setForm] = useState({ nationality: "", place_of_birth: "", date_of_birth: "", message: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  

useEffect(() => {
  (async () => {
    const res = await fetch("/api/bio/me", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setPreview(data.profile_image_url || "/static/uploads/profiles/default_avatar.jpg");
  })();
}, []);

async function uploadProfile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/uploads/profile-image", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Upload failed");
  setPreview(json.profile_image_url);
}

  async function save(e: React.FormEvent) {
    e.preventDefault(); setOk(null); setErr(null); setSaving(true);
    const res = await fetch("/api/bio/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data?.error || "Failed"); return; }
    setOk("Saved!");
  }

  return (
    <main className="max-w-xl mx-auto p-6 grid gap-5">
      <h1 className="text-2xl font-bold">Edit my bio</h1>

      <section className="grid gap-2">
        <div className="flex items-center gap-4">
          <img src={preview || "/static/uploads/profiles/default_avatar.jpg"} alt="profile" className="w-20 h-20 rounded-full object-cover border" />
          <div className="grid gap-2 text-sm">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) uploadProfile(f).catch(err=>setErr(String(err))); }} />
            <button type="button" className="border rounded px-3 py-1" onClick={()=>fileRef.current?.click()}>Upload profile picture</button>
          </div>
        </div>
      </section>

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
        <button disabled={saving} className="bg-black text-white rounded p-2 w-fit">{saving ? "Saving…" : "Save"}</button>
      </form>
      <div className="flex items-center gap-4">
        <img src={preview || "/static/uploads/profiles/default_avatar.jpg"} className="w-20 h-20 rounded-full object-cover border" />
        <div className="grid gap-2 text-sm">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) uploadProfile(f).catch(err=>setErr(String(err))); }} />
          <button type="button" className="border rounded px-3 py-1" onClick={()=>fileRef.current?.click()}>Upload profile picture</button>
        </div>
      </div>

      {ok && <p className="text-green-700">{ok}</p>}
      {err && <p className="text-red-700">{err}</p>}
    </main>
  );
}
