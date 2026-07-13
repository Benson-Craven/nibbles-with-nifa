import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CreatorProfile } from "../app/components/CreatorProfile";
import { NavBreadcrumbTrail } from "../app/components/NavBreadcrumb";
import { RelatedContent } from "../app/components/RelatedContent";
import { Footer } from "../app/components/SiteChrome";
import { TopMenu, TopMenuPanel } from "../app/components/TopMenu";
import type { CreatorProfile as CreatorProfileData, Product } from "../app/data";
import { createHomePage } from "../app/home-page";
import { createProductPage } from "../app/shop/[slug]/page";
import { createShopPage } from "../app/shop/page";

const displayOnlyProduct: Product = {
  slug: "serving-bowl",
  title: "Hand-thrown serving bowl",
  blurb: "A wide bowl selected for generous salads and shared noodles.",
  image: "/images/shop/linen-and-bowl.png",
  imageAlt: "A hand-thrown serving bowl beside folded linen",
  price: "£46",
  category: "home",
};

function render(element: React.ReactNode) {
  return renderToStaticMarkup(createElement("div", null, element));
}

test("public navigation exposes only honest destinations and no inactive controls", async () => {
  const HomePage = createHomePage(async () => ({
    articles: [],
    kitchenItems: [],
    products: [],
    recipes: [],
  }));
  const routeHtml = render(await HomePage());
  const openMenuHtml = render(createElement(TopMenuPanel));
  const closedMenuHtml = render(createElement(TopMenu));
  const footerHtml = render(createElement(Footer));
  const publicChromeHtml = [
    routeHtml,
    openMenuHtml,
    closedMenuHtml,
    footerHtml,
  ].join("\n");

  assert.match(openMenuHtml, /href="\/recipes"[^>]*>Recipes</);
  assert.match(openMenuHtml, /href="\/articles"[^>]*>Travel essays</);
  assert.match(openMenuHtml, /href="\/kitchen"[^>]*>Our kitchen</);
  assert.match(openMenuHtml, /href="\/shop"[^>]*>The edit</);

  assert.doesNotMatch(publicChromeHtml, />Search</i);
  assert.doesNotMatch(publicChromeHtml, /Popular|Lunch|Dinner|Donabe|Noodles/);
  assert.doesNotMatch(publicChromeHtml, /Clothing|Hats|Accessories|Sunglasses/);
  assert.doesNotMatch(publicChromeHtml, /href="#"|action="#"/);
  assert.doesNotMatch(publicChromeHtml, /Nibbles Notes|Email address|Sign up/i);
  assert.doesNotMatch(publicChromeHtml, /aria-label="(?:Instagram|YouTube|TikTok|Pinterest)"/);
  assert.doesNotMatch(publicChromeHtml, /<input|type="email"/);
});

test("product navigation and related cards use editorial framing", () => {
  const breadcrumbHtml = render(
    createElement(NavBreadcrumbTrail, { pathname: "/shop/serving-bowl" }),
  );
  const relatedHtml = render(
    createElement(RelatedContent, {
      articles: [],
      kitchenItems: [],
      products: [displayOnlyProduct],
      recipes: [],
      related: [{ type: "product", slug: displayOnlyProduct.slug }],
    }),
  );

  assert.match(breadcrumbHtml, /the edit/);
  assert.doesNotMatch(breadcrumbHtml, />shop</i);
  assert.match(relatedHtml, /Editorial pick/);
  assert.match(relatedHtml, /href="\/shop\/serving-bowl"/);
  assert.doesNotMatch(relatedHtml, /href="https?:\/\//);
  assert.doesNotMatch(relatedHtml, />Shop</i);
});

test("creator social links require a supported platform and usable web URL", () => {
  const creator = {
    name: "Nifa Akintola",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/nifa" },
      { platform: "website", url: "https://nifa.example/about" },
      { platform: "youtube", url: "javascript:alert('unsafe')" },
      { platform: "tiktok", url: "not a URL" },
      { platform: "pinterest", url: "   " },
      { platform: "linkedin", url: "https://linkedin.com/in/nifa" },
    ],
  } as CreatorProfileData;

  const html = render(createElement(CreatorProfile, { creator }));

  assert.match(html, /href="https:\/\/instagram.com\/nifa"/);
  assert.match(html, /href="https:\/\/nifa.example\/about"/);
  assert.doesNotMatch(html, /javascript:|not a URL|linkedin|Pinterest|TikTok|YouTube/i);
});

test("display-only product routes contain no transactional actions or promises", async () => {
  const ShopPage = createShopPage(async () => [displayOnlyProduct]);
  const ProductPage = createProductPage(async (slug) =>
    slug === displayOnlyProduct.slug ? displayOnlyProduct : null,
  );
  const routeHtml = [
    render(await ShopPage()),
    render(
      await ProductPage({
        params: Promise.resolve({ slug: displayOnlyProduct.slug }),
      }),
    ),
  ].join("\n");

  assert.match(routeHtml, /display-only editorial pick/i);
  assert.doesNotMatch(routeHtml, /Add to basket|checkout|buy now|purchase/i);
  assert.doesNotMatch(routeHtml, /£46/);
  assert.doesNotMatch(routeHtml, /<button[^>]*>Add/);
  assert.match(
    routeHtml,
    /alt="A hand-thrown serving bowl beside folded linen"/,
  );
});

test("product source links render only for usable external web URLs", async () => {
  const sourcedProduct = {
    ...displayOnlyProduct,
    externalUrl: "https://maker.example/serving-bowl",
  };
  const unsafeProduct = {
    ...displayOnlyProduct,
    slug: "unsafe-serving-bowl",
    externalUrl: "javascript:alert('unsafe')",
  };
  const ProductPage = createProductPage(async (slug) => {
    if (slug === sourcedProduct.slug) return sourcedProduct;
    if (slug === unsafeProduct.slug) return unsafeProduct;
    return null;
  });

  const sourcedHtml = render(
    await ProductPage({
      params: Promise.resolve({ slug: sourcedProduct.slug }),
    }),
  );
  const unsafeHtml = render(
    await ProductPage({
      params: Promise.resolve({ slug: unsafeProduct.slug }),
    }),
  );

  assert.match(
    sourcedHtml,
    /href="https:\/\/maker.example\/serving-bowl"/,
  );
  assert.match(sourcedHtml, />Visit source</);
  assert.doesNotMatch(unsafeHtml, /javascript:|Visit source/);
  assert.match(unsafeHtml, /display-only editorial pick/i);
});
