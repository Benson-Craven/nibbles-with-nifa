import type { Metadata } from "next";
import { draftMode } from "next/headers";

export const draftPreviewMetadata: Metadata = {
  title: "Unpublished preview | Nibbles with Nifa",
  description: "Authenticated preview of unpublished editorial content.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export async function isDraftPreviewEnabled() {
  return (await draftMode()).isEnabled;
}

export type DraftPreviewRuntime<TDependencies> = {
  isEnabled: () => Promise<boolean>;
  dependencies: TDependencies;
};

type ResolveDraftPreviewEntryOptions<TEntry, TDependencies> = {
  slug: string;
  publicDependencies: TDependencies;
  previewRuntime?: DraftPreviewRuntime<TDependencies>;
  loadEntry: (
    dependencies: TDependencies,
    slug: string,
  ) => Promise<TEntry | null>;
  loadPublishedEntry?: (
    dependencies: TDependencies,
    previewEntry: TEntry,
    slug: string,
  ) => Promise<TEntry | null>;
};

export async function resolveDraftPreviewEntry<TEntry, TDependencies>({
  slug,
  publicDependencies,
  previewRuntime,
  loadEntry,
  loadPublishedEntry,
}: ResolveDraftPreviewEntryOptions<TEntry, TDependencies>) {
  const isPreview = previewRuntime
    ? await previewRuntime.isEnabled()
    : false;
  const activeDependencies =
    isPreview && previewRuntime
      ? previewRuntime.dependencies
      : publicDependencies;
  const entry = await loadEntry(activeDependencies, slug);
  const loadPublic =
    loadPublishedEntry ??
    ((dependencies: TDependencies, _entry: TEntry, entrySlug: string) =>
      loadEntry(dependencies, entrySlug));
  const publishedEntry =
    isPreview && entry
      ? await loadPublic(publicDependencies, entry, slug).catch(() => null)
      : null;

  return {
    activeDependencies,
    entry,
    isPreview,
    publishedEntry,
  };
}
