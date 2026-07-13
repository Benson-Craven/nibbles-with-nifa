import {
  defineLocations,
  type DocumentLocationsState,
} from "sanity/presentation";

type RecipePresentationDocument = {
  slug?: string;
  title?: string;
};

type ArticlePresentationDocument = RecipePresentationDocument & {
  format?: string;
};

export function resolveRecipePresentationLocations(
  document: RecipePresentationDocument | null,
): DocumentLocationsState {
  const slug = document?.slug?.trim();

  if (!slug) {
    return {
      message: "Add or generate a slug to preview this recipe.",
      tone: "caution",
    };
  }

  return {
    locations: [
      {
        title: document?.title?.trim() || "Untitled recipe",
        href: `/recipes/${slug}`,
      },
      { title: "Recipe index", href: "/recipes" },
    ],
  };
}

export function resolveArticlePresentationLocations(
  document: ArticlePresentationDocument | null,
): DocumentLocationsState {
  if (document?.format !== "travelEssay") return { locations: [] };

  const slug = document.slug?.trim();

  if (!slug) {
    return {
      message: "Add or generate a slug to preview this travel essay.",
      tone: "caution",
    };
  }

  return {
    locations: [
      {
        title: document.title?.trim() || "Untitled article",
        href: `/articles/${slug}`,
      },
      { title: "Article index", href: "/articles" },
    ],
  };
}

export const presentationLocations = {
  recipe: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: resolveRecipePresentationLocations,
  }),
  article: defineLocations({
    select: {
      format: "format",
      title: "title",
      slug: "slug.current",
    },
    resolve: resolveArticlePresentationLocations,
  }),
};
