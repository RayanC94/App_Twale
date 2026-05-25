import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/service";

export const revalidate = 60;
export const metadata = { title: "Food truck" };

type FoodItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  category: string | null;
  image_url: string | null;
  position: number | null;
};

const CATEGORY_ORDER = ["Plats", "Sandwichs", "Boissons", "Desserts"];

async function getItems(): Promise<FoodItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("foodtruck_items")
    .select("id,name,description,price_cents,category,image_url,position")
    .eq("available", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

function formatPrice(cents: number | null): string | null {
  if (cents === null || cents === undefined) return null;
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function groupByCategory(items: FoodItem[]): Array<{ category: string; items: FoodItem[] }> {
  const map = new Map<string, FoodItem[]>();
  for (const item of items) {
    const key = item.category ?? "Autres";
    const arr = map.get(key);
    if (arr) arr.push(item);
    else map.set(key, [item]);
  }
  const known = CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }));
  const others = [...map.entries()]
    .filter(([c]) => !CATEGORY_ORDER.includes(c))
    .map(([category, items]) => ({ category, items }));
  return [...known, ...others];
}

export default async function FoodPage() {
  const items = await getItems();
  const groups = groupByCategory(items);

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Sur place</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Food truck & buvette</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">Pause déjeuner 12h45 – 14h.</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {items.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--color-muted)] py-12">
            Le menu sera disponible bientôt.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((g) => (
              <div key={g.category}>
                <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
                  {g.category}
                </h2>
                <ul className="mt-3 space-y-3">
                  {g.items.map((item) => {
                    const price = formatPrice(item.price_cents);
                    return (
                      <li
                        key={item.id}
                        className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] shadow-sm"
                      >
                        {item.image_url && (
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-omas-cream)]">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="font-semibold text-[color:var(--color-foreground)]">
                              {item.name}
                            </h3>
                            {price && (
                              <span className="shrink-0 font-mono tabular-nums text-sm font-semibold text-[color:var(--color-omas-teal)]">
                                {price}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-1 text-xs text-[color:var(--color-muted)] leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
