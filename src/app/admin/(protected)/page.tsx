import Link from "next/link";
import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Stats = {
  teams: number;
  scheduled: number;
  live: number;
  finished: number;
  athletics: number;
};

async function getStats(): Promise<Stats> {
  const supabase = createServiceClient();
  const [teams, scheduled, live, finished, athletics] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "live"),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "finished"),
    supabase.from("athletics_events").select("id", { count: "exact", head: true }),
  ]);

  return {
    teams: teams.count ?? 0,
    scheduled: scheduled.count ?? 0,
    live: live.count ?? 0,
    finished: finished.count ?? 0,
    athletics: athletics.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const staff = await requireStaff();
  const stats = await getStats();

  const cards: Array<{ label: string; value: number; tint: "teal" | "navy" | "purple" }> = [
    { label: "Équipes inscrites", value: stats.teams, tint: "teal" },
    { label: "Matchs prévus", value: stats.scheduled, tint: "navy" },
    { label: "Matchs en cours", value: stats.live, tint: "purple" },
    { label: "Matchs terminés", value: stats.finished, tint: "navy" },
    { label: "Épreuves athlé", value: stats.athletics, tint: "teal" },
  ];

  const tintClass: Record<"teal" | "navy" | "purple", string> = {
    teal: "text-[color:var(--color-omas-teal)]",
    navy: "text-[color:var(--color-omas-navy)]",
    purple: "text-[color:var(--color-twale-purple)]",
  };

  const quickLinks: Array<{ href: string; icon: string; label: string; desc: string; adminOnly?: boolean }> = [
    { href: "/admin/matchs", icon: "🏆", label: "Matchs", desc: "Démarrer, scores, terminer" },
    { href: "/admin/equipes", icon: "👥", label: "Équipes", desc: "Inscriptions & poules" },
    { href: "/admin/live", icon: "📺", label: "Live vidéo", desc: "Liens caméras XbotGo", adminOnly: true },
    { href: "/admin/sondage", icon: "💬", label: "Sondage & quiz", desc: "Réponses du public", adminOnly: true },
    { href: "/admin/athle", icon: "🏃", label: "Athlé", desc: "Épreuves & résultats" },
  ].filter((l) => !l.adminOnly || staff.role === "admin");

  return (
    <div>
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-white/80">
          Tableau de bord
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Bienvenue, {staff.display_name}
        </h1>
        <p className="mt-2 text-sm text-white/85">
          Village santé & Tournoi multisports · dimanche 14 juin 2026
        </p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-border)]"
          >
            <div
              className={`font-[family-name:var(--font-outfit)] text-3xl font-bold ${tintClass[c.tint]}`}
            >
              {c.value}
            </div>
            <div className="mt-1 text-xs font-medium text-[color:var(--color-muted)]">
              {c.label}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="px-1 font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
          Accès rapide
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col gap-1 rounded-2xl bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-border)] transition active:scale-[0.99] hover:ring-[color:var(--color-omas-teal)]/50"
            >
              <span className="text-2xl" aria-hidden>{l.icon}</span>
              <span className="mt-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">{l.label}</span>
              <span className="text-xs text-[color:var(--color-muted)]">{l.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
