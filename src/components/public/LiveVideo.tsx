import LiveStreamBanner from "./LiveStreamBanner";
import { embedUrl } from "@/lib/live";

type Props = {
  url: string | null;
  label: string;
  sublabel?: string;
};

/**
 * Diffusion en direct : lecteur vidéo intégré si le lien est une vidéo
 * YouTube, sinon simple bandeau cliquable (XbotGo app, Facebook…).
 * Ne rend rien tant qu'aucun lien n'est renseigné.
 */
export default function LiveVideo({ url, label, sublabel }: Props) {
  if (!url) return null;

  const embed = embedUrl(url);
  if (!embed) {
    return <LiveStreamBanner href={url} label={label} sublabel={sublabel} />;
  }

  return (
    <figure className="overflow-hidden rounded-2xl bg-black ring-1 ring-[color:var(--color-border)] shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          title={label}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <figcaption className="flex items-center gap-2 bg-[color:var(--color-omas-navy)] px-4 py-2.5 text-white">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">{label}</span>
          {sublabel && <span className="block text-xs text-white/75">{sublabel}</span>}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/25"
        >
          Plein écran ↗
        </a>
      </figcaption>
    </figure>
  );
}
