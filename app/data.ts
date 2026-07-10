export type IngredientItem =
  | string
  | { text: string; image?: string; alt?: string };
export type CreatorSocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "website";
export type CreatorProfile = {
  name: string;
  biography?: string;
  portrait?: { image?: string; alt?: string };
  socialLinks?: { platform?: CreatorSocialPlatform; url?: string }[];
};
export type Recipe = { slug: string; title: string; note: string; image: string; featured: boolean; date: string; servings: number; prep: number; cook: number; tags: string[]; intro: string; ingredients: { group?: string; items: IngredientItem[] }[]; steps: string[]; creator?: CreatorProfile };
export type Product = { slug: string; title: string; blurb: string; image: string; price: string; category: "home" | "gift" | "host" | "wine" | "goods" };
export type KitchenItem = { slug: string; title: string; blurb: string; image: string; affiliateUrl: string };
export type Article = {
  slug: string;
  title: string;
  dek: string;
  image: string;
  date: string;
  category: "city notes" | "hosting" | "pantry" | "home";
  readTime: number;
  featured: boolean;
  intro: string;
  sections: { heading: string; body: string[] }[];
  related: {
    recipes?: string[];
    products?: string[];
    kitchenItems?: string[];
  };
  creator?: CreatorProfile;
};

export const demoCreatorProfile: CreatorProfile = {
  name: "Nifa",
  biography:
    "Nifa shares the recipes, places, and small rituals that shape how she cooks at home.",
  socialLinks: [],
};

const pexels = "?auto=compress&cs=tinysrgb&w=1400";
export const recipes: Recipe[] = [
  { slug: "miso-mushroom-pasta", title: "Miso mushroom pasta", note: "Silky, savoury, and weeknight-proof.", image: `https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg${pexels}`, featured: true, date: "2026-04-10", servings: 4, prep: 15, cook: 20, tags: ["Dinner", "Vegetarian", "Comfort"], intro: "A glossy bowl of noodles with jammy mushrooms, a spoonful of white miso and plenty of black pepper.", ingredients: [{ group: "For the pasta", items: ["350g long pasta", "400g mixed mushrooms", "2 tbsp white miso", "180ml cream or oat cream", "1 lemon", "Parmesan, to finish"] }], steps: ["Bring a large pot of salted water to the boil and cook the pasta until just shy of al dente.", "Meanwhile, cook the mushrooms in olive oil over a high heat until deeply browned and glossy.", "Stir miso into the cream with a splash of pasta water. Add to the pan, then tumble through the pasta.", "Finish with lemon, pepper, and a generous snowfall of parmesan."] },
  { slug: "sweet-potato-bread-pudding", title: "Sweet potato milk bread pudding", note: "A soft, violet-custard kind of dessert.", image: `https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg${pexels}`, featured: true, date: "2026-03-28", servings: 6, prep: 25, cook: 40, tags: ["Baking", "Dessert", "Weekend"], intro: "Soft bread, roasted sweet potato and a custard that turns every edge golden.", ingredients: [{ items: ["1 large sweet potato", "1 loaf milk bread", "3 eggs", "350ml whole milk", "75g brown sugar", "Butter and flaky salt"] }], steps: ["Roast the sweet potato until tender, then mash until smooth.", "Whisk the mash with eggs, milk, sugar and a pinch of salt.", "Tear the bread into a buttered baking dish and pour over the custard.", "Bake until puffed and burnished at the edges. Rest for ten minutes before serving."] },
  { slug: "sticky-rice-chicken", title: "Sticky rice stuffed chicken", note: "Crisp skin, sticky rice, group-chat energy.", image: `https://images.pexels.com/photos/262945/pexels-photo-262945.jpeg${pexels}`, featured: true, date: "2026-02-14", servings: 6, prep: 35, cook: 80, tags: ["Weekend", "Chicken", "Sharing"], intro: "Fragrant sticky rice and mushrooms tucked inside a roast chicken for a low-key table full of people.", ingredients: [{ items: ["1 whole free-range chicken", "250g sticky rice", "150g shiitake mushrooms", "3 spring onions", "Soy sauce", "Sesame oil"] }], steps: ["Soak the rice for at least two hours, then steam until tender.", "Cook the mushrooms with scallions, soy and sesame oil. Fold through the rice.", "Fill the chicken cavity loosely, rub the skin with oil and salt, then roast until deeply golden.", "Rest well before carving, then spoon the rice from the centre onto the platter."] },
  { slug: "green-garlic-toast", title: "Green garlic toast", note: "The quickest way to make dinner feel like spring.", image: `https://images.pexels.com/photos/1332271/pexels-photo-1332271.jpeg${pexels}`, featured: false, date: "2026-04-02", servings: 2, prep: 10, cook: 8, tags: ["Lunch", "Spring", "Quick"], intro: "Charred green garlic, ricotta, and a bright little pile of herbs on hot toast.", ingredients: [{ items: ["4 slices sourdough", "1 bunch green garlic", "150g ricotta", "1 lemon", "Soft herbs"] }], steps: ["Grill the bread until crisp at the edges.", "Sizzle sliced green garlic until just softened.", "Spread the toast with ricotta and pile on the garlic.", "Finish with lemon zest, herbs and olive oil."] },
  { slug: "burnt-honey-pears", title: "Burnt honey pears", note: "Warm fruit, cold cream, no ceremony.", image: `https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg${pexels}`, featured: false, date: "2026-01-30", servings: 4, prep: 10, cook: 25, tags: ["Dessert", "Fruit", "Simple"], intro: "A very small dessert that tastes far grander than the amount of work it asks for.", ingredients: [{ items: ["4 ripe pears", "4 tbsp honey", "Vanilla", "Crème fraîche", "Toasted hazelnuts"] }], steps: ["Halve and core the pears.", "Warm honey in a roasting dish until darkened and fragrant.", "Add the pears cut-side down and roast until tender.", "Serve with cold crème fraîche and hazelnuts."] },
  { slug: "tomato-tarte-tatin", title: "Tomato tarte tatin", note: "Jammy tomatoes and crisp pastry, upside-down and unapologetic.", image: `https://images.pexels.com/photos/4553111/pexels-photo-4553111.jpeg${pexels}`, featured: true, date: "2026-05-09", servings: 4, prep: 20, cook: 35, tags: ["Summer", "Lunch", "Baking"], intro: "A quick tomato tart with a sweet-tangy underside and a very flaky top.", ingredients: [{ items: ["500g cherry tomatoes", "1 sheet all-butter puff pastry", "2 tbsp balsamic vinegar", "1 tbsp brown sugar", "A handful of basil", "Crème fraîche, to serve"] }], steps: ["Cook the tomatoes in an ovenproof skillet with olive oil until they begin to soften.", "Add the balsamic and sugar, then let the juices reduce to a sticky glaze.", "Lay the pastry over the tomatoes, tucking in the edges.", "Bake until deeply golden, then carefully turn out and finish with basil."] },
  { slug: "lemony-white-beans", title: "Lemony white beans with greens", note: "One bright, brothy pan for the middle of the week.", image: `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg${pexels}`, featured: true, date: "2026-05-02", servings: 4, prep: 10, cook: 20, tags: ["Weeknight", "Vegetarian", "One pan"], intro: "Creamy beans, wilted greens and lemon make a low-effort dinner that still feels like you tried.", ingredients: [{ items: ["2 tins cannellini beans", "1 leek", "2 cloves garlic", "150g greens", "1 lemon", "Vegetable stock"] }], steps: ["Soften the leek and garlic in olive oil with a pinch of salt.", "Add the beans and stock, then simmer until the liquid turns silky.", "Fold through the greens until just wilted.", "Finish with lemon juice, zest and plenty of black pepper."] },
  { slug: "charred-corn-fritters", title: "Charred corn fritters", note: "Crisp-edged little things for a late, lazy lunch.", image: `https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg${pexels}`, featured: true, date: "2026-04-22", servings: 4, prep: 15, cook: 15, tags: ["Lunch", "Summer", "Sharing"], intro: "Sweet corn, scallions and a tangy yogurt sauce in a pile you can eat with your hands.", ingredients: [{ items: ["3 ears sweetcorn", "2 eggs", "80g plain flour", "3 spring onions", "Greek yogurt", "1 lime"] }], steps: ["Char the corn in a dry pan, then cut the kernels from the cob.", "Mix with eggs, flour and sliced scallions to make a loose batter.", "Fry spoonfuls in a shallow layer of oil until golden on both sides.", "Serve hot with limey yogurt and a scattering of herbs."] },
  { slug: "black-sesame-cookies", title: "Black sesame cookies", note: "Nutty, chewy, and just the right amount of mysterious.", image: `https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg${pexels}`, featured: true, date: "2026-04-16", servings: 16, prep: 15, cook: 12, tags: ["Baking", "Sweet", "Make ahead"], intro: "A chewy cookie with toasted sesame, dark chocolate and a faintly salty edge.", ingredients: [{ items: ["150g butter", "140g brown sugar", "1 egg", "180g plain flour", "60g black sesame seeds", "100g dark chocolate"] }], steps: ["Cream the butter and sugar until pale, then beat in the egg.", "Fold in the flour, sesame seeds and chopped chocolate.", "Chill the dough until firm enough to scoop.", "Bake until the edges set but the middles are still soft, then cool on the tray."] },
];

export const products: Product[] = [
  { slug: "house-red", title: "Our chilled red", blurb: "A fridge-door red for pizza, playlists, and people dropping by.", image: "/images/shop/chilled-red.png", price: "£22", category: "wine" },
  { slug: "striped-linen-napkin", title: "Striped linen napkins", blurb: "For spaghetti nights, birthday cake, and every meal in between.", image: "/images/shop/linen-and-bowl.png", price: "£28", category: "home" },
  { slug: "hand-thrown-bowl", title: "Hand-thrown serving bowl", blurb: "For big salads, instant noodles with toppings, and desk snacks.", image: "/images/shop/linen-and-bowl.png", price: "£46", category: "home" },
  { slug: "little-supper-kit", title: "Little dinner kit", blurb: "A cute excuse to text somebody and make them pasta.", image: "/images/shop/supper-kit.png", price: "£34", category: "gift" },
  { slug: "market-tote", title: "Market tote", blurb: "A roomy companion for flowers, groceries, and very good bread.", image: "/images/shop/market-tote.png", price: "£18", category: "goods" },
  { slug: "brass-bottle-opener", title: "Brass bottle opener", blurb: "A handsome little thing for the host who has everything but this.", image: "/images/shop/brass-opener.png", price: "£16", category: "host" },
];

export const kitchenItems: KitchenItem[] = [
  { slug: "wooden-spoon", title: "The wooden spoon", blurb: "For stirring almost everything.", image: "/images/kitchen/tools-flatlay.png", affiliateUrl: "https://www.pexels.com" },
  { slug: "microplane", title: "A sharp little grater", blurb: "Lemon zest, parmesan, garlic — its moment is always coming.", image: "/images/kitchen/tools-flatlay.png", affiliateUrl: "https://www.pexels.com" },
  { slug: "olive-oil", title: "The olive oil bottle", blurb: "A refillable friend that lives by the stove.", image: "/images/kitchen/tools-flatlay.png", affiliateUrl: "https://www.pexels.com" },
  { slug: "chef-knife", title: "One very good knife", blurb: "The kind you keep sharp and use every day.", image: "/images/kitchen/chef-knife.png", affiliateUrl: "https://www.pexels.com" },
  { slug: "linen-apron", title: "A faded linen apron", blurb: "Soft enough to forget it is there.", image: "/images/kitchen/apron-and-sheet-pan.png", affiliateUrl: "https://www.pexels.com" },
  { slug: "sheet-pan", title: "A proper sheet pan", blurb: "For roasted edges and very little washing up.", image: "/images/kitchen/apron-and-sheet-pan.png", affiliateUrl: "https://www.pexels.com" },
];

export const articles: Article[] = [
  {
    slug: "corner-shop-haul-turned-dinner",
    title: "A corner-shop haul turned dinner",
    dek: "Beans, greens, something fizzy, and the small thrill of making a meal from almost nothing.",
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1400",
    date: "2026-05-21",
    category: "pantry",
    readTime: 4,
    featured: true,
    intro:
      "Some nights start with no plan and one reusable bag. This is the loose formula we keep coming back to when the good shops are closed and dinner still needs a little charm.",
    sections: [
      {
        heading: "Start with one soft thing",
        body: [
          "A tin of beans, a packet of noodles, a torn loaf, or a potato from the bottom of the basket can become the centre if you give it enough gloss.",
          "Warm it with olive oil, something allium-adjacent, and a splash of stock or pasta water until it stops looking practical and starts looking intentional.",
        ],
      },
      {
        heading: "Add a bright ending",
        body: [
          "Lemon, pickles, chilli crisp, herbs from a tired bunch, or a very vinegary salad keep corner-shop food from feeling beige.",
          "The move is not abundance. It is contrast: soft with crunchy, rich with sharp, hot with cold.",
        ],
      },
    ],
    related: {
      recipes: ["lemony-white-beans", "green-garlic-toast"],
      kitchenItems: ["wooden-spoon", "olive-oil"],
    },
  },
  {
    slug: "sunny-floor-picnic",
    title: "A sunny floor picnic",
    dek: "The no-table lunch: napkins, chilled red, a bowl of something crisp, and a window patch of light.",
    image:
      "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=1400",
    date: "2026-05-12",
    category: "hosting",
    readTime: 3,
    featured: true,
    intro:
      "A picnic does not need a park. Sometimes it is nicer on the floor, close to the speaker, with plates balanced on a magazine and cold glasses sweating onto the rug.",
    sections: [
      {
        heading: "Keep the food hand-friendly",
        body: [
          "Think fritters, toast, fruit, torn cheese, and one thing that can sit happily at room temperature.",
          "A little mess is fine. A lot of cutlery is where the mood starts to leave the room.",
        ],
      },
      {
        heading: "Make the setup feel deliberate",
        body: [
          "Use the linen, open something chilled, and put the good bowl in the middle even if lunch came together in ten minutes.",
          "The point is not effort. It is making an ordinary patch of afternoon feel like a place to stay.",
        ],
      },
    ],
    related: {
      recipes: ["charred-corn-fritters", "tomato-tarte-tatin"],
      products: ["house-red", "striped-linen-napkin"],
      kitchenItems: ["linen-apron"],
    },
  },
  {
    slug: "tiny-weekend-reset",
    title: "A tiny weekend reset",
    dek: "One wiped shelf, one sheet pan, one dessert, and a kitchen that feels friendly again.",
    image:
      "https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg?auto=compress&cs=tinysrgb&w=1400",
    date: "2026-04-27",
    category: "home",
    readTime: 5,
    featured: true,
    intro:
      "This is the opposite of a Sunday reset with matching containers. It is just enough order to make the next meal easier and the next snack more likely to happen.",
    sections: [
      {
        heading: "Do the visible thing first",
        body: [
          "Clear the counter, wash the board, and put the pan back where Future You will actually look for it.",
          "A kitchen can still have crumbs and feel reset. It mostly needs a clear place to begin.",
        ],
      },
      {
        heading: "Bake something low-stakes",
        body: [
          "Fruit in honey, cookies from chilled dough, or a soft pudding gives the room a reason to smell good.",
          "Save a serving for Monday. That is the quiet victory.",
        ],
      },
    ],
    related: {
      recipes: ["burnt-honey-pears", "black-sesame-cookies"],
      products: ["hand-thrown-bowl"],
      kitchenItems: ["sheet-pan", "chef-knife"],
    },
  },
  {
    slug: "weekend-snack-plan",
    title: "Weekend snack plan",
    dek: "Crisp edges, good bowls, and small plates that make an unplanned hang feel hosted.",
    image:
      "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=1400",
    date: "2026-04-18",
    category: "hosting",
    readTime: 3,
    featured: false,
    intro:
      "The best weekend food is useful at 3pm and still exciting at 8pm. Make one warm thing, one crunchy thing, and one thing people can keep picking at.",
    sections: [
      {
        heading: "Cook the anchor",
        body: [
          "A skillet of mushrooms, a pan of fritters, or a sticky roast gives everyone somewhere to gather.",
          "Do not make every plate precious. The table relaxes when people can serve themselves.",
        ],
      },
      {
        heading: "Let the shop bits help",
        body: [
          "Napkins, a bottle opener, and a tote full of snacks are not the meal, but they make the meal feel like a plan.",
        ],
      },
    ],
    related: {
      recipes: ["sticky-rice-chicken", "miso-mushroom-pasta"],
      products: ["brass-bottle-opener", "market-tote"],
      kitchenItems: ["sheet-pan"],
    },
  },
  {
    slug: "out-and-about-list",
    title: "Out-and-about list",
    dek: "Market stops, bench snacks, and the nice-to-have things that make errands turn into a day.",
    image:
      "https://images.pexels.com/photos/34650/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400",
    date: "2026-04-08",
    category: "city notes",
    readTime: 4,
    featured: false,
    intro:
      "This is a soft plan for leaving the house: one food errand, one place to sit, and one treat that makes the walk home feel earned.",
    sections: [
      {
        heading: "Carry less, choose better",
        body: [
          "A roomy tote, a short list, and no fantasy about cooking five dinners from scratch is the right amount of ambition.",
          "Buy the very good bread, the herbs you will use tonight, and one thing that does not need a reason.",
        ],
      },
      {
        heading: "Make room for the bench course",
        body: [
          "A pastry, a little fruit, or something salty eaten outside can be the whole point of the trip.",
        ],
      },
    ],
    related: {
      recipes: ["green-garlic-toast", "burnt-honey-pears"],
      products: ["market-tote"],
      kitchenItems: ["chef-knife"],
    },
  },
];
