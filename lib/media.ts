const allowedRemoteMediaHosts = new Set([
  "cdn.sanity.io",
  "images.pexels.com",
  "images.unsplash.com",
]);

export function normalizeMediaSource(source?: string) {
  const value = source?.trim();
  if (!value) return null;

  if (value.startsWith("/")) {
    if (value.startsWith("//")) return null;

    try {
      const parsed = new URL(value, "https://nibbles.local");
      return parsed.origin === "https://nibbles.local" ? value : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      !allowedRemoteMediaHosts.has(parsed.hostname)
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
