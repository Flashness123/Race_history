export type CategoryFilters = {
  SPOT: boolean;
  WDSC: boolean;
  EURO: boolean;
  FREERIDE: boolean;
  IDF: boolean;
  OUTLAW: boolean;
  NATIONAL: boolean;
  RACE: boolean;
};

export type DateFilterMode = "all" | "future" | "past";

type FeatureLike = {
  properties?: {
    category?: string | null;
    all_categories?: string | null;
    date_from?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type FeatureCollectionLike = {
  type?: string;
  features?: FeatureLike[];
  [key: string]: unknown;
};

export function getFeatureCategories(properties: FeatureLike["properties"]): string[] {
  if (properties?.all_categories) {
    try {
      const parsed = JSON.parse(properties.all_categories);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((category): category is string => typeof category === "string");
      }
    } catch {
      // Fall back to the single category field below.
    }
  }

  return [properties?.category || "WDSC"];
}

export function matchesDateFilter(
  properties: FeatureLike["properties"],
  dateFilter: DateFilterMode
): boolean {
  if (dateFilter === "all") {
    return true;
  }

  const categories = getFeatureCategories(properties);
  if (categories.includes("SPOT")) {
    return true;
  }

  const rawDate = properties?.date_from;
  if (!rawDate) {
    return false;
  }

  const match = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return false;
  }

  const startDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isFuture = startDate.getTime() >= today.getTime();
  return dateFilter === "future" ? isFuture : !isFuture;
}

export function getFilteredFeature(
  feature: FeatureLike,
  filters?: CategoryFilters,
  dateFilter: DateFilterMode = "all"
) {
  const properties = feature.properties ?? {};
  const categories = getFeatureCategories(properties);

  const categoryVisible = !filters
    ? true
    : categories.some((category) => Boolean(filters[category as keyof CategoryFilters]));

  if (!categoryVisible || !matchesDateFilter(properties, dateFilter)) {
    return null;
  }

  const displayCategory = filters
    ? categories.find((category) => Boolean(filters[category as keyof CategoryFilters])) || categories[0]
    : categories[0];

  return {
    ...feature,
    properties: {
      ...properties,
      display_category: displayCategory || properties.category || "WDSC",
    },
  };
}

export function getFilteredGeojson(
  geojson: FeatureCollectionLike,
  filters?: CategoryFilters,
  dateFilter: DateFilterMode = "all"
): FeatureCollectionLike {
  return {
    ...geojson,
    type: "FeatureCollection",
    features: (geojson.features ?? [])
      .map((feature) => getFilteredFeature(feature, filters, dateFilter))
      .filter((feature): feature is NonNullable<typeof feature> => feature !== null),
  };
}
