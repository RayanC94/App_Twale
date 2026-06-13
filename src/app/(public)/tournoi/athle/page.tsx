import Link from "next/link";
import { ATHLETICS_EVENTS, TOURNOI_DATE_ISO } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Stage = "series" | "finale";
type Gender = "H" | "F";

/** Heure locale "HH:MM" → ISO daté (CEST, +02:00 le 14 juin 2026). */
function toIso(time: string): string {
  return `${TOURNOI_DATE_ISO}T${time}:00+02:00`;
}

function formatHour(time: string): string {
  return new Date(toIso(time)).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

export const metadata = { title: "Athlétisme — Tournoi" };

export default async function AthlePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const stage: Stage = sp.stage === "finale" ? "finale" : "series";
  const gender: Gender = sp.cat === "F" ? "F" : "H";
  const now = new Date().getTime();

  const events = ATHLETICS_EVENTS.filter((e) => e.stage === stage && e.gender === gender)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  const stageHref = (s: Stage) => `/tournoi/athle?stage=${s}&cat=${gender}`;
  const catHref = (g: Gender) => `/tournoi/athle?stage=${stage}&cat=${g}`;

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <Link href="/tournoi" className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> Tournoi
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-4xl" aria-hidden>🏃</div>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">Athlétisme</h1>
          </div>
          <p className="mt-2 text-sm text-white/85">
            100m · 400m · 800m · 3km · Relais 4×100 & 4×400 (H/F).
          </p>

          <nav className="mt-5 inline-flex rounded-full bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur">
            <Link
              href={stageHref("series")}
              aria-current={stage === "series" ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                stage === "series" ? "bg-white text-[color:var(--color-omas-navy)]" : "text-white/85 hover:text-white"
              }`}
            >
              Séries
            </Link>
            <Link
              href={stageHref("finale")}
              aria-current={stage === "finale" ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                stage === "finale" ? "bg-white text-[color:var(--color-omas-navy)]" : "text-white/85 hover:text-white"
              }`}
            >
              Finales
            </Link>
          </nav>

          <nav className="mt-3 inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur ml-3">
            <Link
              href={catHref("H")}
              aria-current={gender === "H" ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                gender === "H" ? "bg-white text-[color:var(--color-omas-navy)]" : "text-white/85 hover:text-white"
              }`}
            >
              Hommes
            </Link>
            <Link
              href={catHref("F")}
              aria-current={gender === "F" ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                gender === "F" ? "bg-white text-[color:var(--color-omas-navy)]" : "text-white/85 hover:text-white"
              }`}
            >
              Femmes
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {/* Le matin : inscriptions sur place */}
        <div className="flex items-start gap-3 rounded-2xl bg-[color:var(--color-omas-cream)] p-4 ring-1 ring-[color:var(--color-border)]">
          <span className="text-xl" aria-hidden>📋</span>
          <p className="text-sm text-[color:var(--color-foreground)]">
            <strong>Inscriptions le matin sur place</strong> (9h25 – 12h35), au stand athlétisme. Les épreuves se
            courent l’après-midi.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
            Aucune épreuve dans cette catégorie.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {events.map((e, i) => {
              const start = new Date(toIso(e.time)).getTime();
              const live = now >= start && now <= start + 15 * 60 * 1000;
              const past = now > start + 15 * 60 * 1000;
              return (
                <li
                  key={`${e.name}-${e.time}-${i}`}
                  className={`rounded-2xl bg-white p-4 ring-1 ${
                    live
                      ? "ring-[color:var(--color-omas-teal)] shadow-lg shadow-[color:var(--color-omas-teal)]/10"
                      : "ring-[color:var(--color-border)]"
                  } ${past ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-xs font-mono tabular-nums text-[color:var(--color-omas-navy)] shrink-0">
                        {formatHour(e.time)}
                      </div>
                      <h3 className="font-semibold text-[color:var(--color-foreground)] truncate">{e.name}</h3>
                    </div>
                    {live ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-omas-teal)] text-white px-2 py-0.5 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> En cours
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-muted)]/15 text-[color:var(--color-muted)] px-2 py-0.5 shrink-0">
                        {past ? "Passé" : "À venir"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
