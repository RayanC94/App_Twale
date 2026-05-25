import Image from "next/image";
import Link from "next/link";
import { TOURNOI_DATE_LABEL, TOURNOI_HOURS, EVENT, ASSO, TOURNAMENT_CONFIG, HEALTH_STANDS } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/tournoi",  label: "Tournoi",       icon: "🏆", desc: "Foot · Volley · Athlé" },
  { href: "/planning", label: "Planning",      icon: "📅", desc: "Tous les matchs" },
  { href: "/sante",    label: "Village santé", icon: "💚", desc: "5 stands · Fiches PDF" },
  { href: "/carte",    label: "Carte du site", icon: "🗺️", desc: "Terrains, food truck…" },
  { href: "/galerie",  label: "Galerie photo", icon: "📷", desc: "Vivez la journée" },
  { href: "/sondage",  label: "Sondage de fin",icon: "💬", desc: "Donnez votre avis" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* Hero — dégradé teal → navy OMAS */}
      <section className="relative overflow-hidden bg-omas-gradient text-white">
        <div className="relative mx-auto max-w-screen-sm px-6 pt-10 pb-14 flex flex-col items-center text-center">
          {/* Logo OMAS sur disque blanc */}
          <div className="rounded-full bg-white p-3 ring-4 ring-white/15 shadow-xl">
            <Image
              src="/logo-omas.jpg"
              alt="Logo OMAS — Organisation Musulmane des Acteurs de Santé"
              width={120}
              height={120}
              className="rounded-full"
              priority
            />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-outfit)] text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            {EVENT.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/85">
            {EVENT.tagline}
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium ring-1 ring-white/25">
              {TOURNOI_DATE_LABEL} · {TOURNOI_HOURS}
            </div>
            <div className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs ring-1 ring-white/25">
              📍 {EVENT.venue}, {EVENT.city}
            </div>
          </div>

          <p className="mt-7 max-w-xs text-white/90 text-balance leading-relaxed">
            Foot, volley, athlétisme et village santé sur un même site. Scores en direct, programme et infos pratiques ici.
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/65">
            {ASSO.full_name}
          </p>
        </div>

        {/* Vague décorative crème */}
        <svg
          aria-hidden
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="block w-full h-10 text-[color:var(--color-background)]"
        >
          <path
            d="M0 30 C 200 60 400 0 600 30 C 800 60 1000 0 1200 30 L 1200 60 L 0 60 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-screen-sm px-4 pt-4 pb-24">
        <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
          Accès rapide
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block h-full rounded-2xl bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-border)] shadow-sm transition active:scale-[0.98] hover:ring-[color:var(--color-omas-teal)]/40"
              >
                <div className="text-2xl" aria-hidden>
                  {l.icon}
                </div>
                <div className="mt-2 font-semibold text-[color:var(--color-omas-navy)]">
                  {l.label}
                </div>
                <div className="text-xs text-[color:var(--color-muted)]">
                  {l.desc}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bloc "Au programme" */}
        <div className="mt-8 rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
            Au programme
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">⚽</span>
              <span><strong>Foot</strong> · {TOURNAMENT_CONFIG.foot.H.teams} équipes hommes + {TOURNAMENT_CONFIG.foot.F.teams} équipes femmes</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">🏐</span>
              <span><strong>Volley</strong> · {TOURNAMENT_CONFIG.volley.mixte.teams} équipes mixtes</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">🏃</span>
              <span><strong>Athlétisme</strong> · 100m, 400m, 800m, 3km, relais 4×100 & 4×400 (H/F)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">💚</span>
              <span><strong>Village santé</strong> · {HEALTH_STANDS.length} stands : {HEALTH_STANDS.map(s => s.name).join(" · ")}</span>
            </li>
          </ul>
        </div>

        {/* Footer signature */}
        <p className="mt-10 text-center text-xs text-[color:var(--color-muted)]">
          {EVENT.name} · {ASSO.full_name}
          <br />
          <span className="opacity-70">{ASSO.email}</span>
        </p>
      </section>
    </main>
  );
}
