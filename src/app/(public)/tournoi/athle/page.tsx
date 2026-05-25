import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Stage = "series" | "demi" | "finale";
type Gender = "H" | "F";
type EventStatus = "scheduled" | "live" | "finished" | "cancelled";

type EventRow = {
  id: string;
  name: string;
  gender: Gender;
  stage: Stage;
  unit: string;
  lower_is_better: boolean;
  scheduled_at: string | null;
  status: EventStatus;
  position: number | null;
};

type ResultRow = {
  event_id: string;
  performance: number;
  rank: number | null;
  athlete: { full_name: string; bib_number: string | null } | { full_name: string; bib_number: string | null }[] | null;
};

type Podium = {
  rank: number;
  full_name: string;
  bib_number: string | null;
  performance: number;
};

function formatHour(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function formatPerf(value: number, unit: string) {
  if (unit === "s") {
    if (value >= 60) {
      const min = Math.floor(value / 60);
      const sec = value - min * 60;
      return `${min}:${sec.toFixed(2).padStart(5, "0")}`;
    }
    return `${value.toFixed(2)} s`;
  }
  return `${value.toFixed(2)} ${unit}`;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  scheduled: "À venir",
  live: "En cours",
  finished: "Terminé",
  cancelled: "Annulé",
};

async function getEvents(stage: Stage, gender: Gender) {
  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from("athletics_events")
    .select("id,name,gender,stage,unit,lower_is_better,scheduled_at,status,position")
    .eq("stage", stage)
    .eq("gender", gender)
    .order("position", { ascending: true })
    .order("scheduled_at", { ascending: true });

  const rows = (events ?? []) as EventRow[];

  const finishedFinaleIds = rows
    .filter((e) => e.stage === "finale" && e.status === "finished")
    .map((e) => e.id);

  const podiumsByEvent = new Map<string, Podium[]>();
  if (finishedFinaleIds.length > 0) {
    const { data: results } = await supabase
      .from("event_results")
      .select("event_id,performance,rank,athlete:athletes(full_name,bib_number)")
      .in("event_id", finishedFinaleIds);
    const rs = (results ?? []) as ResultRow[];
    rs.forEach((r) => {
      if (r.rank == null || r.rank > 3) return;
      const athleteRaw = Array.isArray(r.athlete) ? r.athlete[0] : r.athlete;
      if (!athleteRaw) return;
      const arr = podiumsByEvent.get(r.event_id) ?? [];
      arr.push({
        rank: r.rank,
        full_name: athleteRaw.full_name,
        bib_number: athleteRaw.bib_number,
        performance: Number(r.performance),
      });
      podiumsByEvent.set(r.event_id, arr);
    });
    for (const arr of podiumsByEvent.values()) arr.sort((a, b) => a.rank - b.rank);
  }

  return { events: rows, podiumsByEvent };
}

export const metadata = { title: "Athlétisme — Tournoi" };

export default async function AthlePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const stage: Stage = sp.stage === "finale" ? "finale" : sp.stage === "demi" ? "demi" : "series";
  const gender: Gender = sp.cat === "F" ? "F" : "H";
  const { events, podiumsByEvent } = await getEvents(stage, gender);

  const stageHref = (s: Stage) => `/tournoi/athle?stage=${s}&cat=${gender}`;
  const catHref = (g: Gender) => `/tournoi/athle?stage=${stage}&cat=${g}`;

  const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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
        {events.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
            Les épreuves seront affichées dès que le programme aura été publié.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => {
              const isLive = e.status === "live";
              const isFinished = e.status === "finished";
              const podium = podiumsByEvent.get(e.id);
              return (
                <li
                  key={e.id}
                  className={`rounded-2xl bg-white p-4 ring-1 ${
                    isLive
                      ? "ring-[color:var(--color-omas-teal)] shadow-lg shadow-[color:var(--color-omas-teal)]/10"
                      : "ring-[color:var(--color-border)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-xs font-mono tabular-nums text-[color:var(--color-omas-navy)] shrink-0">
                        {formatHour(e.scheduled_at)}
                      </div>
                      <h3 className="font-semibold text-[color:var(--color-foreground)] truncate">{e.name}</h3>
                    </div>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-omas-teal)] text-white px-2 py-0.5 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> En cours
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-muted)]/15 text-[color:var(--color-muted)] px-2 py-0.5 shrink-0">
                        {STATUS_LABEL[e.status]}
                      </span>
                    )}
                  </div>

                  {e.stage === "finale" && isFinished && podium && podium.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {podium.map((p) => (
                        <li
                          key={p.rank}
                          className="flex items-center gap-3 rounded-xl bg-[color:var(--color-omas-cream)] px-3 py-1.5"
                        >
                          <span className="text-base" aria-hidden>
                            {MEDAL[p.rank] ?? p.rank}
                          </span>
                          <span className="flex-1 text-sm font-medium text-[color:var(--color-foreground)] truncate">
                            {p.full_name}
                            {p.bib_number && (
                              <span className="ml-1.5 text-xs text-[color:var(--color-muted)]">#{p.bib_number}</span>
                            )}
                          </span>
                          <span className="text-xs font-mono tabular-nums text-[color:var(--color-omas-navy)]">
                            {formatPerf(p.performance, e.unit)}
                          </span>
                        </li>
                      ))}
                    </ul>
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
