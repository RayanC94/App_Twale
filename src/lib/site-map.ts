/**
 * Carte du site — POIs du Stade Jean Bouin pour le tournoi.
 *
 * Coordonnées en % du conteneur (0-100). Les POIs sont rendus en overlay
 * HTML par-dessus le SVG de fond pour rester interactifs et accessibles.
 * Pour ajuster une position, modifier `x` / `y` ici.
 */

export type PoiCategory = "sport" | "sante" | "service";

export type Poi = {
  id: string;
  label: string;
  /** Libellé compact affiché sur la pastille (fallback = `label`). */
  shortLabel?: string;
  detail: string;
  category: PoiCategory;
  icon: string;
  x: number;
  y: number;
  /** URL de redirection optionnelle (CTA dans la bottom sheet). */
  href?: string;
  /** Texte du bouton CTA (par défaut "Y aller"). */
  hrefLabel?: string;
};

export const CATEGORIES: Record<PoiCategory, { label: string; color: string; bg: string; ring: string }> = {
  sport:   { label: "Sport",    color: "#1F9E94", bg: "rgba(31,158,148,0.12)",  ring: "rgba(31,158,148,0.45)"  },
  sante:   { label: "Santé",    color: "#5B2A86", bg: "rgba(91,42,134,0.12)",   ring: "rgba(91,42,134,0.45)"   },
  service: { label: "Services", color: "#A66A1A", bg: "rgba(166,106,26,0.14)",  ring: "rgba(166,106,26,0.45)"  },
};

export const POIS: Poi[] = [
  // === Sport — Volley (4 terrains en 2×2, nord-ouest) ===
  { id: "v1", label: "Volley 1", shortLabel: "V1", detail: "Terrain de volley n°1 — zone nord-ouest.", category: "sport", icon: "🏐", x: 14.6, y: 19, href: "/tournoi/volley?terrain=1", hrefLabel: "Voir les matchs" },
  { id: "v2", label: "Volley 2", shortLabel: "V2", detail: "Terrain de volley n°2 — zone nord-ouest.", category: "sport", icon: "🏐", x: 25.4, y: 19, href: "/tournoi/volley?terrain=2", hrefLabel: "Voir les matchs" },
  { id: "v3", label: "Volley 3", shortLabel: "V3", detail: "Terrain de volley n°3 — zone nord-ouest.", category: "sport", icon: "🏐", x: 14.6, y: 29, href: "/tournoi/volley?terrain=3", hrefLabel: "Voir les matchs" },
  { id: "v4", label: "Volley 4", shortLabel: "V4", detail: "Terrain de volley n°4 — zone nord-ouest.", category: "sport", icon: "🏐", x: 25.4, y: 29, href: "/tournoi/volley?terrain=4", hrefLabel: "Voir les matchs" },

  // === Sport — Foot (2 en haut + 1 sous le volley) ===
  { id: "f1", label: "Foot 1", shortLabel: "F1", detail: "Terrain de football n°1 — pelouse nord, côté gauche. Touchez « Voir les matchs » pour le match en cours et la programmation.", category: "sport", icon: "⚽", x: 40.5, y: 22.5, href: "/tournoi/foot?terrain=1", hrefLabel: "Voir les matchs" },
  { id: "f2", label: "Foot 2", shortLabel: "F2", detail: "Terrain de football n°2 — pelouse nord, côté droit.",   category: "sport", icon: "⚽", x: 56.7, y: 22.5, href: "/tournoi/foot?terrain=2", hrefLabel: "Voir les matchs" },
  { id: "f3", label: "Foot 3", shortLabel: "F3", detail: "Terrain de football n°3 — pelouse sud-ouest.",         category: "sport", icon: "⚽", x: 20,   y: 49,   href: "/tournoi/foot?terrain=3", hrefLabel: "Voir les matchs" },

  // === Sport — Athlétisme ===
  { id: "athle", label: "Athlétisme", shortLabel: "Athlé", detail: "Piste d'athlétisme — 100m, 400m, 800m, 3km, relais 4×100 et 4×400.", category: "sport", icon: "🏃", x: 74, y: 58, href: "/tournoi/athle", hrefLabel: "Voir le programme" },

  // === Santé ===
  { id: "village",    label: "Village santé", detail: "5 stands : Orientation · Hygiène bucco-dentaire · Premiers secours · Addictologie · Kiné/Ostéo.", category: "sante", icon: "💚", x: 41, y: 46, href: "/sante", hrefLabel: "Voir les fiches santé" },
  { id: "infirmerie", label: "Infirmerie",    detail: "Tente blanche jouxtant le village santé, côté est. Secouristes présents sur place toute la journée.", category: "sante", icon: "🚑", x: 52, y: 46 },

  // === Services ===
  { id: "entree",    label: "Entrée",          shortLabel: "Entrée", detail: "Entrée principale — Avenue Jean Bouin.",                  category: "service", icon: "🚪", x: 41,   y: 85 },
  { id: "vestiaire", label: "Vestiaires & WC", shortLabel: "Vestiaires", detail: "Vestiaires hommes / femmes et toilettes.",                                                     category: "service", icon: "🚻", x: 24, y: 73 },
  { id: "eau",       label: "Points d'eau",    shortLabel: "Eau",        detail: "Robinets / fontaines à eau dans l'espace entre le terrain Foot 3 et le bâtiment vestiaires.", category: "service", icon: "💧", x: 20, y: 64 },
  { id: "buvette",   label: "Buvette",         detail: "Boissons et collations.",                                                     category: "service", icon: "☕", x: 50.4, y: 70, href: "/food", hrefLabel: "Voir le menu" },
  { id: "foodtruck", label: "Food truck",      detail: "Restauration sur place — entre la buvette, l'entrée et la piste d'athlétisme.", category: "service", icon: "🚚", x: 60,   y: 79, href: "/food", hrefLabel: "Voir le menu" },
];
