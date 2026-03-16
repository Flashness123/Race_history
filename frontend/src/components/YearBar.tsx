"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function YearBar({ selectedYear }: { selectedYear?: number }) {
  const searchParams = useSearchParams();
  const fallbackYear = selectedYear ?? new Date().getFullYear();
  const searchYear = Number(searchParams.get("year"));
  const selected = Number.isFinite(searchYear) ? searchYear : fallbackYear;
  
  // State for the current year range offset
  const [yearOffset, setYearOffset] = useState(0);
  
  // Calculate visible years based on offset
  const visible = [
    selected - 2 + yearOffset,
    selected - 1 + yearOffset, 
    selected + yearOffset,
    selected + 1 + yearOffset
  ];

  // Re-center the window whenever the selected year changes
  useEffect(() => {
    setYearOffset(0);
  }, [selected]);

  const handlePreviousYears = () => {
    setYearOffset(prev => prev - 1);
  };

  const handleNextYears = () => {
    setYearOffset(prev => prev + 1);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Year:</span>
            
            {/* Left Arrow */}
            <button
              onClick={handlePreviousYears}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 hover-lift"
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
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
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
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 hover-lift"
              title="Next years"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>📅</span>
            <span>Navigate through years</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
