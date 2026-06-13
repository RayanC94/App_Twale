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
  // === Sport — Volley (terrain unique, pelouse intérieure de la piste, côté gauche) ===
  { id: "volley", label: "Volley", detail: "Terrain de volley — extrémité gauche de la pelouse intérieure de la piste d'athlétisme.", category: "sport", icon: "🏐", x: 62.3, y: 58, href: "/tournoi/volley", hrefLabel: "Voir les matchs" },

  // === Sport — Foot (F1 en haut de la colonne gauche + 2 en haut) ===
  { id: "f1", label: "Foot 1", shortLabel: "F1", detail: "Terrain de football n°1 — zone nord-ouest, au-dessus de l'espace jeunesse. Touchez « Voir les matchs » pour le match en cours et la programmation.", category: "sport", icon: "⚽", x: 20,   y: 24,   href: "/tournoi/foot?terrain=1", hrefLabel: "Voir les matchs" },
  { id: "f2", label: "Foot 2", shortLabel: "F2", detail: "Terrain de football n°2 — pelouse nord, côté gauche.", category: "sport", icon: "⚽", x: 40.5, y: 22.5, href: "/tournoi/foot?terrain=2", hrefLabel: "Voir les matchs" },
  { id: "f3", label: "Foot 3", shortLabel: "F3", detail: "Terrain de football n°3 — pelouse nord, côté droit.",  category: "sport", icon: "⚽", x: 56.9, y: 22.5, href: "/tournoi/foot?terrain=3", hrefLabel: "Voir les matchs" },

  // === Sport — Athlétisme ===
  { id: "athle", label: "Athlétisme", shortLabel: "Athlé", detail: "Piste d'athlétisme — 100m, 400m, 800m, 3km, relais 4×100 et 4×400.", category: "sport", icon: "🏃", x: 76, y: 75.5, href: "/tournoi/athle", hrefLabel: "Voir le programme" },

  // === Santé ===
  { id: "village",    label: "Village santé", detail: "5 stands : Orientation · Hygiène bucco-dentaire · Premiers secours · Addictologie · Kiné/Ostéo.", category: "sante", icon: "💚", x: 41, y: 46, href: "/sante", hrefLabel: "Voir les fiches santé" },
  { id: "infirmerie", label: "Infirmerie",    detail: "Poste de secours — entre l'ancienne buvette et le food truck. Secouristes présents sur place toute la journée.", category: "sante", icon: "🚑", x: 48.8, y: 74.2 },

  // === Services ===
  { id: "chateau",   label: "Château gonflable", detail: "Structure gonflable pour les enfants — à côté du village santé.", category: "service", icon: "🏰", x: 52.1, y: 46 },
  { id: "jeunesse",  label: "Espace jeunesse", detail: "Animations foot et jeux collectifs encadrées par les animateurs jeunesse — accès libre.", category: "service", icon: "🧒", x: 20, y: 49 },
  { id: "entree",    label: "Entrée",          shortLabel: "Entrée", detail: "Entrée principale — Avenue Jean Bouin.",                  category: "service", icon: "🚪", x: 41,   y: 85 },
  { id: "vestiaire", label: "Vestiaires & WC", shortLabel: "Vestiaires", detail: "Vestiaires hommes / femmes et toilettes.",                                                     category: "service", icon: "🚻", x: 24, y: 73 },
  { id: "eau",       label: "Points d'eau",    shortLabel: "Eau",        detail: "Robinets / fontaines à eau dans l'espace entre l'espace jeunesse et le bâtiment vestiaires.", category: "service", icon: "💧", x: 20, y: 64 },
  { id: "foodtruck", label: "Food truck",      detail: "Restauration sur place — entre l'entrée et la piste d'athlétisme.",            category: "service", icon: "🚚", x: 58.1,   y: 82, href: "/food", hrefLabel: "Voir le menu" },
];
