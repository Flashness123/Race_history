"use client";
import { useEffect, useMemo, useState } from "react";

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

const DEFAULT_IMAGE = '/backgrounds/race.jpg'; // Default fallback
const loadedImages = new Set<string>();

function preloadImage(src: string) {
  if (typeof window === "undefined" || loadedImages.has(src)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      loadedImages.add(src);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

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
  const [layerImages, setLayerImages] = useState<[string, string]>([
    DEFAULT_IMAGE,
    DEFAULT_IMAGE,
  ]);
  const [visibleLayer, setVisibleLayer] = useState(0);
  
  // Get active categories and their corresponding images
  const activeCategories = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, isActive]) => isActive)
        .map(([category]) => category as keyof typeof CATEGORY_IMAGES),
    [filters]
  );

  const activeImages = useMemo(
    () => activeCategories.map((category) => CATEGORY_IMAGES[category]),
    [activeCategories]
  );

  // Use default image if no categories are active
  const imagesToShow = useMemo(
    () => (activeImages.length > 0 ? activeImages : [DEFAULT_IMAGE]),
    [activeImages]
  );
  const imagesKey = useMemo(() => imagesToShow.join("|"), [imagesToShow]);
  
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
  }, [imagesKey, imagesToShow.length]);

  useEffect(() => {
    if (currentImageIndex < imagesToShow.length) return;
    setCurrentImageIndex(0);
  }, [currentImageIndex, imagesToShow.length]);

  useEffect(() => {
    imagesToShow.forEach((image) => {
      void preloadImage(image);
    });
  }, [imagesToShow]);

  useEffect(() => {
    const targetImage = imagesToShow[currentImageIndex] || DEFAULT_IMAGE;
    const currentVisibleImage = layerImages[visibleLayer];
    if (targetImage === currentVisibleImage) return;

    let cancelled = false;
    const hiddenLayer = visibleLayer === 0 ? 1 : 0;

    void preloadImage(targetImage).then(() => {
      if (cancelled) return;

      setLayerImages((previous) => {
        const next = [...previous] as [string, string];
        next[hiddenLayer] = targetImage;
        return next;
      });

      requestAnimationFrame(() => {
        if (!cancelled) {
          setVisibleLayer(hiddenLayer);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [currentImageIndex, imagesToShow, layerImages, visibleLayer]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[900ms] ease-in-out ${
          visibleLayer === 0 ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${layerImages[0]})` }}
      />
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[900ms] ease-in-out ${
          visibleLayer === 1 ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${layerImages[1]})` }}
      />

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
