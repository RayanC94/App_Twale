import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import PoolStandings from "@/components/public/PoolStandings";
import MatchCard, { type MatchCardData } from "@/components/public/MatchCard";
import LiveStreamBanner from "@/components/public/LiveStreamBanner";
import RealtimeRefresh from "@/components/public/RealtimeRefresh";
import { getLiveStreams } from "@/lib/live";

export const revalidate = 15;

const STAGES_BRACKET = ["qf", "sf", "final", "third"] as const;

const STAGE_LABEL: Record<string, string> = {
  qf: "Quarts de finale",
  sf: "Demi-finales",
  final: "Finale",
  third: "Match pour la 3e place",
};

type RawMatch = {
  id: string;
  stage: string;
  scheduled_at: string;
  status: MatchCardData["status"];
  score_home: number | null;
  score_away: number | null;
  placeholder_home: string | null;
  placeholder_away: string | null;
  team_home: { name: string } | { name: string }[] | null;
  team_away: { name: string } | { name: string }[] | null;
  field: { name: string } | { name: string }[] | null;
};

function normalize(rows: RawMatch[]): (MatchCardData & { stage: string })[] {
  return rows.map((m) => ({
    id: m.id,
    stage: m.stage,
    scheduled_at: m.scheduled_at,
    status: m.status,
    score_home: m.score_home,
    score_away: m.score_away,
    placeholder_home: m.placeholder_home,
    placeholder_away: m.placeholder_away,
    team_home: Array.isArray(m.team_home) ? m.team_home[0] ?? null : m.team_home,
    team_away: Array.isArray(m.team_away) ? m.team_away[0] ?? null : m.team_away,
    field: Array.isArray(m.field) ? m.field[0] ?? null : m.field,
  }));
}

async function getMatches() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "id,stage,scheduled_at,status,score_home,score_away,placeholder_home,placeholder_away," +
        "team_home:teams!matches_team_home_id_fkey(name)," +
        "team_away:teams!matches_team_away_id_fkey(name)," +
        "field:fields(name)",
    )
    .eq("sport", "foot")
    .eq("gender", "H")
    .order("scheduled_at", { ascending: true });
  return normalize((data ?? []) as unknown as RawMatch[]);
}

export const metadata = { title: "Foot — Tournoi" };

export default async function FootPage() {
  const [matches, streams] = await Promise.all([getMatches(), getLiveStreams()]);

  const bracket = matches.filter((m) => (STAGES_BRACKET as readonly string[]).includes(m.stage));
  const nowIso = new Date().toISOString();
  const upcoming = matches
    .filter((m) => m.status === "scheduled" && m.scheduled_at >= nowIso)
    .slice(0, 3);

  const bracketByStage = STAGES_BRACKET.map((s) => ({
    stage: s,
    label: STAGE_LABEL[s],
    matches: bracket.filter((m) => m.stage === s),
  })).filter((g) => g.matches.length > 0);

  return (
    <main className="min-h-dvh">
      <RealtimeRefresh />
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <Link href="/tournoi" className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> Tournoi
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-4xl" aria-hidden>⚽</div>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">Foot</h1>
          </div>
          <p className="mt-2 text-sm text-white/85">
            16 équipes · 3 terrains. Poules puis phase finale.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-8">
        <LiveStreamBanner
          href={streams.foot}
          label="Matchs de foot en direct vidéo"
          sublabel="Suivi live des terrains (XbotGo)"
        />

        {/* Poules */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Phase de poules
          </h2>
          <div className="mt-3">
            <PoolStandings sport="foot" gender="H" />
          </div>
        </div>

        {/* Phase finale */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Phase finale
          </h2>
          {bracketByStage.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              Le tableau final s'affichera dès la fin des poules.
            </p>
          ) : (
            <div className="mt-3 space-y-5">
              {bracketByStage.map((g) => (
                <div key={g.stage}>
                  <h3 className="px-2 text-xs font-semibold text-[color:var(--color-omas-navy)]">{g.label}</h3>
                  <ul className="mt-2 space-y-2">
                    {g.matches.map((m) => (
                      <li key={m.id}>
                        <MatchCard match={m} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prochains matchs */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Prochains matchs
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              Aucun match à venir pour l'instant.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((m) => (
                <li key={m.id}>
                  <MatchCard match={m} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
