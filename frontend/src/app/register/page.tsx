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
    <main className="min-h-screen bg-gradient-to-br from-[#faf6f1] via-white to-[#f4ece3] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Register to submit events and connect your rider profile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200"
                type="password"
                placeholder="Choose a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {ok && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{ok}</p>
              </div>
            )}

            {err && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-semibold">!</span>
                  </div>
                  <p className="text-red-800 text-sm font-medium">{err}</p>
                </div>
              </div>
            )}

            <button className="warm-button w-full px-6 py-3 font-semibold hover-lift" type="submit">
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="warm-link font-medium hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
