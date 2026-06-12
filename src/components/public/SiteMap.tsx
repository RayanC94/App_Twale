"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { POIS, CATEGORIES, type PoiCategory, type Poi } from "@/lib/site-map";

const ALL_CATEGORIES: PoiCategory[] = ["sport", "sante", "service"];

export default function SiteMap() {
  const [active, setActive] = useState<Set<PoiCategory>>(new Set(ALL_CATEGORIES));
  const [selected, setSelected] = useState<Poi | null>(null);

  const visible = POIS.filter((p) => active.has(p.category));

  function toggle(c: PoiCategory) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) {
        if (next.size > 1) next.delete(c);
      } else {
        next.add(c);
      }
      return next;
    });
  }

  return (
    <>
      <div className="mx-auto max-w-screen-sm px-4 mt-4 flex gap-2 flex-wrap justify-center">
        {ALL_CATEGORIES.map((c) => {
          const isOn = active.has(c);
          const cat = CATEGORIES[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              aria-pressed={isOn}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition ring-1 active:scale-[0.97]"
              style={{
                color: isOn ? "#fff" : cat.color,
                backgroundColor: isOn ? cat.color : cat.bg,
                borderColor: isOn ? cat.color : cat.ring,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-screen-sm px-4 mt-4">
        <div className="relative aspect-[13/10] w-full overflow-hidden rounded-2xl ring-1 ring-[color:var(--color-border)] bg-[#E8F0DC] shadow-sm">
          <SiteMapSvg />

          {visible.map((poi) => {
            const cat = CATEGORIES[poi.category];
            const isTextPill = /^[vf]\d$/.test(poi.id) || poi.id === "entree";
            return (
              <button
                key={poi.id}
                type="button"
                onClick={() => setSelected(poi)}
                aria-label={poi.label}
                title={poi.label}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-6 items-center justify-center rounded-full shadow-md ring-2 ring-white/70 transition active:scale-90 hover:scale-110 ${isTextPill ? "px-2" : "w-6"}`}
                style={{
                  left: `${poi.x}%`,
                  top: `${poi.y}%`,
                  backgroundColor: cat.color,
                  color: "#fff",
                }}
              >
                {isTextPill ? (
                  <span className="text-[10px] font-bold tracking-tight leading-none">{poi.shortLabel}</span>
                ) : (
                  <span aria-hidden className="text-xs leading-none">{poi.icon}</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-[color:var(--color-muted)]">
          Touche un repère pour voir les détails.
        </p>
      </div>

      {selected && <PoiSheet poi={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function PoiSheet({ poi, onClose }: { poi: Poi; onClose: () => void }) {
  const cat = CATEGORIES[poi.category];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="poi-title" className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-screen-sm rounded-t-3xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl">
        <div className="mx-auto h-1 w-10 rounded-full bg-[color:var(--color-border)]" />
        <div className="mt-4 flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            {poi.icon}
          </span>
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5"
              style={{ color: cat.color, backgroundColor: cat.bg }}
            >
              {cat.label}
            </span>
            <h2 id="poi-title" className="mt-1 font-[family-name:var(--font-outfit)] text-xl font-bold text-[color:var(--color-omas-navy)]">
              {poi.label}
            </h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-muted)]">{poi.detail}</p>
        {poi.href && (
          <Link
            href={poi.href}
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white active:scale-[0.99]"
            style={{ backgroundColor: cat.color }}
          >
            {poi.hrefLabel ?? "Y aller"}
            <span aria-hidden>→</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onClose}
          className={`${poi.href ? "mt-2" : "mt-5"} w-full rounded-xl bg-[color:var(--color-omas-cream)] py-3 text-sm font-semibold text-[color:var(--color-omas-navy)] ring-1 ring-[color:var(--color-border)] active:scale-[0.99]`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function SiteMapSvg() {
  return (
    <svg
      viewBox="0 0 1300 1000"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="1300" height="1000" fill="#E8F0DC" />

      {/* Allée entrée → centre */}
      <path d="M 530 880 L 530 740" stroke="#E2D2A6" strokeWidth="40" strokeLinecap="round" opacity="0.6" />

      {/* ============ ENCADRES — clusters de terrains (centrés autour du contenu) ============ */}
      {/* Cluster gauche : volley + foot 3 (largeurs alignées à 280px) */}
      <rect x="110" y="125" width="300" height="490" rx="16" fill="none" stroke="#1F2937" strokeWidth="3" opacity="0.55" />
      {/* Cluster haut : foot 1 + foot 2 */}
      <rect x="420" y="85" width="425" height="280" rx="16" fill="none" stroke="#1F2937" strokeWidth="3" opacity="0.55" />

      {/* ============ FOOT 3 (haut de la colonne gauche) ============ */}
      <g>
        <rect x="120" y="140" width="280" height="200" rx="10" fill="#C8E6A8" stroke="#7DAA52" strokeWidth="3" />
        <line x1="260" y1="140" x2="260" y2="340" stroke="#fff" strokeWidth="2" />
        <circle cx="260" cy="240" r="22" fill="none" stroke="#fff" strokeWidth="2" />
      </g>

      {/* ============ FOOT 1 + 2 (haut) ============ */}
      <g>
        <rect x="430" y="100" width="190" height="250" rx="10" fill="#C8E6A8" stroke="#7DAA52" strokeWidth="3" />
        <line x1="430" y1="225" x2="620" y2="225" stroke="#fff" strokeWidth="2" />
        <circle cx="525" cy="225" r="22" fill="none" stroke="#fff" strokeWidth="2" />

        <rect x="645" y="100" width="190" height="250" rx="10" fill="#C8E6A8" stroke="#7DAA52" strokeWidth="3" />
        <line x1="645" y1="225" x2="835" y2="225" stroke="#fff" strokeWidth="2" />
        <circle cx="740" cy="225" r="22" fill="none" stroke="#fff" strokeWidth="2" />
      </g>

      {/* ============ ESPACE JEUNESSE (même gabarit qu'un terrain de foot, sous F3) ============ */}
      <g>
        <rect x="120" y="380" width="280" height="220" rx="10" fill="#C8E6A8" stroke="#7DAA52" strokeWidth="3" />
        <line x1="260" y1="380" x2="260" y2="600" stroke="#fff" strokeWidth="2" />
        <circle cx="260" cy="490" r="22" fill="none" stroke="#fff" strokeWidth="2" />
      </g>

      {/* ============ VILLAGE SANTÉ (5 petits stands) ============ */}
      <g>
        <rect x="440" y="380" width="180" height="160" rx="10" fill="#EAD8F0" stroke="#9C6BB8" strokeWidth="3" />
        <rect x="455" y="395" width="40" height="40" rx="4" fill="#fff" stroke="#9C6BB8" strokeWidth="1.5" />
        <rect x="510" y="395" width="40" height="40" rx="4" fill="#fff" stroke="#9C6BB8" strokeWidth="1.5" />
        <rect x="565" y="395" width="40" height="40" rx="4" fill="#fff" stroke="#9C6BB8" strokeWidth="1.5" />
        <rect x="480" y="450" width="40" height="40" rx="4" fill="#fff" stroke="#9C6BB8" strokeWidth="1.5" />
        <rect x="540" y="450" width="40" height="40" rx="4" fill="#fff" stroke="#9C6BB8" strokeWidth="1.5" />
      </g>

      {/* ============ CHÂTEAU GONFLABLE (à droite du village santé) ============ */}
      <g>
        <circle cx="652" cy="427" r="8" fill="#FFCF8F" stroke="#D4942B" strokeWidth="2.5" />
        <circle cx="677" cy="423" r="9" fill="#FFCF8F" stroke="#D4942B" strokeWidth="2.5" />
        <circle cx="702" cy="427" r="8" fill="#FFCF8F" stroke="#D4942B" strokeWidth="2.5" />
        <rect x="635" y="425" width="85" height="60" rx="10" fill="#FFCF8F" stroke="#D4942B" strokeWidth="2.5" />
      </g>

      {/* ============ INFIRMERIE / POSTE DE SECOURS (entre l'ancienne buvette et le food truck) ============ */}
      <g>
        <rect x="590" y="715" width="90" height="55" rx="8" fill="#fff" stroke="#D04444" strokeWidth="3" />
        <line x1="635" y1="726" x2="635" y2="759" stroke="#D04444" strokeWidth="5" />
        <line x1="618" y1="742" x2="652" y2="742" stroke="#D04444" strokeWidth="5" />
      </g>

      {/* ============ PISTE ATHLÉ (ovale rouge brique + pelouse) — descendu ============ */}
      <g transform="translate(940,580)">
        <ellipse cx="0" cy="0" rx="250" ry="220" fill="#C84F3A" stroke="#9C3A28" strokeWidth="3" />
        <ellipse cx="0" cy="0" rx="190" ry="160" fill="#C8E6A8" stroke="#7DAA52" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="220" ry="190" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.55" />
      </g>

      {/* ============ VOLLEY — terrain unique vertical, extrémité gauche de la pelouse intérieure ============ */}
      <g>
        <rect x="775" y="525" width="70" height="110" rx="8" fill="#FFE9A8" stroke="#D4B85A" strokeWidth="3" />
        <line x1="782" y1="580" x2="838" y2="580" stroke="#fff" strokeWidth="2.5" />
      </g>

      {/* ============ POINT D'EAU dans l'espace entre l'espace jeunesse et le vestiaire ============ */}
      <g>
        <rect x="225" y="628" width="70" height="32" rx="8" fill="#B8DDE8" stroke="#5A92A8" strokeWidth="2" />
        {/* Petit robinet */}
        <line x1="260" y1="628" x2="260" y2="620" stroke="#5A92A8" strokeWidth="2" />
        <circle cx="260" cy="618" r="2.5" fill="#5A92A8" />
      </g>

      {/* ============ BÂTIMENTS (vestiaire descendu / buvette au centre) ============ */}
      <g>
        {/* Vestiaire — décalé vers le bas pour laisser place au point d'eau */}
        <rect x="240" y="680" width="150" height="90" rx="8" fill="#D9C3A0" stroke="#8A7144" strokeWidth="2.5" />

        {/* Ancienne buvette — fermée le jour J, conservée comme repère visuel */}
        <rect x="560" y="610" width="110" height="90" rx="8" fill="#D9C3A0" stroke="#8A7144" strokeWidth="2.5" />
      </g>

      {/* ============ ENTRÉE (sud) + flèche ============ */}
      <g>
        <rect x="460" y="810" width="140" height="100" rx="10" fill="#EFDDB8" stroke="#C9A55C" strokeWidth="2" />
        <path d="M 530 770 L 555 805 L 540 805 L 540 880 L 520 880 L 520 805 L 505 805 Z" fill="#1F9E94" opacity="0.85" />
      </g>

      {/* ============ FOOD TRUCK (entre l'entrée et la piste) ============ */}
      <g>
        <rect x="700" y="790" width="110" height="60" rx="10" fill="#FFE0B0" stroke="#D4942B" strokeWidth="2.5" />
        <circle cx="725" cy="856" r="6" fill="#444" />
        <circle cx="785" cy="856" r="6" fill="#444" />
      </g>

      {/* Boussole nord */}
      <g transform="translate(1230,60)" opacity="0.75">
        <circle cx="0" cy="0" r="22" fill="#fff" stroke="#7DAA52" strokeWidth="1.5" />
        <path d="M 0 -14 L 5 4 L 0 0 L -5 4 Z" fill="#2B2C82" />
        <text x="0" y="-26" fontSize="11" fontWeight="700" textAnchor="middle" fill="#2B2C82">N</text>
      </g>
    </svg>
  );
}
