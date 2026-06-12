type Props = {
  href: string | null;
  label: string;
  sublabel?: string;
};

/**
 * Bandeau « diffusion en direct » (XbotGo, live village santé…).
 * Ne rend rien tant que le lien n'est pas renseigné dans les constantes.
 */
export default function LiveStreamBanner({ href, label, sublabel }: Props) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl bg-[color:var(--color-omas-navy)] p-4 text-white shadow-sm transition active:scale-[0.99] hover:opacity-95"
    >
      <span className="relative flex h-3 w-3 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {sublabel && <span className="block text-xs text-white/75">{sublabel}</span>}
      </span>
      <span className="text-white/80" aria-hidden>›</span>
    </a>
  );
}
