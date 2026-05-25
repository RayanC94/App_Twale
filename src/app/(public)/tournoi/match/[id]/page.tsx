import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import LiveScore from "@/components/public/LiveScore";

export const dynamic = "force-dynamic";

type Status = "scheduled" | "live" | "finished" | "cancelled";

type MatchDetail = {
  id: string;
  sport: "foot" | "volley";
  gender: "H" | "F" | "mixte";
  stage: string;
  scheduled_at: string;
  status: Status;
  score_home: number | null;
  score_away: number | null;
  placeholder_home: string | null;
  placeholder_away: string | null;
  team_home: { name: string; color: string | null } | null;
  team_away: { name: string; color: string | null } | null;
  field: { name: string } | null;
};

const STAGE_LABEL: Record<string, string> = {
  group: "Phase de poules",
  qf: "Quart de finale",
  sf: "Demi-finale",
  final: "Finale",
  third: "Match pour la 3e place",
};

const SPORT_LABEL: Record<string, string> = {
  foot: "Foot",
  volley: "Volley",
};

const GENDER_LABEL: Record<string, string> = {
  H: "Hommes",
  F: "Femmes",
  mixte: "Mixte",
};

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function pickOne<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

async function getMatch(id: string): Promise<MatchDetail | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "id,sport,gender,stage,scheduled_at,status,score_home,score_away,placeholder_home,placeholder_away," +
        "team_home:teams!matches_team_home_id_fkey(name,color)," +
        "team_away:teams!matches_team_away_id_fkey(name,color)," +
        "field:fields(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type Row = {
    id: string;
    sport: "foot" | "volley";
    gender: "H" | "F" | "mixte";
    stage: string;
    scheduled_at: string;
    status: Status;
    score_home: number | null;
    score_away: number | null;
    placeholder_home: string | null;
    placeholder_away: string | null;
    team_home: { name: string; color: string | null } | { name: string; color: string | null }[] | null;
    team_away: { name: string; color: string | null } | { name: string; color: string | null }[] | null;
    field: { name: string } | { name: string }[] | null;
  };
  const r = data as unknown as Row;
  return {
    id: r.id,
    sport: r.sport,
    gender: r.gender,
    stage: r.stage,
    scheduled_at: r.scheduled_at,
    status: r.status,
    score_home: r.score_home,
    score_away: r.score_away,
    placeholder_home: r.placeholder_home,
    placeholder_away: r.placeholder_away,
    team_home: pickOne(r.team_home),
    team_away: pickOne(r.team_away),
    field: pickOne(r.field),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match" };
  const home = match.team_home?.name ?? match.placeholder_home ?? "À définir";
  const away = match.team_away?.name ?? match.placeholder_away ?? "À définir";
  return { title: `${home} vs ${away}` };
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();

  const home = match.team_home?.name ?? match.placeholder_home ?? "À définir";
  const away = match.team_away?.name ?? match.placeholder_away ?? "À définir";
  const sportPath = match.sport === "foot" ? "/tournoi/foot" : "/tournoi/volley";
  const backHref =
    match.sport === "foot"
      ? `/tournoi/foot?cat=${match.gender === "F" ? "F" : "H"}`
      : "/tournoi/volley";

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-6 pb-10">
          <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> {SPORT_LABEL[match.sport]}
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/80">
            {SPORT_LABEL[match.sport]} · {GENDER_LABEL[match.gender]} · {STAGE_LABEL[match.stage] ?? match.stage}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold text-balance">
            {home}
            <span className="px-2 text-white/70">vs</span>
            {away}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs ring-1 ring-white/25">
              ⏱ {formatHour(match.scheduled_at)}
            </span>
            {match.field?.name && (
              <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs ring-1 ring-white/25">
                📍 {match.field.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-4">
        {/* Scoreboard */}
        {match.status === "cancelled" ? (
          <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
              Match annulé
            </p>
          </div>
        ) : (
          <>
            <LiveScore
              matchId={match.id}
              initialScoreHome={match.score_home}
              initialScoreAway={match.score_away}
              initialStatus={match.status}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                  Domicile
                </p>
                <p className="mt-1 font-semibold text-[color:var(--color-foreground)] text-balance">{home}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)] text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                  Extérieur
                </p>
                <p className="mt-1 font-semibold text-[color:var(--color-foreground)] text-balance">{away}</p>
              </div>
            </div>
          </>
        )}

        <p className="text-center text-xs text-[color:var(--color-muted)]">
          <Link href={sportPath} className="underline underline-offset-2 hover:text-[color:var(--color-omas-teal)]">
            Voir tous les matchs {SPORT_LABEL[match.sport]}
          </Link>
        </p>
      </section>
    </main>
  );
}
