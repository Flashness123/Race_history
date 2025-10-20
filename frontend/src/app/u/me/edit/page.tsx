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

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span>✏️</span>
          Edit My Bio
        </h1>
        
        {/* Profile Image Section */}
        <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <img 
            src={`${process.env.NEXT_PUBLIC_API_BASE}${profileImageUrl}`} 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" 
            alt="Profile" 
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-3">Upload a new profile picture to represent yourself</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer shadow-md hover:shadow-lg">
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>👤</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Nationality (ISO-2)</span>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.nationality} 
                maxLength={2} 
                placeholder="e.g., DE, US, FR"
                onChange={e=>setForm(f=>({...f, nationality:e.target.value.toUpperCase()}))} 
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Place of Birth</span>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.place_of_birth} 
                placeholder="e.g., Munich, Germany"
                onChange={e=>setForm(f=>({...f, place_of_birth:e.target.value}))} 
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Date of Birth</span>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.date_of_birth} 
                onChange={e=>setForm(f=>({...f, date_of_birth:e.target.value}))} 
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Phone Number</span>
              <input 
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.phone_number} 
                placeholder="e.g., +1 234 567 8900"
                onChange={e=>setForm(f=>({...f, phone_number:e.target.value}))} 
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Email Address</span>
              <input 
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.email} 
                placeholder="your.email@example.com"
                onChange={e=>setForm(f=>({...f, email:e.target.value}))} 
              />
            </label>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>🌐</span>
            Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>📷</span>
                Instagram
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  value={form.instagram} 
                  placeholder="username"
                  onChange={e=>setForm(f=>({...f, instagram:e.target.value}))} 
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>📘</span>
                Facebook
              </span>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.facebook} 
                placeholder="facebook.com/username"
                onChange={e=>setForm(f=>({...f, facebook:e.target.value}))} 
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>📺</span>
                YouTube
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  value={form.youtube} 
                  placeholder="channelname"
                  onChange={e=>setForm(f=>({...f, youtube:e.target.value}))} 
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>🎵</span>
                TikTok
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  value={form.tiktok} 
                  placeholder="username"
                  onChange={e=>setForm(f=>({...f, tiktok:e.target.value}))} 
                />
              </div>
            </label>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>💬</span>
            Message to Riders
          </h2>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Share a message with the racing community</span>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
              value={form.message} 
              placeholder="Tell other riders about yourself, your racing philosophy, or any advice you'd like to share..."
              onChange={e=>setForm(f=>({...f, message:e.target.value}))} 
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600">
            All fields are optional. Fill in what you're comfortable sharing.
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Status Messages */}
      {ok && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{ok}</span>
          </div>
        </div>
      )}
      {err && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{err}</span>
          </div>
        </div>
      )}
    </main>
  );
}
