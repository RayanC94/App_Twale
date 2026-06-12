/**
 * Constantes globales — fallbacks pour ne jamais perdre les infos critiques
 * même si la DB est indisponible le jour J.
 */

export const TOURNOI_DATE_ISO = "2026-06-14";
export const TOURNOI_DATE_LABEL = "Dimanche 14 juin 2026";
/** Horaires d'ouverture au public (les joueurs arrivent dès 8h). */
export const TOURNOI_HOURS = "10h – 18h";
export const TOURNOI_HOURS_PLAYERS = "8h – 18h";

export const EVENT = {
  name: "Village santé & Tournoi multisports",
  /** Les deux lignes du titre, affichées séparément sur le hero. */
  name_line1: "Village santé",
  name_line2: "& Tournoi multisports",
  full_name: "Village santé & Tournoi multisports — Édition 2026",
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
  phone: "07 69 70 69 40",
  phone_href: "tel:+33769706940",
  location_label: "Poste de secours — Protection civile, près de l'entrée",
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
 * Configuration officielle du tournoi (mise à jour du 11 juin 2026).
 * Les poules et matchs réels sont gérés en base via l'admin tournois.
 */
export const TOURNAMENT_CONFIG = {
  foot: { teams: 16, fields: 3 },
  volley: { teams: 12, fields: 3 },
  athletics: { open_registration: true },
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

/**
 * Food trucks présents le jour J (source : affiches reçues le 8 juin 2026).
 * Contenu statique — pas de dépendance DB pour la restauration.
 */
export type FoodTruckMenuItem = {
  name: string;
  detail?: string;
  price?: string;
};

export type FoodTruck = {
  slug: string;
  name: string;
  kind: "Salé" | "Sucré";
  tagline: string;
  phone_label?: string;
  phone_href?: string;
  poster: string;
  note?: string;
  items: readonly FoodTruckMenuItem[];
};

/** Menus officiels reçus le 12 juin 2026 (affiches dans public/food/). */
export const FOOD_TRUCKS: readonly FoodTruck[] = [
  {
    slug: "sale",
    name: "Menu Salé",
    kind: "Salé",
    tagline: "Paella, sandwichs et frites",
    poster: "/food/menu-sale.jpeg",
    items: [
      { name: "Paella", price: "10 €" },
      { name: "Sandwich frites merguez", price: "6,50 €" },
      { name: "Croque monsieur", price: "6,50 €" },
      { name: "Frites", price: "3 €" },
    ],
  },
  {
    slug: "crepes",
    name: "Menu Crêpes",
    kind: "Sucré",
    tagline: "Crêpes, gourmandises et sandwich chaud",
    poster: "/food/menu-crepes.jpeg",
    items: [
      { name: "Crêpe au sucre", detail: "La classique", price: "3 €" },
      { name: "Crêpe gourmande", detail: "Nutella · Caramel · Confiture · Sucre & citron", price: "4 €" },
      { name: "Crêpe spéciale", detail: "Nutella & banane", price: "5 €" },
      { name: "Sandwich chaud", detail: "Raclette & jambon", price: "5 €" },
    ],
  },
];

export const SPONSORS: readonly SponsorEntry[] = [
  {
    name: "Ville de Choisy-le-Roi",
    logo: "/sponsors/ville-choisy.png",
    description: "Commune d'accueil du tournoi — mise à disposition du Stade Jean Bouin et soutien à l'organisation de la journée.",
    website: null,
  },
  {
    name: "ASCR Choisy-le-Roi",
    logo: "/sponsors/ascr-choisy.png",
    description: "Club sportif partenaire — appui à l'encadrement et à la logistique du tournoi.",
    website: null,
  },
  {
    name: "Protection civile",
    logo: "/sponsors/protection-civile.png",
    description: "Poste de secours de la journée — couverture premiers secours sur l'ensemble du site.",
    website: null,
  },
  {
    name: "Portalo",
    logo: "/sponsors/portalo.png",
    description: "Créateur d'un système de gourde pour se laver et tout nettoyer sans gaspiller d'eau.",
    website: null,
  },
];

/**
 * Liens de diffusion vidéo en direct (caméras XbotGo) — un lien par sport.
 * Laisser à null tant que le lien n'est pas connu : le bandeau « en direct »
 * reste masqué sur les pages tournoi.
 */
export const XBOTGO_STREAMS: Record<"foot" | "volley", string | null> = {
  foot: null,
  volley: null,
};

/**
 * Diffusion en direct des interventions du village santé.
 * Laisser à null tant que la chaîne n'est pas créée : le bloc « en direct »
 * reste masqué sur la page /sante.
 */
export const SANTE_LIVE_URL: string | null = null;
