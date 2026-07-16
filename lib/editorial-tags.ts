export const editorialTags = [
  "Baking",
  "Chicken",
  "City notes",
  "Comfort",
  "Dessert",
  "Dinner",
  "Fruit",
  "Home",
  "Hosting",
  "Lunch",
  "Make ahead",
  "Markets",
  "Midweek",
  "One pan",
  "Pantry",
  "Quick",
  "Sharing",
  "Simple",
  "Spring",
  "Summer",
  "Sweet",
  "Travel",
  "Vegetarian",
  "Weekend",
] as const;

export type EditorialTag = (typeof editorialTags)[number];

const canonicalTags = new Map(
  editorialTags.map((tag) => [tag.toLocaleLowerCase("en-GB"), tag]),
);
canonicalTags.set("weeknight", "Midweek");

export const editorialTagOptions = editorialTags.map((tag) => ({
  title: tag,
  value: tag,
}));

export function normalizeEditorialTags(tags: unknown): EditorialTag[] {
  if (!Array.isArray(tags)) return [];

  const normalized: EditorialTag[] = [];
  const seen = new Set<string>();

  for (const value of tags) {
    if (typeof value !== "string") continue;

    const trimmed = value.trim().replace(/\s+/g, " ");
    if (!trimmed) continue;

    const key = trimmed.toLocaleLowerCase("en-GB");
    if (seen.has(key)) continue;

    const canonicalTag = canonicalTags.get(key);
    if (!canonicalTag) continue;

    seen.add(key);
    normalized.push(canonicalTag);
  }

  return normalized;
}

export function validateEditorialTags(tags: unknown): true | string {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "Choose at least one editorial tag.";
  }

  const seen = new Set<string>();
  for (const tag of tags) {
    if (typeof tag !== "string" || !tag.trim()) {
      return "Remove blank or duplicate tags.";
    }

    const key = tag.toLocaleLowerCase("en-GB");
    if (seen.has(key)) return "Remove blank or duplicate tags.";
    seen.add(key);

    if (canonicalTags.get(key) !== tag) {
      return "Choose tags from the curated vocabulary so casing stays consistent.";
    }
  }

  return true;
}
