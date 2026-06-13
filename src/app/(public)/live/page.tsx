import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import MatchCard, { type MatchCardData } from "@/components/public/MatchCard";
import LiveVideo from "@/components/public/LiveVideo";
import { getLiveStreams } from "@/lib/live";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live" };

type RawMatch = {
  id: string;
  sport: "foot" | "volley";
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

function normalize(rows: RawMatch[]): (MatchCardData & { sport: "foot" | "volley" })[] {
  return rows.map((m) => ({
    id: m.id,
    sport: m.sport,
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

async function getLiveMatches() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "id,sport,scheduled_at,status,score_home,score_away,placeholder_home,placeholder_away," +
        "team_home:teams!matches_team_home_id_fkey(name)," +
        "team_away:teams!matches_team_away_id_fkey(name)," +
        "field:fields(name)",
    )
    .eq("status", "live")
    .order("scheduled_at", { ascending: true });
  return normalize((data ?? []) as unknown as RawMatch[]);
}

export default async function LivePage() {
  const [liveMatches, streams] = await Promise.all([getLiveMatches(), getLiveStreams()]);
  const hasStream = Boolean(streams.foot || streams.volley || streams.sante);

  return (
    <main className="min-h-dvh">
      <header className="bg-mixte-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Dimanche 14 juin 2026</p>
          <h1 className="mt-2 flex items-center gap-2.5 font-[family-name:var(--font-outfit)] text-3xl font-bold">
            <span className="relative flex h-3.5 w-3.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
            </span>
            Live
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Matchs en direct vidéo et scores en temps réel, où que vous soyez.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
        {/* Diffusions vidéo */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Diffusion vidéo
          </h2>
          {hasStream ? (
            <div className="mt-3 space-y-3">
              <LiveVideo
                url={streams.foot}
                label="Foot en direct vidéo"
                sublabel="Diffusion live des matchs (XbotGo)"
              />
              <LiveVideo
                url={streams.volley}
                label="Volley en direct vidéo"
                sublabel="Diffusion live des matchs (XbotGo)"
              />
              <LiveVideo
                url={streams.sante}
                label="Le village santé en direct"
                sublabel="Interventions et ateliers diffusés en vidéo"
              />
            </div>
          ) : (
            <p className="mt-3 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              La diffusion vidéo démarrera le jour J — revenez le 14 juin !
            </p>
          )}
        </div>

        {/* Matchs en cours */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Matchs en cours
          </h2>
          {liveMatches.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
              Aucun match en cours pour le moment.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {liveMatches.map((m) => (
                <li key={m.id}>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-lg" aria-hidden>
                      {m.sport === "foot" ? "⚽" : "🏐"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <MatchCard match={m} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-xs text-[color:var(--color-muted)]">
          <Link href="/tournoi" className="underline underline-offset-2 hover:text-[color:var(--color-omas-teal)]">
            Voir tout le tournoi
          </Link>
          {" · "}
          <Link href="/galerie" className="underline underline-offset-2 hover:text-[color:var(--color-omas-teal)]">
            Galerie photo
          </Link>
        </p>
      </section>
    </main>
  );
}
