"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Me = { authenticated: boolean; user?: { name?: string; role: "OWNER"|"ADMIN"|"USER" } };

export default function Header() {
  const [me, setMe] = useState<Me>({ authenticated: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  async function load() {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();
    setMe(data);
  }
  useEffect(() => { load(); }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close menu on Escape or outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setMe({ authenticated: false });
    setMenuOpen(false);
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/", label: "Map" },
    { href: "/media", label: "Media" },
    { href: "/submit", label: "Submit" },
    { href: "/riders", label: "Riders" },
  ];

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: "rgba(12,12,14,0.96)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.svg"
            alt="Downhill Radar"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-110"
          />
          <span
            className="hidden sm:inline text-2xl tracking-wider transition-colors"
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
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
        </nav>

        {/* Right side: desktop auth + mobile hamburger */}
        <div className="flex items-center gap-2">
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {!me.authenticated ? (
              <>
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
              </>
            ) : (
              <>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
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
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-md gap-1.5"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            style={{ color: "var(--muted)" }}
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--paper)",
                transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--paper)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--paper)",
                transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-1"
          style={{ background: "rgba(12,12,14,0.98)", borderColor: "var(--border)" }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
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
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
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
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
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

          {/* Divider + Auth */}
          <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            {!me.authenticated ? (
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors"
                  style={{ color: "var(--muted)", borderColor: "var(--border)" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ background: "var(--accent)", color: "var(--ink)" }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent)" }}
                  >
                    <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>
                      {me.user?.name ? me.user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--paper)" }}>{me.user?.name || "User"}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{me.user?.role?.toLowerCase()}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border transition-colors"
                  style={{ color: "#f87171", borderColor: "#7f1d1d", background: "rgba(127,29,29,0.15)" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
