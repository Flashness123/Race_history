"use client";
import { useEffect, useState } from "react";

export default function EditMyBio() {
  const [form, setForm] = useState({
    nationality: "",
    place_of_birth: "",
    date_of_birth: "",
    message: "",
    phone_number: "",
    email: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: ""
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

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
        phone_number: data.phone_number || "",
        email: data.email || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        youtube: data.youtube || "",
        tiktok: data.tiktok || "",
      });
      setProfileImageUrl(data.profile_image_url || null);
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

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true); setErr(null); setOk(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads/profile-image", { method: "POST", body: formData });
    const data = await res.json();
    setUploadBusy(false);
    if (!res.ok) { setErr(data?.error || "Upload failed"); return; }
    setProfileImageUrl(data.profile_image_url);
    setOk("Profile image updated");
  }

  const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" };

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-xl shadow-lg p-8 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--paper)" }}>
          <span>✏️</span>
          Edit My Bio
        </h1>

        {/* Profile Image Section */}
        <div className="flex items-center gap-6 p-6 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE}${profileImageUrl}`}
            className="w-20 h-20 rounded-full object-cover shadow-md"
            style={{ border: "4px solid var(--border)" }}
            alt="Profile"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>Profile Picture</h3>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>Upload a new profile picture to represent yourself</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg shadow-md transition-colors duration-200 cursor-pointer" style={{ background: "var(--accent)", color: "var(--paper)" }}>
              <span>📷</span>
              <span>{uploadBusy ? "Uploading..." : "Change Profile Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                disabled={uploadBusy}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Personal Information */}
        <div className="rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>👤</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Nationality (ISO-2)</span>
              <input
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.nationality}
                maxLength={2}
                placeholder="e.g., DE, US, FR"
                onChange={e=>setForm(f=>({...f, nationality:e.target.value.toUpperCase()}))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Place of Birth</span>
              <input
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.place_of_birth}
                placeholder="e.g., Munich, Germany"
                onChange={e=>setForm(f=>({...f, place_of_birth:e.target.value}))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Date of Birth</span>
              <input
                type="date"
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.date_of_birth}
                onChange={e=>setForm(f=>({...f, date_of_birth:e.target.value}))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Phone Number</span>
              <input
                type="tel"
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.phone_number}
                placeholder="e.g., +1 234 567 8900"
                onChange={e=>setForm(f=>({...f, phone_number:e.target.value}))}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Email Address</span>
              <input
                type="email"
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.email}
                placeholder="your.email@example.com"
                onChange={e=>setForm(f=>({...f, email:e.target.value}))}
              />
            </label>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>🌐</span>
            Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📷</span>
                Instagram
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--muted)" }}>@</span>
                <input
                  className="w-full rounded-lg px-4 py-3 pl-8 focus:outline-none transition-colors"
                  style={inputStyle}
                  value={form.instagram}
                  placeholder="username"
                  onChange={e=>setForm(f=>({...f, instagram:e.target.value}))}
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📘</span>
                Facebook
              </span>
              <input
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={inputStyle}
                value={form.facebook}
                placeholder="facebook.com/username"
                onChange={e=>setForm(f=>({...f, facebook:e.target.value}))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📺</span>
                YouTube
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--muted)" }}>@</span>
                <input
                  className="w-full rounded-lg px-4 py-3 pl-8 focus:outline-none transition-colors"
                  style={inputStyle}
                  value={form.youtube}
                  placeholder="channelname"
                  onChange={e=>setForm(f=>({...f, youtube:e.target.value}))}
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>🎵</span>
                TikTok
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--muted)" }}>@</span>
                <input
                  className="w-full rounded-lg px-4 py-3 pl-8 focus:outline-none transition-colors"
                  style={inputStyle}
                  value={form.tiktok}
                  placeholder="username"
                  onChange={e=>setForm(f=>({...f, tiktok:e.target.value}))}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Message */}
        <div className="rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>💬</span>
            Message to Riders
          </h2>
          <label className="space-y-2">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Share a message with the racing community</span>
            <textarea
              className="w-full rounded-lg px-4 py-3 min-h-[120px] focus:outline-none transition-colors resize-none"
              style={inputStyle}
              value={form.message}
              placeholder="Tell other riders about yourself, your racing philosophy, or any advice you'd like to share..."
              onChange={e=>setForm(f=>({...f, message:e.target.value}))}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            All fields are optional. Fill in what you're comfortable sharing.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 font-medium rounded-lg transition-colors duration-200"
              style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "transparent" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 font-medium rounded-lg shadow-md transition-colors duration-200"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Status Messages */}
      {ok && (
        <div className="fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{ok}</span>
          </div>
        </div>
      )}
      {err && (
        <div className="fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}>
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{err}</span>
          </div>
        </div>
      )}
    </main>
  );
}
