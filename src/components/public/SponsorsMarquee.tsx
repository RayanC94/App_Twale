import Image from "next/image";

type Sponsor = {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
};

export default function SponsorsMarquee({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  // Dupliquer pour boucle infinie continue
  const loop = [...sponsors, ...sponsors];

  return (
    <div
      aria-label="Partenaires"
      className="fixed inset-x-0 bottom-[64px] z-20 overflow-hidden border-t border-[color:var(--color-border)] bg-white/90 backdrop-blur"
      style={{ paddingBottom: "0" }}
    >
      <div className="flex w-max animate-marquee items-center gap-10 px-6 py-2">
        {loop.map((s, i) => (
          <a
            key={`${s.id}-${i}`}
            href={s.website_url ?? "#"}
            target={s.website_url ? "_blank" : undefined}
            rel={s.website_url ? "noopener noreferrer" : undefined}
            className="shrink-0 opacity-80 hover:opacity-100 transition"
            aria-label={s.name}
          >
            <Image
              src={s.logo_url}
              alt={s.name}
              width={80}
              height={32}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          </a>
        ))}
      </div>
    </div>
  );
}
