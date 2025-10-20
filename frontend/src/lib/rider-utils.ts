/**
 * Utility functions for handling rider names and profile links
 */

/**
 * Get the profile URL for a rider by their name
 * This function will determine if the rider is registered or unregistered
 * and return the appropriate URL
 */
export async function getRiderProfileUrl(riderName: string): Promise<string | null> {
  try {
    // First, try to get all riders to find the matching one
    const res = await fetch("/api/bio/riders/all", { cache: "no-store" });
    if (!res.ok) return null;
    
    const riders = await res.json();
    const rider = riders.find((r: any) => r.name === riderName);
    
    if (!rider) return null;
    
    // Return the appropriate URL based on registration status
    if (rider.is_registered && rider.user_id) {
      return `/riders/${rider.user_id}`;
    } else {
      return `/riders/person/${rider.person_id}`;
    }
  } catch (error) {
    console.error("Error getting rider profile URL:", error);
    return null;
  }
}

/**
 * Create a clickable rider name component
 * This will be used throughout the app to make rider names clickable
 */
export function createRiderNameElement(riderName: string, className?: string) {
  return {
    name: riderName,
    className: className || "font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200",
    onClick: async () => {
      const url = await getRiderProfileUrl(riderName);
      if (url) {
        window.open(url, '_blank');
      }
    }
  };
}
