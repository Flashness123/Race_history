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
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--warm-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[var(--warm-muted)]">Year:</span>
            
            {/* Left Arrow */}
            <button
              onClick={handlePreviousYears}
              className="p-2 rounded-lg text-[var(--warm-muted)] hover:bg-[var(--warm-accent-soft)] hover:text-[var(--warm-accent-dark)] transition-all duration-200 hover-lift"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                    y === selected
                      ? "bg-gradient-to-r from-[var(--warm-accent)] to-[var(--warm-accent-dark)] text-white shadow-md"
                      : "bg-[#f7f0e8] text-[var(--warm-muted)] hover:bg-[var(--warm-accent-soft)] hover:text-[var(--foreground)]"
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
              className="p-2 rounded-lg text-[var(--warm-muted)] hover:bg-[var(--warm-accent-soft)] hover:text-[var(--warm-accent-dark)] transition-all duration-200 hover-lift"
              title="Next years"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-[var(--warm-muted)]">
            <span>Navigate through years</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
