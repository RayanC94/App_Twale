import Link from "next/link";
import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";
import MatchManager, {
  type AdminMatch,
  type FieldOption,
  type PoolWithTeams,
  type TeamOption,
} from "./MatchManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Matchs" };

type Sport = "foot" | "volley";
type Gender = "H" | "F" | "mixte";

type RawPool = {
  id: string;
  label: string;
  pool_teams: { team: { id: string; name: string } | { id: string; name: string }[] | null }[] | null;
};

type RawMatch = {
  id: string;
  stage: string;
  scheduled_at: string;
  status: AdminMatch["status"];
  score_home: number | null;
  score_away: number | null;
  placeholder_home: string | null;
  placeholder_away: string | null;
  pool_id: string | null;
  team_home: { name: string } | { name: string }[] | null;
  team_away: { name: string } | { name: string }[] | null;
  field: { name: string } | { name: string }[] | null;
};

function pickOne<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

async function getData(sport: Sport, gender: Gender) {
  const supabase = createServiceClient();
  const [{ data: teams }, { data: pools }, { data: fields }, { data: matches }] = await Promise.all([
    supabase.from("teams").select("id,name").eq("sport", sport).eq("gender", gender).order("name"),
    supabase
      .from("pools")
      .select("id,label,pool_teams(team:teams(id,name))")
      .eq("sport", sport)
      .eq("gender", gender)
      .order("label"),
    supabase.from("fields").select("id,name").eq("sport", sport).order("name"),
    supabase
      .from("matches")
      .select(
        "id,stage,scheduled_at,status,score_home,score_away,placeholder_home,placeholder_away,pool_id," +
          "team_home:teams!matches_team_home_id_fkey(name)," +
          "team_away:teams!matches_team_away_id_fkey(name)," +
          "field:fields(name)",
      )
      .eq("sport", sport)
      .eq("gender", gender)
      .order("scheduled_at", { ascending: true }),
  ]);

  const normalizedPools: PoolWithTeams[] = ((pools ?? []) as unknown as RawPool[]).map((p) => ({
    id: p.id,
    label: p.label,
    teams: (p.pool_teams ?? [])
      .map((pt) => pickOne(pt.team))
      .filter((t): t is { id: string; name: string } => t !== null),
  }));

  const normalizedMatches: AdminMatch[] = ((matches ?? []) as unknown as RawMatch[]).map((m) => ({
    id: m.id,
    stage: m.stage,
    scheduled_at: m.scheduled_at,
    status: m.status,
    score_home: m.score_home,
    score_away: m.score_away,
    pool_id: m.pool_id,
    home_label: pickOne(m.team_home)?.name ?? m.placeholder_home ?? "À définir",
    away_label: pickOne(m.team_away)?.name ?? m.placeholder_away ?? "À définir",
    field_name: pickOne(m.field)?.name ?? null,
  }));

  return {
    teams: (teams ?? []) as TeamOption[],
    pools: normalizedPools,
    fields: (fields ?? []) as FieldOption[],
    matches: normalizedMatches,
  };
}

export default async function AdminMatchsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const staff = await requireStaff();
  const sp = await searchParams;

  const sport: Sport = staff.sport ?? (sp.sport === "volley" ? "volley" : "foot");
  // Foot : tournoi hommes uniquement (décision du 12 juin) ; volley : mixte.
  const gender: Gender = sport === "volley" ? "mixte" : "H";
  const { teams, pools, fields, matches } = await getData(sport, gender);

  const sportTab = (s: Sport, label: string) => (
    <Link
      href={`/admin/matchs?sport=${s}`}
      aria-current={sport === s ? "page" : undefined}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        sport === s ? "bg-white text-[color:var(--color-omas-navy)]" : "text-white/85 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <div className="text-3xl" aria-hidden>🏆</div>
        <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Tournoi {sport === "foot" ? "foot" : "volley"}
        </h1>
        <p className="mt-2 text-sm text-white/85">
          Poules, programme des matchs et saisie des scores en direct.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!staff.sport && (
            <nav className="inline-flex rounded-full bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur">
              {sportTab("foot", "⚽ Foot")}
              {sportTab("volley", "🏐 Volley")}
            </nav>
          )}
        </div>
      </section>

      <section className="mt-6">
        <MatchManager
          sport={sport}
          gender={gender}
          teams={teams}
          pools={pools}
          fields={fields}
          matches={matches}
        />
      </section>
    </div>
  );
}
