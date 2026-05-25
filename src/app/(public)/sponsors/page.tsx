import { createServiceClient } from "@/lib/supabase/service";
import Image from "next/image";

export const revalidate = 120;
export const metadata = { title: "Partenaires" };

type Sponsor = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  website_url: string | null;
  tier: string | null;
};

async function getSponsors(): Promise<Sponsor[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("sponsors")
    .select("id,name,description,logo_url,website_url,tier")
    .order("position", { ascending: true });
  return data ?? [];
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">Partenaires</h1>
          <p className="mt-2 text-sm text-white/85">Merci à celles et ceux qui rendent l'événement possible.</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {sponsors.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--color-muted)] py-12">
            Les partenaires seront affichés ici prochainement.
          </p>
        ) : (
          <ul className="space-y-3">
            {sponsors.map((s) => {
              const card = (
                <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] shadow-sm">
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-[color:var(--color-omas-cream)] flex items-center justify-center overflow-hidden">
                    <Image src={s.logo_url} alt={s.name} width={64} height={64} className="object-contain" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[color:var(--color-foreground)]">{s.name}</div>
                    {s.description && <div className="mt-0.5 text-xs text-[color:var(--color-muted)]">{s.description}</div>}
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
        )}
      </section>
    </main>
  );
}
