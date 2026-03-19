"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <h3
                className="text-2xl tracking-wider"
                style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)" }}
              >
                DOWNHILL RADAR
              </h3>
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--muted)" }}>
              Track and discover downhill longboard races around the world.
              Submit races, view results, and connect with the community of passionate riders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="tracking-widest mb-4 text-lg"
              style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)" }}
            >
              QUICK LINKS
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Map" },
                { href: "/riders", label: "Riders" },
                { href: "/submit", label: "Submit Race" },
                { href: "/login", label: "Sign In" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm flex items-center gap-2 group transition-colors"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    <span
                      className="h-px transition-all"
                      style={{ width: "12px", background: "var(--border)" }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3
              className="tracking-widest mb-4 text-lg"
              style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)" }}
            >
              INFO
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm flex items-center gap-2 group transition-colors"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    <span
                      className="h-px transition-all"
                      style={{ width: "12px", background: "var(--border)" }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © 2024 Downhill Radar. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--paper)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--paper)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
