"use client";
import { useEffect, useState } from "react";

// Mapping categories to background images
const CATEGORY_IMAGES = {
  WDSC: '/backgrounds/wdsc.jpg',
  EURO: '/backgrounds/go_skate.jpg', // European events
  FREERIDE: '/backgrounds/gioasteka.jpg', // Freeride/freestyle events  
  IDF: '/backgrounds/idf.jpg',
  SPOT: '/backgrounds/sornetan_race.jpg', // Spots/locations
  OUTLAW: '/backgrounds/outlaw.jpg',
  NATIONAL: '/backgrounds/national_champ.jpg', // National championships
  RACE: '/backgrounds/race.jpg' // General racing
} as const;

// Additional images that could be used for rotation or special events
const ADDITIONAL_IMAGES = [
  '/backgrounds/knk.jpg',
  '/backgrounds/knk_redbull.jpg', 
  '/backgrounds/luge.jpg'
];

const DEFAULT_IMAGE = '/backgrounds/race.jpg'; // Default fallback

interface DynamicBackgroundProps {
  filters: {
    WDSC: boolean;
    EURO: boolean;
    FREERIDE: boolean;
    IDF: boolean;
    SPOT: boolean;
    OUTLAW: boolean;
    NATIONAL: boolean;
    RACE: boolean;
  };
}

export default function DynamicBackground({ filters }: DynamicBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get active categories and their corresponding images
  const activeCategories = Object.entries(filters)
    .filter(([_, isActive]) => isActive)
    .map(([category]) => category as keyof typeof CATEGORY_IMAGES);
  
  const activeImages = activeCategories.map(category => CATEGORY_IMAGES[category]);
  
  // Use default image if no categories are active
  const imagesToShow = activeImages.length > 0 ? activeImages : [DEFAULT_IMAGE];
  
  // Auto-rotate images when multiple are active
  useEffect(() => {
    if (imagesToShow.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % imagesToShow.length);
    }, 4000); // Change every 4 seconds
    
    return () => clearInterval(interval);
  }, [imagesToShow.length]);
  
  const currentImage = imagesToShow[currentImageIndex] || DEFAULT_IMAGE;
  
  return (
    <div 
      className="fixed inset-0 transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url(${currentImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1
      }}
    >
      {/* Overlay for better content readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Subtle gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
      
      {/* Category indicator for multiple images */}
      {imagesToShow.length > 1 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex gap-1">
            {imagesToShow.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}