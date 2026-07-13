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
  { heading: "Recipes", href: "/recipes", label: "Recipe index" },
  { heading: "Travel", href: "/articles", label: "Travel essays" },
  { heading: "Edit", href: "/shop", label: "The edit" },
  { heading: "Kitchen", href: "/kitchen", label: "Our kitchen" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-groups">
        {footerGroups.map(({ heading, href, label }) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <PageLink href={href}>{label}</PageLink>
          </section>
        ))}
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
