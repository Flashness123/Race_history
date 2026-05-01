"use client";
import { useState } from "react";

const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" } as const;
const cardStyle = { background: "var(--surface)", borderColor: "var(--border)" } as const;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--ink)" }}>
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border p-8" style={cardStyle}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <span className="text-3xl" style={{ color: "var(--accent)" }}>✓</span>
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Message Sent!</h1>
            <p className="mb-8" style={{ color: "var(--muted)" }}>
              Thank you for your message. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              className="w-full px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              Send Another Message
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--accent)" }}>
            <span className="font-bold text-3xl">📧</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
            Have questions about the platform? Want to submit a race or report an issue? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-6" style={cardStyle}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Get in Touch</h2>
              <div className="space-y-6">
                {[
                  { icon: "💬", title: "General Inquiries", desc: "For general questions about the platform" },
                  { icon: "🏁", title: "Race Submissions", desc: "Submit races through the platform or contact us for bulk submissions" },
                  { icon: "🔧", title: "Technical Support", desc: "Report bugs or request new features" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--paper)" }}>{item.title}</h3>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border p-8" style={cardStyle}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Name</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                      placeholder="Your full name" value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                      placeholder="your.email@example.com" value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Subject</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                    placeholder="What's this about?" value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Message</label>
                  <textarea required rows={6} className="w-full px-4 py-3 rounded-lg resize-none" style={inputStyle}
                    placeholder="Tell us more about your inquiry..."
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))} />
                </div>

                <button type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "var(--accent)", color: "var(--paper)" }}>
                  <div className="flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--paper)", borderTopColor: "transparent" }} />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <><span>📤</span><span>Send Message</span></>
                    )}
                  </div>
                </button>
                {error && (
                  <p className="text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
