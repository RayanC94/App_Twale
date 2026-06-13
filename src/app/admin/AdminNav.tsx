"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/actions/auth";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", exact: true },
  { href: "/admin/equipes", label: "Équipes", icon: "👥" },
  { href: "/admin/matchs", label: "Matchs", icon: "🏆" },
  { href: "/admin/athle", label: "Athlé", icon: "🏃" },
  { href: "/admin/stands", label: "Stands", icon: "💚" },
  { href: "/admin/galerie", label: "Galerie", icon: "📷" },
  { href: "/admin/sondage", label: "Sondage & quiz", icon: "💬" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

type Props = {
  displayName: string;
  role: "admin" | "referee";
  sport: "foot" | "volley" | null;
};

export default function AdminNav({ displayName, role, sport }: Props) {
  const pathname = usePathname() || "/admin";
  const [open, setOpen] = useState(false);

  const roleLabel =
    role === "admin"
      ? "Admin"
      : sport
      ? `Arbitre ${sport === "foot" ? "foot" : "volley"}`
      : "Arbitre";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-sm items-center gap-3 px-4">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--color-omas-navy)] hover:bg-[color:var(--color-omas-teal)]/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <Image
              src="/logo-omas.jpg"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
            <Image
              src="/logo-twale.jpeg"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>

          <div className="ml-auto text-right">
            <div className="text-sm font-semibold leading-tight text-[color:var(--color-omas-navy)]">
              {displayName}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              {roleLabel}
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        aria-label="Menu admin"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] transform bg-white shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--color-border)] px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-omas.jpg"
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
            <Image
              src="/logo-twale.jpeg"
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--color-omas-navy)] hover:bg-[color:var(--color-omas-teal)]/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-xl bg-[color:var(--color-omas-cream)] p-3">
            <div className="text-sm font-semibold text-[color:var(--color-omas-navy)]">
              {displayName}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              {roleLabel}
            </div>
          </div>
        </div>

        <nav className="px-2">
          <ul className="space-y-0.5">
            {ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-[color:var(--color-omas-teal)]/10 text-[color:var(--color-omas-teal)]"
                        : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-omas-cream)]"
                    }`}
                  >
                    <span className="text-lg" aria-hidden>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-[color:var(--color-border)] p-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-xl bg-[color:var(--color-omas-navy)] py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-omas-navy-dark)]"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
