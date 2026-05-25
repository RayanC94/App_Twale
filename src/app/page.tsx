import Image from "next/image";
import Link from "next/link";
import { TOURNOI_DATE_LABEL, TOURNOI_HOURS, EVENT, ASSO } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/tournoi", label: "Tournoi", icon: "🏆", desc: "Foot · Volley · Athlé" },
  { href: "/planning", label: "Planning", icon: "📅", desc: "Tous les matchs" },
  { href: "/sante", label: "Village santé", icon: "💚", desc: "5 stands · Fiches PDF" },
  { href: "/carte", label: "Carte du site", icon: "🗺️", desc: "Terrains, food truck…" },
  { href: "/galerie", label: "Galerie photo", icon: "📷", desc: "Vivez la journée" },
  { href: "/sondage", label: "Sondage de fin", icon: "💬", desc: "Donnez votre avis" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--color-twale-purple)] text-white">
        <div className="absolute inset-0 bg-twale-web opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-screen-sm px-6 pt-10 pb-12 flex flex-col items-center text-center">
          <div className="rounded-full bg-[color:var(--color-twale-cream)] p-3 ring-4 ring-white/10 shadow-xl">
            <Image
              src="/logo-twale.jpeg"
              alt="Logo La TWALE Association"
              width={120}
              height={120}
              className="rounded-full"
              priority
            />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {EVENT.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/80">
            {EVENT.tagline}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium ring-1 ring-white/20">
              {TOURNOI_DATE_LABEL} · {TOURNOI_HOURS}
            </div>
            <div className="rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs ring-1 ring-white/20">
              📍 {EVENT.venue}, {EVENT.city}
            </div>
          </div>
          <p className="mt-6 max-w-xs text-white/90 text-balance">
            Foot, volley, athlétisme et village santé — toute la journée sur un même site. Scores en direct, programme et infos pratiques ici.
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-white/60">
            Organisé par l'association {ASSO.name}
          </p>
        </div>
        {/* Vague décorative */}
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
                className="block h-full rounded-2xl bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-border)] shadow-sm transition active:scale-[0.98] hover:ring-[color:var(--color-twale-purple)]/30"
              >
                <div className="text-2xl" aria-hidden>
                  {l.icon}
                </div>
                <div className="mt-2 font-semibold text-[color:var(--color-twale-purple-dark)]">
                  {l.label}
                </div>
                <div className="text-xs text-[color:var(--color-muted)]">
                  {l.desc}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bloc programme à venir */}
        <div className="mt-8 rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-twale-purple-dark)]">
            Bientôt — le programme
          </h3>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Le déroulé heure par heure (ouverture, matchs, animations, podiums) sera affiché ici dès qu'il sera figé.
          </p>
        </div>

        {/* Footer signature */}
        <p className="mt-10 text-center text-xs text-[color:var(--color-muted)]">
          Tournoi {EVENT.name} · organisé par {ASSO.full_name}
          <br />
          <span className="opacity-70">{ASSO.email}</span>
        </p>
      </section>
    </main>
  );
}
