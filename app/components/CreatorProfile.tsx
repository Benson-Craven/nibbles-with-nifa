import Image from "next/image";

import type {
  CreatorProfile as CreatorProfileData,
  CreatorSocialPlatform,
} from "../data";
import { normalizeExternalWebUrl } from "@/lib/external-url";
import { normalizeMediaSource } from "@/lib/media";

const platformLabels: Record<CreatorSocialPlatform, string> = {
  instagram: "Instagram",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  website: "Website",
  youtube: "YouTube",
};

type CreatorProfileVariant = "compact" | "expanded" | "footer";

const signaturePresentations: Record<
  CreatorProfileVariant,
  {
    eyebrow: string;
    imageSize: number;
    imageSizes: string;
    showBiography: boolean;
  }
> = {
  compact: {
    eyebrow: "From my kitchen",
    imageSize: 160,
    imageSizes: "(max-width: 640px) 88px, 132px",
    showBiography: true,
  },
  expanded: {
    eyebrow: "A bit about me",
    imageSize: 240,
    imageSizes: "(max-width: 640px) 120px, 200px",
    showBiography: true,
  },
  footer: {
    eyebrow: "Find me here",
    imageSize: 96,
    imageSizes: "72px",
    showBiography: false,
  },
};

function socialLinkLabel(platform: CreatorSocialPlatform) {
  if (platform === "website") {
    return "Visit my website (opens in a new tab)";
  }

  return `Follow me on ${platformLabels[platform]} (opens in a new tab)`;
}

export function CreatorProfile({
  creator,
  id,
  variant = "compact",
}: {
  creator?: CreatorProfileData | null;
  id?: string;
  variant?: CreatorProfileVariant;
}) {
  const name = creator?.name?.trim();
  if (!creator || !name) return null;

  const biography = creator.biography?.trim();
  const portraitImage = normalizeMediaSource(creator.portrait?.image);
  const portraitAlt = creator.portrait?.alt?.trim();
  const portrait =
    portraitImage && portraitAlt
      ? { alt: portraitAlt, image: portraitImage }
      : null;
  const presentation = signaturePresentations[variant];
  const socialLinks = (creator.socialLinks ?? []).flatMap(
    ({ platform, url }) => {
      const normalizedUrl = normalizeExternalWebUrl(url);
      if (!platform || !platformLabels[platform] || !normalizedUrl) return [];

      return [{ platform, url: normalizedUrl }];
    },
  );

  return (
    <section
      aria-label="About me"
      id={id}
      className={`creator-profile creator-profile--${variant}${
        portrait ? "" : " creator-profile--text-only"
      }`}
    >
      {portrait && (
        <Image
          alt={portrait.alt}
          className="creator-profile__portrait"
          height={presentation.imageSize}
          sizes={presentation.imageSizes}
          src={portrait.image}
          width={presentation.imageSize}
        />
      )}
      <div className="creator-profile__content">
        <p className="eyebrow">{presentation.eyebrow}</p>
        <h2 className="authored-heading">{name}</h2>
        {biography && presentation.showBiography && (
          <p className="creator-profile__biography">{biography}</p>
        )}
        {socialLinks.length > 0 && (
          <ul className="creator-profile__socials">
            {socialLinks.map(({ platform, url }) => (
              <li key={`${platform}-${url}`}>
                <a
                  aria-label={socialLinkLabel(platform)}
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
