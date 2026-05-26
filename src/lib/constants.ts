/**
 * Constantes globales — fallbacks pour ne jamais perdre les infos critiques
 * même si la DB est indisponible le jour J.
 */

export const TOURNOI_DATE_ISO = "2026-06-14";
export const TOURNOI_DATE_LABEL = "Dimanche 14 juin 2026";
export const TOURNOI_HOURS = "9h – 19h";

export const EVENT = {
  name: "Tournoi multisports",
  full_name: "Tournoi multisports — Édition 2026",
  tagline: "Sport, Santé, Prévention",
  venue: "Stade Jean Bouin",
  city: "Choisy",
  address: "39-41 Rue Pompadour, 94600 Choisy-le-Roi",
} as const;

export const VENUE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${EVENT.venue}, ${EVENT.address}`
)}`;

/**
 * Fallback SOS — utilisé si app_settings.sos n'est pas accessible.
 * À synchroniser manuellement avec la valeur en base avant le jour J.
 */
export const SOS_FALLBACK = {
  phone: "+33 0 00 00 00 00",
  location_label: "Infirmerie — Tente blanche près de l'entrée",
  samu: "15",
  pompiers: "18",
} as const;

export const HEALTH_STANDS = [
  { slug: "orientation",   name: "Orientation" },
  { slug: "bucco",         name: "Hygiène bucco-dentaire" },
  { slug: "premiers",      name: "Premiers secours" },
  { slug: "addictologie",  name: "Addictologie" },
  { slug: "kine",          name: "Kiné / Ostéo" },
] as const;

/**
 * Configuration officielle du tournoi (source : Feuille de Route).
 * Sert de défaut à l'UI admin pour le tirage des poules.
 */
export const TOURNAMENT_CONFIG = {
  foot: {
    H: { teams: 12, pools: 3, teams_per_pool: 4 },
    F: { teams: 6,  pools: 2, teams_per_pool: 3 },
  },
  volley: {
    mixte: { teams: 12, pools: 3, teams_per_pool: 4 },
  },
  athletics: {
    events: 22, // séries + finales × H/F
  },
} as const;

export type HealthStandSlug = (typeof HEALTH_STANDS)[number]["slug"];

/**
 * Sponsors / partenaires affichés dans le bandeau défilant et sur la page /sponsors.
 * Source des logos : `public/sponsors/`. Sert de fallback si la table `sponsors` Supabase est vide.
 */
export type SponsorEntry = {
  name: string;
  logo: string;
  description: string;
  website: string | null;
};

export const SPONSORS: readonly SponsorEntry[] = [
  {
    name: "Ville de Choisy-le-Roi",
    logo: "/sponsors/ville-choisy.jpeg",
    description: "Commune d'accueil du tournoi — mise à disposition du Stade Jean Bouin et soutien à l'organisation de la journée.",
    website: null,
  },
  {
    name: "ASCR Choisy-le-Roi",
    logo: "/sponsors/ascr-choisy.jpeg",
    description: "Club sportif partenaire — appui à l'encadrement et à la logistique du tournoi.",
    website: null,
  },
];
