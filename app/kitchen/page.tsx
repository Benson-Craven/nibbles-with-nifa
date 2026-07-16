import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { ContentImage } from "../components/ContentImage";
import { getCreatorProfile, getKitchenItems } from "@/lib/content";

export default async function KitchenPage() {
  const [creator, kitchenItems] = await Promise.all([
    getCreatorProfile(),
    getKitchenItems(),
  ]);

  return (
    <>
      <Nav />
      <main>
        <PageIntro
          eyebrow="Things I use"
          title="The kitchen bits I use all the time."
          copy="Nothing fancy: just the tools that earn their cupboard space. Some links may be affiliate links."
        />
        <section className="shell section kitchen-list">
          {kitchenItems.map((item, index) => (
            <article className="kitchen-item" id={item.slug} key={item.slug}>
              <ContentImage
                alt={item.imageAlt}
                className="kitchen-item__image"
                sizes="(max-width: 900px) 100vw, 50vw"
                src={item.image}
              />
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2 className="authored-heading">{item.title}</h2>
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
      <Footer creator={creator} />
    </>
  );
}
