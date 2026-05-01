"use client";
import { useState } from "react";
import Link from "next/link";

interface ClickableRiderNameProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function ClickableRiderName({ name, className = "", style, children }: ClickableRiderNameProps) {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Get all riders to find the matching one
      const res = await fetch("/api/bio/riders/all", { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to fetch riders");
        return;
      }
      
      const riders = await res.json();
      const rider = riders.find((r: any) => r.name === name);
      
      if (!rider) {
        console.error("Rider not found:", name);
        return;
      }
      
      // Determine the correct URL based on registration status
      let url: string;
      if (rider.is_registered && rider.user_id) {
        url = `/riders/${rider.user_id}`;
      } else {
        url = `/riders/person/${rider.person_id}`;
      }
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error getting rider profile URL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600 cursor-pointer'} transition-colors duration-200`}
      style={style}
      title={`View ${name}'s profile`}
    >
      {children || name}
      {loading && <span className="ml-1 text-xs">⏳</span>}
    </button>
  );
}
