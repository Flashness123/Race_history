"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function YearBar() {
  const searchParams = useSearchParams();
  const selected = Number(searchParams.get("year") ?? new Date().getFullYear());
  const now = new Date().getFullYear();
  
  // State for the current year range offset
  const [yearOffset, setYearOffset] = useState(0);
  
  // Calculate visible years based on offset
  const visible = [
    now - 2 + yearOffset,
    now - 1 + yearOffset, 
    now + yearOffset,
    now + 1 + yearOffset
  ];

  // Initialize offset to center the current year when component mounts
  useEffect(() => {
    // Only set initial offset if no year is selected (use current year)
    if (!searchParams.get("year")) {
      setYearOffset(0);
    }
  }, [searchParams]);

  const handlePreviousYears = () => {
    setYearOffset(prev => prev - 1);
  };

  const handleNextYears = () => {
    setYearOffset(prev => prev + 1);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(248,242,234,0.72)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="eyebrow">Season</span>
            
            {/* Left Arrow */}
            <button
              onClick={handlePreviousYears}
              className="button-soft h-10 w-10 p-0 text-[var(--ink-soft)]"
              title="Previous years"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Year Buttons */}
            <div className="flex space-x-1">
              {visible.map((y) => (
                <Link
                  key={y}
                  href={`/?year=${y}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    y === selected
                      ? "bg-[var(--accent)] text-[var(--paper-strong)] shadow-[0_18px_30px_rgba(24,19,15,0.12)]"
                      : "border border-[var(--border)] bg-white/50 text-[var(--ink-soft)] hover:bg-white/75 hover:text-[var(--ink)]"
                  }`}
                  prefetch={false}
                >
                  {y}
                </Link>
              ))}
            </div>
            
            {/* Right Arrow */}
            <button
              onClick={handleNextYears}
              className="button-soft h-10 w-10 p-0 text-[var(--ink-soft)]"
              title="Next years"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="hidden items-center space-x-2 text-xs text-[var(--muted)] md:flex">
            <span className="eyebrow text-[10px]">Navigate years</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
