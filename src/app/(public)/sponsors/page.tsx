import { createServiceClient } from "@/lib/supabase/service";
import Image from "next/image";
import { SPONSORS as FALLBACK_SPONSORS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partenaires" };

type Sponsor = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  website_url: string | null;
};

async function getSponsors(): Promise<Sponsor[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("sponsors")
      .select("id,name,description,logo_url,website_url")
      .order("position", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

/** Fallback : utilise la constante locale si la table `sponsors` est vide ou indisponible. */
function withFallback(list: Sponsor[]): Sponsor[] {
  if (list.length > 0) return list;
  return FALLBACK_SPONSORS.map((s, i) => ({
    id: `fallback-${i}`,
    name: s.name,
    description: s.description,
    logo_url: s.logo,
    website_url: s.website,
  }));
}

export default async function SponsorsPage() {
  const sponsors = withFallback(await getSponsors());

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">Partenaires</h1>
          <p className="mt-2 text-sm text-white/85">Merci à celles et ceux qui rendent l&apos;événement possible.</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        <ul className="space-y-3">
          {sponsors.map((s) => {
            const card = (
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] shadow-sm">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-[color:var(--color-omas-cream)] flex items-center justify-center overflow-hidden ring-1 ring-[color:var(--color-border)]">
                  <Image src={s.logo_url} alt={s.name} width={80} height={80} className="h-full w-full object-contain p-1.5" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[color:var(--color-foreground)]">{s.name}</div>
                  {s.description && <div className="mt-1 text-xs text-[color:var(--color-muted)] leading-relaxed">{s.description}</div>}
                </div>
              </div>
            );
            return (
              <li key={s.id}>
                {s.website_url ? (
                  <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="block transition active:scale-[0.99]">
                    {card}
                  </a>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
