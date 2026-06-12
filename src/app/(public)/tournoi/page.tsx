import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import LiveStreamBanner from "@/components/public/LiveStreamBanner";
import { XBOTGO_STREAMS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SportSummary = {
  key: "foot" | "volley" | "athle";
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  count: string;
  next: { label: string; time: string } | null;
};

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

async function getTournoiSummaries(): Promise<SportSummary[]> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const [
    { count: footCount },
    { count: volleyCount },
    { count: athleCount },
    { data: footNext },
    { data: volleyNext },
    { data: athleNext },
  ] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }).eq("sport", "foot"),
    supabase.from("teams").select("id", { count: "exact", head: true }).eq("sport", "volley"),
    supabase.from("athletics_events").select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("scheduled_at,team_home:teams!matches_team_home_id_fkey(name),team_away:teams!matches_team_away_id_fkey(name),placeholder_home,placeholder_away")
      .eq("sport", "foot")
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true })
      .limit(1),
    supabase
      .from("matches")
      .select("scheduled_at,team_home:teams!matches_team_home_id_fkey(name),team_away:teams!matches_team_away_id_fkey(name),placeholder_home,placeholder_away")
      .eq("sport", "volley")
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true })
      .limit(1),
    supabase
      .from("athletics_events")
      .select("name,scheduled_at")
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true })
      .limit(1),
  ]);

  function nextMatchLabel(m: {
    scheduled_at: string;
    team_home: { name: string } | { name: string }[] | null;
    team_away: { name: string } | { name: string }[] | null;
    placeholder_home: string | null;
    placeholder_away: string | null;
  } | undefined) {
    if (!m) return null;
    const homeRaw = Array.isArray(m.team_home) ? m.team_home[0] : m.team_home;
    const awayRaw = Array.isArray(m.team_away) ? m.team_away[0] : m.team_away;
    const home = homeRaw?.name ?? m.placeholder_home ?? "À venir";
    const away = awayRaw?.name ?? m.placeholder_away ?? "À venir";
    return { label: `${home} vs ${away}`, time: formatHour(m.scheduled_at) };
  }

  return [
    {
      key: "foot",
      href: "/tournoi/foot",
      icon: "⚽",
      title: "Foot",
      subtitle: "Hommes & Femmes",
      count: footCount ? `${footCount} équipes` : "Équipes à confirmer",
      next: nextMatchLabel(footNext?.[0]),
    },
    {
      key: "volley",
      href: "/tournoi/volley",
      icon: "🏐",
      title: "Volley",
      subtitle: "Mixte",
      count: volleyCount ? `${volleyCount} équipes` : "Équipes à confirmer",
      next: nextMatchLabel(volleyNext?.[0]),
    },
    {
      key: "athle",
      href: "/tournoi/athle",
      icon: "🏃",
      title: "Athlétisme",
      subtitle: "Séries & Finales",
      count: athleCount ? `${athleCount} épreuves` : "Épreuves à confirmer",
      next: athleNext?.[0]
        ? { label: athleNext[0].name as string, time: formatHour(athleNext[0].scheduled_at as string) }
        : null,
    },
  ];
}

export const metadata = { title: "Tournoi" };

export default async function TournoiPage() {
  const summaries = await getTournoiSummaries();

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Dimanche 14 juin 2026</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Tournoi</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Suivez les poules, les phases finales et les épreuves. Scores en direct le jour J.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {(XBOTGO_STREAMS.foot || XBOTGO_STREAMS.volley) && (
          <div className="mb-4 space-y-2">
            <LiveStreamBanner
              href={XBOTGO_STREAMS.foot}
              label="Foot en direct vidéo"
              sublabel="Diffusion live des matchs (XbotGo)"
            />
            <LiveStreamBanner
              href={XBOTGO_STREAMS.volley}
              label="Volley en direct vidéo"
              sublabel="Diffusion live des matchs (XbotGo)"
            />
          </div>
        )}
        <ul className="space-y-3">
          {summaries.map((s) => (
            <li key={s.key}>
              <Link
                href={s.href}
                className="block rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] shadow-sm transition active:scale-[0.99] hover:ring-[color:var(--color-omas-teal)]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-omas-gradient text-3xl" aria-hidden>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
                      {s.title}
                    </div>
                    <div className="text-xs text-[color:var(--color-muted)]">{s.subtitle} · {s.count}</div>
                  </div>
                  <div className="text-[color:var(--color-muted)]" aria-hidden>›</div>
                </div>
                {s.next && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[color:var(--color-omas-cream)] px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-omas-teal)]">
                      Prochain
                    </span>
                    <span className="text-xs font-mono tabular-nums text-[color:var(--color-omas-navy)]">
                      {s.next.time}
                    </span>
                    <span className="text-xs text-[color:var(--color-muted)] truncate">{s.next.label}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-[color:var(--color-muted)]">
          Le programme complet est disponible dans le{" "}
          <Link href="/planning" className="underline underline-offset-2 hover:text-[color:var(--color-omas-teal)]">
            planning
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
