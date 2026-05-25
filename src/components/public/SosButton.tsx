"use client";

import { useEffect, useState } from "react";
import { SOS_FALLBACK } from "@/lib/constants";

type SosConfig = {
  phone: string;
  location_label: string;
  samu?: string;
  pompiers?: string;
};

export default function SosButton({
  config,
  bottomOffset = 80,
}: {
  config: SosConfig;
  /** Pixels au-dessus du bas — au-dessus du bandeau sponsors + bottom-nav. */
  bottomOffset?: number;
}) {
  const [open, setOpen] = useState(false);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const phone = config.phone || SOS_FALLBACK.phone;
  const location = config.location_label || SOS_FALLBACK.location_label;
  const samu = config.samu || SOS_FALLBACK.samu;
  const pompiers = config.pompiers || SOS_FALLBACK.pompiers;

  return (
    <>
      <button
        type="button"
        aria-label="Urgence — accès rapide infirmerie"
        onClick={() => setOpen(true)}
        className="fixed right-4 z-40 group"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <span className="flex items-center justify-center h-14 w-14 rounded-full bg-red-600 text-white shadow-2xl ring-4 ring-red-600/20 transition active:scale-95 group-hover:scale-105">
          <span aria-hidden className="text-2xl font-bold">SOS</span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Urgence — coordonnées"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-red-600 font-semibold">Urgence</p>
                <h2 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-bold text-[color:var(--color-foreground)]">
                  Besoin d'aide ?
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
                className="-mr-2 -mt-2 h-9 w-9 rounded-full text-[color:var(--color-muted)] hover:bg-black/5"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-red-600 px-4 py-4 text-white shadow-md transition active:scale-[0.98]"
              >
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Infirmerie sur place</div>
                  <div className="mt-0.5 text-lg font-semibold">{phone}</div>
                </div>
                <div aria-hidden className="text-2xl">📞</div>
              </a>

              <div className="rounded-2xl bg-[color:var(--color-omas-cream)] p-4 ring-1 ring-[color:var(--color-border)]">
                <div className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">Localisation</div>
                <div className="mt-1 text-sm font-medium text-[color:var(--color-foreground)]">{location}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${samu}`}
                  className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[color:var(--color-border)] text-center transition active:scale-[0.98]"
                >
                  <div className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">SAMU</div>
                  <div className="mt-0.5 text-2xl font-bold text-[color:var(--color-omas-navy)]">{samu}</div>
                </a>
                <a
                  href={`tel:${pompiers}`}
                  className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[color:var(--color-border)] text-center transition active:scale-[0.98]"
                >
                  <div className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">Pompiers</div>
                  <div className="mt-0.5 text-2xl font-bold text-[color:var(--color-omas-navy)]">{pompiers}</div>
                </a>
              </div>

              <a
                href="/carte#infirmerie"
                className="block text-center text-sm font-medium text-[color:var(--color-omas-teal)] underline-offset-4 hover:underline"
              >
                Voir l'infirmerie sur la carte →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
