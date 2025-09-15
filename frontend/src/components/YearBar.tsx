"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function YearBar() {
  const searchParams = useSearchParams();
  const selected = Number(searchParams.get("year") ?? new Date().getFullYear());
  const now = new Date().getFullYear();
  const visible = [now - 2, now - 1, now, now + 1];

  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="overflow-x-auto whitespace-nowrap px-3 py-2 flex gap-2">
        {visible.map((y) => (
          <Link
            key={y}
            href={`/?year=${y}`}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              y === selected
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
            }`}
            prefetch={false}
          >
            {y}
          </Link>
        ))}
        <span className="ml-2 text-xs text-gray-500">Scroll for other years</span>
      </div>
    </nav>
  );
}
