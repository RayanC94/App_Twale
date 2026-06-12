"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",         label: "Accueil",   icon: "🏠", match: (p: string) => p === "/" },
  { href: "/tournoi",  label: "Tournoi",   icon: "🏆", match: (p: string) => p.startsWith("/tournoi") },
  { href: "/planning", label: "Planning",  icon: "📅", match: (p: string) => p.startsWith("/planning") },
  { href: "/sante",    label: "Santé",     icon: "💚", match: (p: string) => p.startsWith("/sante") },
  { href: "/carte",    label: "Carte",     icon: "🗺️", match: (p: string) => p.startsWith("/carte") || p.startsWith("/galerie") || p.startsWith("/food") || p.startsWith("/sponsors") || p.startsWith("/sondage") || p.startsWith("/live") },
];

export default function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-border)] bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-screen-sm">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] font-medium transition ${
                  active
                    ? "text-[color:var(--color-omas-teal)]"
                    : "text-[color:var(--color-muted)] hover:text-[color:var(--color-omas-navy)]"
                }`}
              >
                <span className="text-xl" aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
