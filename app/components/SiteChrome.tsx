import type { CreatorProfile as CreatorProfileData } from "../data";
import { CreatorProfile } from "./CreatorProfile";
import { NavBreadcrumb } from "./NavBreadcrumb";
import { PageLink } from "./PageLink";
import { TopMenu } from "./TopMenu";
import { publicationNavigation } from "./publication-navigation";

export function Nav() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavBreadcrumb />
        <nav className="desktop-navigation" aria-label="Primary navigation">
          {publicationNavigation.map(({ href, label, secondary }) => (
            <PageLink
              className={
                secondary
                  ? "desktop-navigation__link navigation-link--secondary secondary-navigation"
                  : "desktop-navigation__link"
              }
              href={href}
              key={label}
            >
              {label}
            </PageLink>
          ))}
        </nav>
        <TopMenu />
      </div>
    </header>
  );
}

export function Footer({
  creator,
}: {
  creator?: CreatorProfileData | null;
}) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section className="footer-premise" aria-labelledby="footer-premise">
          <p className="eyebrow">Nibbles with Nifa</p>
          <h2 id="footer-premise">
            Recipes, travel stories, and the food Nifa cooks at home.
          </h2>
        </section>

        <nav className="footer-navigation" aria-label="Footer navigation">
          <ul>
            {publicationNavigation.map(({ href, label, secondary }) => (
              <li
                className={secondary ? "secondary-navigation" : undefined}
                key={label}
              >
                <PageLink
                  className={
                    secondary ? "navigation-link--secondary" : undefined
                  }
                  href={href}
                >
                  {label}
                </PageLink>
              </li>
            ))}
          </ul>
        </nav>

        <CreatorProfile creator={creator} variant="footer" />
      </div>
      <p className="footer-credit">© Nibbles with Nifa, 2026.</p>
    </footer>
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
