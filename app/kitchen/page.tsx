import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { ContentImage } from "../components/ContentImage";
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
            <article className="kitchen-item" id={item.slug} key={item.slug}>
              <ContentImage
                alt={item.imageAlt}
                className="kitchen-item__image"
                sizes="(max-width: 760px) 100vw, 50vw"
                src={item.image}
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
