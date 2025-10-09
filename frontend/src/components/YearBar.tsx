"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function YearBar() {
  const searchParams = useSearchParams();
  const selected = Number(searchParams.get("year") ?? new Date().getFullYear());
  const now = new Date().getFullYear();
  const visible = [now - 2, now - 1, now, now + 1];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Year:</span>
            <div className="flex space-x-1">
              {visible.map((y) => (
                <Link
                  key={y}
                  href={`/?year=${y}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                    y === selected
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                  prefetch={false}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>📅</span>
            <span>Scroll for other years</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
