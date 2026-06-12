import Image from "next/image";
import Link from "next/link";
import { TOURNOI_DATE_LABEL, TOURNOI_HOURS, EVENT, TOURNAMENT_CONFIG, HEALTH_STANDS, SPONSORS, VENUE_MAPS_URL, SOS_FALLBACK } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/tournoi",  label: "Tournoi",       icon: "🏆", desc: "Foot · Volley · Athlé" },
  { href: "/planning", label: "Planning",      icon: "📅", desc: "Tous les matchs" },
  { href: "/sante",    label: "Village santé", icon: "💚", desc: "5 stands · Fiches PDF" },
  { href: "/carte",    label: "Carte du site", icon: "🗺️", desc: "Terrains, food trucks…" },
  { href: "/live",     label: "Live",          icon: "🔴", desc: "Vidéo & scores en direct" },
  { href: "/sondage",  label: "Sondage de fin",icon: "💬", desc: "Donnez votre avis" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* Hero — dégradé mixte teal → navy → violet TWALE */}
      <section className="relative overflow-hidden bg-mixte-gradient text-white">
        <div className="relative mx-auto max-w-screen-sm px-6 pt-10 pb-14 flex flex-col items-center text-center">
          {/* Co-branding : les 2 logos côte à côte */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white p-2.5 ring-4 ring-white/15 shadow-xl">
              <Image
                src="/logo-omas.jpg"
                alt=""
                width={88}
                height={88}
                className="rounded-full"
                preload
              />
            </div>
            <span aria-hidden className="text-white/40 text-2xl font-light select-none">×</span>
            <div className="rounded-full bg-[color:var(--color-twale-cream)] p-2.5 ring-4 ring-white/15 shadow-xl">
              <Image
                src="/logo-twale.jpeg"
                alt=""
                width={88}
                height={88}
                className="rounded-full"
                preload
              />
            </div>
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-outfit)] tracking-tight text-balance">
            <span className="block text-4xl sm:text-5xl font-bold">{EVENT.name_line1}</span>
            <span className="mt-1.5 block text-2xl sm:text-3xl font-semibold text-white/90">{EVENT.name_line2}</span>
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/85">
            {EVENT.tagline}
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium ring-1 ring-white/25">
              {TOURNOI_DATE_LABEL} · {TOURNOI_HOURS}
            </div>
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Itinéraire vers ${EVENT.venue}, ${EVENT.address}`}
              className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs ring-1 ring-white/25 hover:bg-white/25 active:bg-white/30 transition inline-flex items-center gap-1.5"
            >
              📍 {EVENT.venue}, {EVENT.city}
              <span aria-hidden className="opacity-80">→</span>
            </a>
          </div>

          <p className="mt-7 max-w-xs text-white/90 text-balance leading-relaxed">
            Foot, volley, athlétisme et village santé sur un même site. Scores en direct, programme et infos pratiques ici.
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

        {/* Bloc "Au programme" — accents alternés teal / violet */}
        <div className="mt-8 rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
            Au programme
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">⚽</span>
              <span><strong>Foot</strong> · {TOURNAMENT_CONFIG.foot.teams} équipes · {TOURNAMENT_CONFIG.foot.fields} terrains</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-twale-purple)]/10 text-[color:var(--color-twale-purple)]">🏐</span>
              <span><strong>Volley</strong> · {TOURNAMENT_CONFIG.volley.teams} équipes · {TOURNAMENT_CONFIG.volley.fields} terrains</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]">🏃</span>
              <span><strong>Athlétisme</strong> · 100m, 400m, 800m, 3km, relais — inscription libre sur place</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-twale-purple)]/10 text-[color:var(--color-twale-purple)]">💚</span>
              <span><strong>Village santé</strong> · {HEALTH_STANDS.length} stands : {HEALTH_STANDS.map(s => s.name).join(" · ")}</span>
            </li>
          </ul>
        </div>

        {/* SOS / Urgences */}
        <div className="mt-8 rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
            En cas d&apos;urgence
          </h3>
          <p className="mt-1 text-xs text-[color:var(--color-muted)]">{SOS_FALLBACK.location_label}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <a
              href={SOS_FALLBACK.phone_href}
              className="flex flex-col items-center gap-0.5 rounded-xl bg-[color:var(--color-omas-teal)] px-1 py-3 text-white transition active:scale-[0.98]"
            >
              <span aria-hidden>📞</span>
              <span className="text-xs font-semibold leading-tight">Organisation</span>
              <span className="text-[10px] font-normal text-white/85 whitespace-nowrap">{SOS_FALLBACK.phone}</span>
            </a>
            <a
              href={`tel:${SOS_FALLBACK.samu}`}
              className="flex flex-col items-center gap-0.5 rounded-xl bg-[color:var(--color-omas-navy)] px-1 py-3 text-white transition active:scale-[0.98]"
            >
              <span aria-hidden>🚑</span>
              <span className="text-xs font-semibold leading-tight">SAMU</span>
              <span className="text-[10px] font-normal text-white/85">{SOS_FALLBACK.samu}</span>
            </a>
            <a
              href={`tel:${SOS_FALLBACK.pompiers}`}
              className="flex flex-col items-center gap-0.5 rounded-xl bg-[color:var(--color-twale-purple)] px-1 py-3 text-white transition active:scale-[0.98]"
            >
              <span aria-hidden>🚒</span>
              <span className="text-xs font-semibold leading-tight">Pompiers</span>
              <span className="text-[10px] font-normal text-white/85">{SOS_FALLBACK.pompiers}</span>
            </a>
          </div>
        </div>

        {/* Bandeau partenaires défilant */}
        <div className="mt-8">
          <h3 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Avec le soutien de
          </h3>
          <div className="mt-3 overflow-hidden rounded-2xl bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-border)] py-4">
            <div className="flex w-max items-center gap-10 animate-marquee">
              {[...SPONSORS, ...SPONSORS, ...SPONSORS, ...SPONSORS].map((s, i) => (
                <div key={`${s.name}-${i}`} className="shrink-0 px-2">
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-[color:var(--color-muted)]">
            <Link href="/sponsors" className="underline underline-offset-2 hover:text-[color:var(--color-omas-teal)]">
              Voir tous les partenaires
            </Link>
          </p>
        </div>

        {/* Footer signature */}
        <p className="mt-10 text-center text-xs text-[color:var(--color-muted)]">
          {EVENT.full_name}
        </p>
      </section>
    </main>
  );
}
