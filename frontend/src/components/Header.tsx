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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            Downhill Race History
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover-lift">
            Map
          </Link>
          {me.authenticated && (
            <Link href="/submit" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover-lift">
              Submit
            </Link>
          )}
          {me.authenticated && (me.user?.role === "ADMIN" || me.user?.role === "OWNER") && (
            <Link href="/admin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover-lift">
              Admin
            </Link>
          )}
          {me.authenticated && (
            <Link href="/u/me" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover-lift">
              My Bio
            </Link>
          )}
          <Link href="/riders" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover-lift">
            Riders
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {!me.authenticated ? (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 hover-lift"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover-lift"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {me.user?.name ? me.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {me.user?.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {me.user?.role?.toLowerCase()}
                  </div>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 hover-lift"
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
