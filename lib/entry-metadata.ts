import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftPreviewMetadata } from "@/lib/draft-preview";
import { normalizeMediaSource } from "@/lib/media";

export type EntrySeo = {
  title?: string;
  description?: string;
  image?: string;
};

type MetadataEntry = {
  title: string;
  description: string;
  image?: string;
  seo?: EntrySeo;
};

type MetadataPageProps = {
  params: Promise<{ slug: string }>;
};

function customValue(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function resolveEntryMetadata(entry: MetadataEntry): Metadata {
  const title = customValue(entry.seo?.title, entry.title);
  const description = customValue(entry.seo?.description, entry.description);
  const image =
    normalizeMediaSource(entry.seo?.image) ?? normalizeMediaSource(entry.image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function createEntryMetadata<T>(
  loadEntry: (slug: string) => Promise<T | null>,
  toMetadataEntry: (entry: T) => MetadataEntry,
  isPreview: () => Promise<boolean> = async () => false,
) {
  return async function generateEntryMetadata({ params }: MetadataPageProps) {
    if (await isPreview()) return draftPreviewMetadata;

    const { slug } = await params;
    const entry = await loadEntry(slug);
    if (!entry) notFound();

    return resolveEntryMetadata(toMetadataEntry(entry));
  };
}
