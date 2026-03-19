"use client";
import Link from "next/link";
import Image from "next/image";
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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: "rgba(12,12,14,0.96)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="Downhill Radar"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-110"
          />
          <span
            className="text-2xl tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-display), cursive",
              color: "var(--paper)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--paper)")}
          >
            DOWNHILL RADAR
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Map" },
            { href: "/media", label: "Media" },
            { href: "/submit", label: "Submit" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--paper)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
          {me.authenticated && (me.user?.role === "ADMIN" || me.user?.role === "OWNER") && (
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--paper)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Admin
            </Link>
          )}
          {me.authenticated && (
            <Link
              href="/u/me"
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--paper)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              My Bio
            </Link>
          )}
          <Link
            href="/riders"
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--paper)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Riders
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {!me.authenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--paper)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                style={{ background: "var(--accent)", color: "var(--ink)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--paper)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border"
                style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)" }}
                >
                  <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>
                    {me.user?.name ? me.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium" style={{ color: "var(--paper)" }}>{me.user?.name || "User"}</div>
                  <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{me.user?.role?.toLowerCase()}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm font-medium rounded-md border transition-colors"
                style={{ color: "var(--muted)", borderColor: "var(--border)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = "#f87171";
                  (e.currentTarget as HTMLElement).style.borderColor = "#7f1d1d";
                  (e.currentTarget as HTMLElement).style.background = "rgba(127,29,29,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
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
