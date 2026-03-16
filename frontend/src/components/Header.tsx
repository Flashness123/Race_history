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
    <header className="sticky top-0 z-50 border-b border-[var(--warm-border)] bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-[#201814] to-[#6d5d51] bg-clip-text text-transparent group-hover:from-[var(--warm-accent)] group-hover:to-[var(--warm-accent-dark)] transition-all duration-300">
            Downhill Radar
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
            Map
          </Link>
          <Link href="/media" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
            Media
          </Link>
          <Link href="/submit" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
            Submit
          </Link>
          {me.authenticated && (me.user?.role === "ADMIN" || me.user?.role === "OWNER") && (
            <Link href="/admin" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
              Admin
            </Link>
          )}
          {me.authenticated && (
            <Link href="/u/me" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
              My Bio
            </Link>
          )}
          <Link href="/riders" className="px-4 py-2 text-sm font-medium text-[var(--warm-muted)] hover:text-[var(--warm-accent-dark)] hover:bg-[var(--warm-accent-soft)] rounded-lg transition-all duration-200 hover-lift">
            Riders
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {!me.authenticated ? (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="warm-button-secondary px-4 py-2 text-sm font-medium hover-lift"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="warm-button px-4 py-2 text-sm font-medium hover-lift"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-[#faf4ee] rounded-lg border border-[var(--warm-border)]">
                <div className="w-6 h-6 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {me.user?.name ? me.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[var(--foreground)]">
                    {me.user?.name || "User"}
                  </div>
                  <div className="text-xs text-[var(--warm-muted)] capitalize">
                    {me.user?.role?.toLowerCase()}
                  </div>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="warm-button-secondary px-3 py-2 text-sm font-medium hover-lift"
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
