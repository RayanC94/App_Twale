import { createServiceClient } from "@/lib/supabase/service";
import SiteMap from "@/components/public/SiteMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan du site" };

type PoiKind = "field" | "health" | "foodtruck" | "infirmary" | "wc" | "water" | "entrance" | "other";

type Poi = {
  id: string;
  kind: PoiKind;
  label: string;
  description: string | null;
};

const KIND_META: Record<PoiKind, { label: string; icon: string; anchor?: string }> = {
  field:     { label: "Terrains",        icon: "🏟️" },
  health:    { label: "Village santé",   icon: "💚" },
  foodtruck: { label: "Food truck",      icon: "🍔" },
  infirmary: { label: "Infirmerie",      icon: "🚑", anchor: "infirmerie" },
  wc:        { label: "Toilettes",       icon: "🚻" },
  water:     { label: "Points d'eau",    icon: "💧" },
  entrance:  { label: "Entrée",          icon: "🚪" },
  other:     { label: "Autres",          icon: "📍" },
};

const KIND_ORDER: PoiKind[] = ["field", "health", "foodtruck", "infirmary", "wc", "water", "entrance", "other"];

async function getPois(): Promise<Poi[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("map_pois")
    .select("id,kind,label,description")
    .order("kind", { ascending: true })
    .order("label", { ascending: true });
  if (error || !data) return [];
  return data;
}

function groupByKind(pois: Poi[]): Array<{ kind: PoiKind; items: Poi[] }> {
  const map = new Map<PoiKind, Poi[]>();
  for (const p of pois) {
    const arr = map.get(p.kind);
    if (arr) arr.push(p);
    else map.set(p.kind, [p]);
  }
  return KIND_ORDER.filter((k) => map.has(k)).map((k) => ({ kind: k, items: map.get(k)! }));
}

export default async function CartePage() {
  const pois = await getPois();
  const groups = groupByKind(pois);

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Stade Jean Bouin · Choisy</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Plan du site</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Repérez les terrains, les stands et les points pratiques.
          </p>
        </div>
      </header>

      {/* Plan visuel interactif */}
      <SiteMap />

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {pois.length === 0 ? null : (
          <div className="space-y-6">
            {groups.map((g) => {
              const meta = KIND_META[g.kind];
              return (
                <div
                  key={g.kind}
                  id={meta.anchor}
                  className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] shadow-sm scroll-mt-20"
                >
                  <h2 className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
                    <span className="text-xl" aria-hidden>{meta.icon}</span>
                    {meta.label}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((poi) => (
                      <li
                        key={poi.id}
                        className="rounded-xl bg-[color:var(--color-omas-cream)] p-3 ring-1 ring-[color:var(--color-border)]"
                      >
                        <div className="font-medium text-sm text-[color:var(--color-foreground)]">
                          {poi.label}
                        </div>
                        {poi.description && (
                          <p className="mt-0.5 text-xs text-[color:var(--color-muted)] leading-relaxed">
                            {poi.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

      </section>
    </main>
  );
}
