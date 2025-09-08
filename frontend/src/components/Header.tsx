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
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/" className="font-semibold">Downhill Race History</Link>
        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm hover:underline">Map</Link>
          {me.authenticated && <Link href="/submit" className="text-sm hover:underline">Submit</Link>}
          {me.authenticated && (me.user?.role === "ADMIN" || me.user?.role === "OWNER") && (
            <Link href="/admin" className="text-sm hover:underline">Admin</Link>
          )}
          {me.authenticated && <Link href="/u/me" className="text-sm hover:underline">My bio</Link>}
          {!me.authenticated ? (
            <div className="flex gap-2">
                <Link href="/login" className="px-3 py-1.5 rounded bg-black text-white text-sm">
                Sign in
                </Link>
                <Link href="/register" className="px-3 py-1.5 rounded border text-sm">
                Register
                </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {me.user?.name ? me.user.name : "Signed in"} · <b>{me.user?.role}</b>
                </span>
                <button onClick={logout} className="text-sm px-2 py-1 border rounded">Log out</button>
            </div>
          )}

        </nav>
      </div>
    </header>
  );
}
