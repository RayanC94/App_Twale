import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import MatchCard, { type MatchCardData } from "@/components/public/MatchCard";
import RealtimeRefresh from "@/components/public/RealtimeRefresh";

export const revalidate = 30;
export const metadata = { title: "Équipe — Tournoi" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Team = { id: string; name: string; sport: "foot" | "volley"; gender: "H" | "F" | "mixte" };

type RawMatch = {
  id: string;
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

function normalize(rows: RawMatch[]): MatchCardData[] {
  return rows.map((m) => ({
    id: m.id,
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

async function getTeam(id: string): Promise<Team | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("teams").select("id,name,sport,gender").eq("id", id).maybeSingle();
  return (data as Team | null) ?? null;
}

async function getTeamMatches(id: string): Promise<MatchCardData[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "id,scheduled_at,status,score_home,score_away,placeholder_home,placeholder_away," +
        "team_home:teams!matches_team_home_id_fkey(name)," +
        "team_away:teams!matches_team_away_id_fkey(name)," +
        "field:fields(name)",
    )
    .or(`team_home_id.eq.${id},team_away_id.eq.${id}`)
    .order("scheduled_at", { ascending: true });
  return normalize((data ?? []) as unknown as RawMatch[]);
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [team, matches] = await Promise.all([getTeam(id), getTeamMatches(id)]);
  if (!team) notFound();

  const upcoming = matches.filter((m) => m.status === "scheduled" || m.status === "live");
  const done = matches.filter((m) => m.status === "finished" || m.status === "cancelled");
  const backHref = `/tournoi/${team.sport}`;
  const backLabel = team.sport === "foot" ? "Foot" : "Volley";

  return (
    <main className="min-h-dvh">
      <RealtimeRefresh />
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> {backLabel}
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-4xl" aria-hidden>{team.sport === "foot" ? "⚽" : "🏐"}</div>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">{team.name}</h1>
          </div>
          <p className="mt-2 text-sm text-white/85">
            {matches.length === 0
              ? "Aucun match programmé pour le moment."
              : `${matches.length} match${matches.length > 1 ? "s" : ""} au programme.`}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            À venir & en cours
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              Aucun match à venir.
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

        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Matchs joués
          </h2>
          {done.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              Aucun match joué pour l&apos;instant.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {done.map((m) => (
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
