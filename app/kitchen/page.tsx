import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { getKitchenItems } from "@/lib/content";

export default async function KitchenPage() {
  const kitchenItems = await getKitchenItems();

  return (
    <>
      <Nav />
      <main>
        <PageIntro
          eyebrow="Kit list"
          title="The stuff we actually reach for."
          copy="Small-space tools, low-drama upgrades, and useful things that make cooking feel easier. May contain affiliate links!"
        />
        <section className="shell section kitchen-list">
          {kitchenItems.map((item, index) => (
            <article className="kitchen-item" key={item.slug}>
              <div
                className="kitchen-item__image"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{item.title}</h2>
                <p>{item.blurb}</p>
                {item.affiliateUrl && (
                  <a href={item.affiliateUrl} target="_blank" rel="noreferrer">
                    Find something similar <b>↗</b>
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
