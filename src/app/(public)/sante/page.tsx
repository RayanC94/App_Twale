import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import LiveStreamBanner from "@/components/public/LiveStreamBanner";
import { SANTE_LIVE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Stand = {
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  position: number | null;
};

async function getStands(): Promise<Stand[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("health_stands")
    .select("slug,name,description,color,icon,position")
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

export const metadata = { title: "Village santé" };

export default async function SantePage() {
  const stands = await getStands();

  return (
    <main className="min-h-dvh">
      {/* Header */}
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Toute la journée · Place centrale</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Village santé</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Cinq stands tenus par des professionnels. Échanges libres, dépistages, ateliers, fiches récap à emporter.
          </p>
        </div>
      </header>

      {/* Stands */}
      <section className="mx-auto max-w-screen-sm px-4 py-6">
        <div className="mb-4 empty:hidden">
          <LiveStreamBanner
            href={SANTE_LIVE_URL}
            label="Le village santé en direct"
            sublabel="Interventions et ateliers diffusés en vidéo"
          />
        </div>
        <ul className="space-y-3">
          {stands.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/sante/${s.slug}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] shadow-sm transition active:scale-[0.99] hover:ring-[color:var(--color-omas-teal)]/40"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold text-lg"
                  style={{ backgroundColor: s.color ?? "var(--color-omas-teal)" }}
                  aria-hidden
                >
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[color:var(--color-omas-navy)]">{s.name}</div>
                  {s.description && (
                    <div className="mt-0.5 text-xs text-[color:var(--color-muted)] line-clamp-2">{s.description}</div>
                  )}
                </div>
                <div className="text-[color:var(--color-muted)]" aria-hidden>›</div>
              </Link>
            </li>
          ))}
        </ul>

        {stands.length === 0 && (
          <p className="text-center text-sm text-[color:var(--color-muted)] py-12">
            Les stands seront affichés ici prochainement.
          </p>
        )}
      </section>
    </main>
  );
}
