import Lightbox from "@/components/public/Lightbox";
import { FOOD_TRUCKS } from "@/lib/constants";

export const metadata = { title: "Food trucks" };

export default function FoodPage() {
  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Sur place</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Food trucks</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Deux food trucks, salé et sucré. Pause déjeuner 12h45 – 14h.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
        {FOOD_TRUCKS.map((truck) => {
          const isSale = truck.kind === "Salé";
          return (
            <article
              key={truck.slug}
              className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-[color:var(--color-omas-navy)]">
                    {truck.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">{truck.tagline}</p>
                </div>
                <span
                  className={
                    isSale
                      ? "shrink-0 rounded-full bg-[color:var(--color-omas-teal)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--color-omas-teal)]"
                      : "shrink-0 rounded-full bg-[color:var(--color-twale-purple)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--color-twale-purple)]"
                  }
                >
                  {truck.kind}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
                {truck.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[color:var(--color-foreground)]">{item.name}</span>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">{item.detail}</p>
                      )}
                    </div>
                    {item.price && (
                      <span className="shrink-0 font-mono tabular-nums text-sm font-semibold text-[color:var(--color-omas-teal)]">
                        {item.price}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {truck.note && <p className="mt-3 text-xs text-[color:var(--color-muted)]">{truck.note}</p>}
            </article>
          );
        })}

        <div className="pt-2">
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Les menus en affiche
          </h2>
          <div className="mt-3">
            <Lightbox
              photos={FOOD_TRUCKS.map((t) => ({
                id: t.slug,
                fullUrl: t.poster,
                thumbUrl: t.poster,
                caption: t.name,
              }))}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
