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
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf6f1] via-white to-[#f4ece3] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--warm-accent)] to-[var(--warm-accent-dark)] bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required
              />
            </div>
            
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
            
            <button 
              className="warm-button w-full px-6 py-3 font-semibold hover-lift"
              type="submit"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="warm-link font-medium transition-colors duration-200">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
