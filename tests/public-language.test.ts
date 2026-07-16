import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createArticlesPage } from "../app/articles/page";
import { RelatedContent } from "../app/components/RelatedContent";
import { NavBreadcrumbTrail } from "../app/components/NavBreadcrumb";
import {
  articles,
  demoCreatorProfile,
  kitchenItems,
  products,
  recipes,
} from "../app/data";
import { createHomePage } from "../app/home-page";
import { RecipeIndexContent } from "../app/recipes/page";
import { ProductDetailContent } from "../app/shop/[slug]/page";
import { createShopPage } from "../app/shop/page";

function render(element: React.ReactNode) {
  return renderToStaticMarkup(createElement("div", null, element));
}

const localImage = "/images/kitchen/tools-flatlay.png";
const recipeFixtures = recipes.map((recipe) => ({
  ...recipe,
  image: localImage,
}));
const articleFixtures = articles.map((article) => ({
  ...article,
  image: localImage,
}));

test("public section names and calls to action say what they lead to", async () => {
  const HomePage = createHomePage(async () => ({
    articles: articleFixtures,
    creator: demoCreatorProfile,
    kitchenItems,
    products,
    recipes: recipeFixtures,
  }));
  const ShopPage = createShopPage(
    async () => products,
    async () => demoCreatorProfile,
  );
  const renderedCopy = [
    render(await HomePage()),
    render(await ShopPage()),
    render(createElement(ProductDetailContent, { product: products[0] })),
    render(
      createElement(NavBreadcrumbTrail, {
        pathname: `/shop/${products[0].slug}`,
      }),
    ),
    render(
      createElement(RelatedContent, {
        articles: articleFixtures,
        kitchenItems,
        products,
        recipes: recipeFixtures,
        related: [
          { type: "recipe", slug: recipeFixtures[0].slug },
          { type: "product", slug: products[0].slug },
          { type: "kitchenItem", slug: kitchenItems[0].slug },
        ],
      }),
    ),
  ].join("\n");

  assert.match(renderedCopy, /Food (?:&amp;|&) home/);
  assert.match(renderedCopy, /My food and home favourites/);
  assert.match(renderedCopy, /See all my picks/);
  assert.match(renderedCopy, /Things I use/);
  assert.match(renderedCopy, /Where to next\?/);
  assert.doesNotMatch(
    renderedCopy,
    /browse the edit|the edit|kit list|continue exploring|editorial pick/i,
  );
});

test("public fallback and demo copy uses natural Irish and British English", async () => {
  const ArticlesPage = createArticlesPage(
    async () => articleFixtures,
    async () => demoCreatorProfile,
  );
  const publicCopy = [
    render(await ArticlesPage()),
    render(createElement(RecipeIndexContent, { recipes: recipeFixtures })),
    JSON.stringify({ articles, kitchenItems, products, recipes }),
  ].join("\n");

  assert.match(publicCopy, /midweek/i);
  assert.match(publicCopy, /baking tray/i);
  assert.doesNotMatch(
    publicCopy,
    /\bweeknight(?:-proof)?\b|\bsheet pan\b|\bskillet\b|\bscallions\b|\bgroceries\b/i,
  );
});

test("shared public copy avoids vague lifestyle-brand filler", async () => {
  const files = [
    "app/components/CreatorProfile.tsx",
    "app/error.tsx",
    "app/home-page.tsx",
    "app/kitchen/page.tsx",
    "app/recipes/page.tsx",
    "app/shop/page.tsx",
    "components/ui/image-trail-demo.tsx",
  ];
  const source = (
    await Promise.all(files.map((file) => readFile(file, "utf8")))
  ).join("\n");

  assert.match(source, /What I(?:&apos;|')m cooking lately/);
  assert.match(
    source,
    /recipes, travel stories (?:&|&amp;) food and home favourites/i,
  );
  assert.doesNotMatch(
    source,
    /fresh from the feed|low-lift|cute finds|kitchen passport|objects and finds worth a closer look|source links appear only/i,
  );
});
