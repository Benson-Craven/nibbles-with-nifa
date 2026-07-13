import Image from "next/image";

import type {
  CreatorProfile as CreatorProfileData,
  CreatorSocialPlatform,
} from "../data";
import { normalizeExternalWebUrl } from "@/lib/external-url";

const platformLabels: Record<CreatorSocialPlatform, string> = {
  instagram: "Instagram",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  website: "Website",
  youtube: "YouTube",
};

function socialLinkLabel(
  creatorName: string,
  platform: CreatorSocialPlatform,
) {
  if (platform === "website") {
    return `Visit ${creatorName}'s website (opens in a new tab)`;
  }

  return `Follow ${creatorName} on ${platformLabels[platform]} (opens in a new tab)`;
}

export function CreatorProfile({
  creator,
}: {
  creator?: CreatorProfileData | null;
}) {
  const name = creator?.name?.trim();
  if (!creator || !name) return null;

  const biography = creator.biography?.trim();
  const portraitImage = creator.portrait?.image?.trim();
  const portraitAlt = creator.portrait?.alt?.trim();
  const portrait =
    portraitImage && portraitAlt
      ? { alt: portraitAlt, image: portraitImage }
      : null;
  const socialLinks = (creator.socialLinks ?? []).flatMap(
    ({ platform, url }) => {
      const normalizedUrl = normalizeExternalWebUrl(url);
      if (!platform || !platformLabels[platform] || !normalizedUrl) return [];

      return [{ platform, url: normalizedUrl }];
    },
  );

  return (
    <section
      aria-label={`About ${name}`}
      className={`creator-profile${portrait ? "" : " creator-profile--text-only"}`}
    >
      {portrait && (
        <Image
          alt={portrait.alt}
          className="creator-profile__portrait"
          height={160}
          sizes="(max-width: 560px) 88px, 132px"
          src={portrait.image}
          width={160}
        />
      )}
      <div className="creator-profile__content">
        <p className="eyebrow">Created by</p>
        <h2>{name}</h2>
        {biography && (
          <p className="creator-profile__biography">{biography}</p>
        )}
        {socialLinks.length > 0 && (
          <ul className="creator-profile__socials">
            {socialLinks.map(({ platform, url }) => (
              <li key={`${platform}-${url}`}>
                <a
                  aria-label={socialLinkLabel(name, platform)}
                  href={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {platformLabels[platform]} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
