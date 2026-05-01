"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function YearBar({ selectedYear }: { selectedYear?: number }) {
  const searchParams = useSearchParams();
  const fallbackYear = selectedYear ?? new Date().getFullYear();
  const searchYear = Number(searchParams.get("year"));
  const selected = Number.isFinite(searchYear) ? searchYear : fallbackYear;

  const [yearOffset, setYearOffset] = useState(0);

  const visible = [
    selected - 2 + yearOffset,
    selected - 1 + yearOffset,
    selected + yearOffset,
    selected + 1 + yearOffset,
  ];

  useEffect(() => { setYearOffset(0); }, [selected]);

  return (
    <nav
      className="sticky z-40 backdrop-blur-md border-b"
      style={{ top: "3.5rem", background: "rgba(20,20,22,0.96)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium uppercase tracking-[0.25em] mr-1"
            style={{ color: "var(--muted)" }}
          >
            Year
          </span>

          <button
            onClick={() => setYearOffset(prev => prev - 1)}
            className="p-1.5 rounded transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--paper)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            title="Previous years"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-1">
            {visible.map((y) => (
              <Link
                key={y}
                href={`/?year=${y}`}
                prefetch={false}
                className="px-4 py-1 rounded text-sm transition-colors"
                style={
                  y === selected
                    ? {
                        background: "var(--accent)",
                        color: "var(--ink)",
                        fontFamily: "var(--font-display), cursive",
                        letterSpacing: "0.08em",
                        fontSize: "1rem",
                      }
                    : { color: "var(--muted)" }
                }
              >
                {y}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setYearOffset(prev => prev + 1)}
            className="p-1.5 rounded transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--paper)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            title="Next years"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <span className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>
        </span>
      </div>
    </nav>
  );
}
