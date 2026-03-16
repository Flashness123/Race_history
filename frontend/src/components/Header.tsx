"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { authenticated: boolean; user?: { name?: string; role: "OWNER"|"ADMIN"|"USER" } };

export default function Header() {
  const [me, setMe] = useState<Me>({ authenticated: false });

  async function load() {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();
    setMe(data);
  }
  useEffect(() => { load(); }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setMe({ authenticated: false });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(248,242,234,0.78)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--paper-strong)]">
            DR
          </div>
          <span className="text-xl font-semibold tracking-[-0.05em] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent-warm)]">
            Downhill Radar
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
            Map
          </Link>
          <Link href="/media" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
            Media
          </Link>
          <Link href="/submit" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
            Submit
          </Link>
          {me.authenticated && (me.user?.role === "ADMIN" || me.user?.role === "OWNER") && (
            <Link href="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
              Admin
            </Link>
          )}
          {me.authenticated && (
            <Link href="/u/me" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
              My Bio
            </Link>
          )}
          <Link href="/riders" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition-all duration-200 hover:bg-white/60 hover:text-[var(--ink)]">
            Riders
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {!me.authenticated ? (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="button-soft px-4 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="button-ink px-4 py-2 text-sm font-medium"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3 rounded-full border border-[var(--border)] bg-white/50 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--paper-strong)]">
                  <span>
                    {me.user?.name ? me.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[var(--ink)]">
                    {me.user?.name || "User"}
                  </div>
                  <div className="eyebrow text-[10px] capitalize tracking-[0.18em]">
                    {me.user?.role?.toLowerCase()}
                  </div>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="button-soft px-4 py-2 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
