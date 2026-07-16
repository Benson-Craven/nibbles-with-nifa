import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createArticlesPage } from "../app/articles/page";
import { CreatorProfile } from "../app/components/CreatorProfile";
import { NavBreadcrumbTrail } from "../app/components/NavBreadcrumb";
import { RelatedContent } from "../app/components/RelatedContent";
import { Footer } from "../app/components/SiteChrome";
import {
  focusMenuTarget,
  isOutsideMenuActivation,
  lockMenuBackground,
  resolveFocusTrapTarget,
  TopMenu,
  TopMenuPanel,
} from "../app/components/TopMenu";
import {
  products as demoProducts,
  recipes as demoRecipes,
  type CreatorProfile as CreatorProfileData,
  type Product,
} from "../app/data";
import { createHomePage } from "../app/home-page";
import { createProductPage } from "../app/shop/[slug]/page";
import { createShopPage } from "../app/shop/page";
import { createRecipesPage } from "../app/recipes/page";
import { RecipeDetailContent } from "../app/recipes/[slug]/page";
import { createContentStore } from "../lib/content-store";

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

const creator = {
  name: "Nifa Akintola",
  biography:
    "I write about the recipes and places that shape how I cook at home.",
  portrait: {
    image: "/images/kitchen/apron-and-sheet-pan.png",
    alt: "Nifa smiling in her kitchen",
  },
  socialLinks: [{ platform: "instagram", url: "https://instagram.com/nifa" }],
} satisfies CreatorProfileData;

test("public navigation exposes Recipes, Travel and About me while keeping Things I use secondary", async () => {
  const HomePage = createHomePage(async () => ({
    articles: [],
    creator,
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

  for (const html of [routeHtml, openMenuHtml]) {
    assert.match(html, /href="\/recipes"[^>]*>Recipes</);
    assert.match(html, /href="\/articles"[^>]*>Travel</);
    assert.match(html, /href="\/#nifa"[^>]*>About me</);
    assert.match(
      html,
      /class="[^"]*(?:secondary-navigation|navigation-link--secondary)[^"]*"[^>]*href="\/kitchen"|href="\/kitchen"[^>]*class="[^"]*(?:secondary-navigation|navigation-link--secondary)/,
    );
  }

  assert.match(routeHtml, /id="nifa"/);
  assert.doesNotMatch(openMenuHtml, /top-menu-card|background-image/);
  assert.doesNotMatch(
    publicChromeHtml,
    />Articles<|>Travel essays<|>The edit</,
  );

  assert.doesNotMatch(publicChromeHtml, />Search</i);
  assert.doesNotMatch(publicChromeHtml, /Popular|Lunch|Dinner|Donabe|Noodles/);
  assert.doesNotMatch(publicChromeHtml, /Clothing|Hats|Accessories|Sunglasses/);
  assert.doesNotMatch(publicChromeHtml, /href="#"|action="#"/);
  assert.doesNotMatch(publicChromeHtml, /Nibbles Notes|Email address|Sign up/i);
  assert.doesNotMatch(
    publicChromeHtml,
    /aria-label="(?:Instagram|YouTube|TikTok|Pinterest)"/,
  );
  assert.doesNotMatch(publicChromeHtml, /<input|type="email"/);
});

test("mobile navigation helpers move and confine focus while restoring the page", () => {
  const focused: string[] = [];
  const first = { focus: () => focused.push("first") };
  const last = { focus: () => focused.push("last") };
  const trigger = { focus: () => focused.push("trigger") };

  focusMenuTarget(first);
  focusMenuTarget(trigger);
  assert.deepEqual(focused, ["first", "trigger"]);

  assert.equal(
    resolveFocusTrapTarget({
      activeElement: last,
      activeWithinPanel: true,
      first,
      last,
      shiftKey: false,
    }),
    first,
  );
  assert.equal(
    resolveFocusTrapTarget({
      activeElement: first,
      activeWithinPanel: true,
      first,
      last,
      shiftKey: true,
    }),
    last,
  );
  assert.equal(
    resolveFocusTrapTarget({
      activeElement: first,
      activeWithinPanel: true,
      first,
      last,
      shiftKey: false,
    }),
    null,
  );

  const background = [{ inert: false }, { inert: true }];
  const style = { overflow: "auto" };
  const restore = lockMenuBackground(background, style);
  assert.deepEqual(background, [{ inert: true }, { inert: true }]);
  assert.equal(style.overflow, "hidden");
  restore();
  assert.deepEqual(background, [{ inert: false }, { inert: true }]);
  assert.equal(style.overflow, "auto");

  assert.equal(isOutsideMenuActivation(false, false), true);
  assert.equal(isOutsideMenuActivation(true, false), false);
  assert.equal(isOutsideMenuActivation(false, true), false);
});

test("Travel archive and shell terminology do not reintroduce Articles or Notes", async () => {
  const ArticlesPage = createArticlesPage(async () => []);
  const html = render(await ArticlesPage());

  assert.match(html, />Travel</);
  assert.match(html, />All travel</);
  assert.match(html, />0 travel stories</);
  assert.doesNotMatch(
    html,
    />Articles<|>All articles<|>0 notes<|published notes/i,
  );
});

test("creator signatures support expanded home, compact detail and concise footer variants", async () => {
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(query: string) =>
      (query.trimStart().startsWith('*[_type == "creatorProfile"')
        ? creator
        : []) as T,
  });
  const HomePage = createHomePage(content.getHomeContent);
  const homeHtml = render(await HomePage());
  const compactHtml = render(
    createElement(CreatorProfile, { creator, variant: "compact" }),
  );
  const footerHtml = render(
    createElement(CreatorProfile, { creator, variant: "footer" }),
  );
  const textOnlyHtml = render(
    createElement(CreatorProfile, {
      creator: { name: "Nifa Akintola" },
      variant: "expanded",
    }),
  );
  const omittedHtml = render(
    createElement(CreatorProfile, {
      creator: { name: "   ", biography: "Unused biography" },
      variant: "expanded",
    }),
  );

  assert.match(
    homeHtml,
    /id="nifa"[^>]*>[\s\S]*creator-profile creator-profile--expanded/,
  );
  assert.match(homeHtml, /creator-profile--footer/);
  assert.match(homeHtml, /Nifa smiling in her kitchen/);
  assert.match(homeHtml, /I write about the recipes and places/);
  assert.match(homeHtml, /A bit about me/);
  assert.match(compactHtml, /creator-profile--compact/);
  assert.match(compactHtml, /From my kitchen/);
  assert.match(footerHtml, /creator-profile--footer/);
  assert.match(footerHtml, /Find me here/);
  assert.doesNotMatch(footerHtml, /creator-profile__biography/);
  assert.match(textOnlyHtml, /creator-profile--text-only/);
  assert.doesNotMatch(
    textOnlyHtml,
    /creator-profile__portrait|creator-profile__biography|creator-profile__socials/,
  );
  assert.equal(omittedHtml, "<div></div>");

  const HomePageWithoutCreator = createHomePage(async () => ({
    articles: [],
    creator: null,
    kitchenItems: [],
    products: [],
    recipes: [],
  }));
  const homeWithoutCreatorHtml = render(await HomePageWithoutCreator());
  assert.match(homeWithoutCreatorHtml, /id="nifa"/);
  assert.match(homeWithoutCreatorHtml, /<h2 class="sr-only">About me<\/h2>/);
  assert.doesNotMatch(homeWithoutCreatorHtml, /creator-profile/);
});

test("empty archives and secondary routes retain the published footer signature", async () => {
  const ArticlesPage = createArticlesPage(
    async () => [],
    async () => creator,
  );
  const RecipesPage = createRecipesPage(
    async () => [],
    async () => creator,
  );
  const ShopPage = createShopPage(
    async () => [],
    async () => creator,
  );
  const ProductPage = createProductPage(
    async () => displayOnlyProduct,
    async () => creator,
  );
  const routeHtml = [
    render(await ArticlesPage()),
    render(await RecipesPage()),
    render(await ShopPage()),
    render(
      await ProductPage({
        params: Promise.resolve({ slug: displayOnlyProduct.slug }),
      }),
    ),
  ];

  for (const html of routeHtml) {
    assert.match(html, /creator-profile--footer/);
    assert.match(html, /Find me here/);
    assert.match(html, /Nifa Akintola/);
  }
});

test("public editorial copy speaks in Nifa's first-person voice", async () => {
  const HomePage = createHomePage(async () => ({
    articles: [],
    creator,
    kitchenItems: [],
    products: [],
    recipes: [
      {
        ...demoRecipes[0],
        image: "/images/kitchen/tools-flatlay.png",
      },
    ],
  }));
  const ArticlesPage = createArticlesPage(
    async () => [],
    async () => creator,
  );
  const RecipesPage = createRecipesPage(
    async () => [],
    async () => creator,
  );
  const ShopPage = createShopPage(
    async () => [demoProducts[0]],
    async () => creator,
  );
  const recipeDetailHtml = render(
    createElement(RecipeDetailContent, {
      recipe: {
        slug: "my-recipe",
        title: "My recipe",
        provenance: { adaptationStatement: "I add extra ginger." },
        publicNotes: ["Taste before adding salt."],
        steps: ["Stir until glossy."],
      },
    }),
  );
  const publicCopy = [
    render(await HomePage()),
    render(await ArticlesPage()),
    render(await RecipesPage()),
    render(await ShopPage()),
    recipeDetailHtml,
  ].join("\n");

  assert.match(publicCopy, /shape how I cook at home/);
  assert.match(publicCopy, /while I finish writing it/);
  assert.match(publicCopy, /have a read of my travel stories/);
  assert.match(publicCopy, /What I changed:/);
  assert.match(publicCopy, /My notes/);
  assert.match(publicCopy, /From my kitchen/);
  assert.match(publicCopy, /My chilled red/);
  assert.match(publicCopy, /aria-label="About me"/);
  assert.doesNotMatch(
    publicCopy,
    /how (?:Nifa|she) cooks|while Nifa prepares|follow Nifa(?:&apos;|&#x27;|'|’)s|Nifa(?:&apos;|&#x27;|'|’)s (?:adaptation|notes|kitchen passport)|From our table|Our chilled red/i,
  );
});

test("product navigation and related cards use clear food and home framing", () => {
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

  assert.match(breadcrumbHtml, /food &amp; home/);
  assert.doesNotMatch(breadcrumbHtml, />shop</i);
  assert.match(relatedHtml, /Food &amp; home/);
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
  assert.match(
    html,
    /aria-label="Follow me on Instagram \(opens in a new tab\)"/,
  );
  assert.match(html, /aria-label="Visit my website \(opens in a new tab\)"/);
  assert.doesNotMatch(
    html,
    /javascript:|not a URL|linkedin|Pinterest|TikTok|YouTube/i,
  );
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

  assert.match(routeHtml, /food and home favourites/i);
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

  assert.match(sourcedHtml, /href="https:\/\/maker.example\/serving-bowl"/);
  assert.match(sourcedHtml, />See where it(?:&#x27;|&apos;|')s from</);
  assert.doesNotMatch(unsafeHtml, /javascript:|See where it/);
  assert.match(unsafeHtml, /food and home favourites/i);
});
