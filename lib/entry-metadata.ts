import type { Metadata } from "next";
import { notFound } from "next/navigation";

export type EntrySeo = {
  title?: string;
  description?: string;
  image?: string;
};

type MetadataEntry = {
  title: string;
  description: string;
  image: string;
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
  const image = customValue(entry.seo?.image, entry.image);

  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function createEntryMetadata<T>(
  loadEntry: (slug: string) => Promise<T | null>,
  toMetadataEntry: (entry: T) => MetadataEntry,
) {
  return async function generateEntryMetadata({ params }: MetadataPageProps) {
    const { slug } = await params;
    const entry = await loadEntry(slug);
    if (!entry) notFound();

    return resolveEntryMetadata(toMetadataEntry(entry));
  };
}
