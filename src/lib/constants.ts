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

/** Menus définitifs reçus le 13 juin 2026 (affiches dans public/food/). */
export const FOOD_TRUCKS: readonly FoodTruck[] = [
  {
    slug: "tanly",
    name: "TanLy' Food Truck",
    kind: "Salé",
    tagline: "100% halal (AVS) — croquettes, riz cantonnais, merguez, nems…",
    poster: "/food/menu-tanly.jpeg",
    phone_label: "06 58 88 78 82",
    phone_href: "tel:+33658887882",
    note: "100% halal · Produits frais et de qualité",
    items: [
      { name: "Croquettes de poulet frites", price: "7 €" },
      { name: "Riz cantonnais au bœuf", price: "7 €" },
      { name: "Sandwich merguez frite + boisson", price: "7 €" },
      { name: "Box nems poulet au fromage 2P + samoussa au bœuf 2P", price: "5 €" },
      { name: "Box watan frite 5P", price: "5 €" },
      { name: "Salade de fruits frais", price: "5 €" },
      { name: "Café", price: "1 €" },
      { name: "Boisson", price: "1 €" },
    ],
  },
  {
    slug: "sucre",
    name: "Food Truck — Burgers & Gourmandises",
    kind: "Sucré",
    tagline: "Plaisir, saveurs et gourmandise à chaque bouchée !",
    poster: "/food/menu-sucre.jpeg",
    phone_label: "07 44 59 65 77",
    phone_href: "tel:+33744596577",
    items: [
      { name: "Truc Berger", detail: "Avec frites", price: "7 €" },
      { name: "Sandwich frites", detail: "Avec boisson", price: "7 €" },
      { name: "Croque", detail: "Plus frite", price: "7 €" },
      { name: "Crêpe Nutella", detail: "+ banane ou fraise : 5 €", price: "4 €" },
      { name: "Gauffre Nutella", detail: "+ banane ou fraise : 5 €", price: "4 €" },
      { name: "Granité", price: "4 €" },
      { name: "Barbe à papa", price: "3 €" },
      { name: "Glace italienne", detail: "À la machine", price: "3 €" },
      { name: "Boisson", price: "1 €" },
      { name: "Café", price: "1 €" },
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
