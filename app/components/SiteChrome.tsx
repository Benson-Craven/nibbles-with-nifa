import { NavBreadcrumb } from "./NavBreadcrumb";
import { PageLink } from "./PageLink";
import { TopMenu } from "./TopMenu";

export function Nav() {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <TopMenu />
        <NavBreadcrumb />
      </div>
    </header>
  );
}

const footerGroups = [
  [
    "Recipes",
    "Recipe Index",
    "Popular",
    "Noodles",
    "Dinner",
    "Lunch",
    "Donate",
  ],
  ["Goods", "T-Shirts", "Caps", "Bandana", "Cookbook", "Wine", "Policy"],
  ["Articles", "City notes", "Hosting", "Pantry", "Weekend reset"],
  ["World", "Kit list", "Pantry", "Utilities"],
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-groups">
        {footerGroups.map(([heading, ...links]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {links.map((link) => (
              <PageLink
                href={
                  heading === "World"
                    ? "/kitchen"
                    : heading === "Articles"
                      ? "/articles"
                      : heading === "Goods"
                        ? "/shop"
                        : "/recipes"
                }
                key={link}
              >
                {link}
              </PageLink>
            ))}
          </section>
        ))}
        <section className="footer-follow">
          <h2>Follow</h2>
          <div className="socials">
            <a href="#" aria-label="Instagram">
              ●
            </a>
            <a href="#" aria-label="YouTube">
              ▶
            </a>
            <a href="#" aria-label="TikTok">
              ♪
            </a>
            <a href="#" aria-label="Pinterest">
              P
            </a>
          </div>
          <h2>Nibbles Notes</h2>
          <p>
            New recipes, grocery-list ideas, cute finds, and plans worth
            leaving the house for.
          </p>
          <form action="#">
            <input
              aria-label="Email address"
              placeholder="Email address"
              type="email"
            />
            <button type="submit">Sign up</button>
          </form>
        </section>
      </div>
      <p className="footer-credit">© Nibbles with Nifa, 2026.</p>
    </footer>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-intro shell">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  );
}
