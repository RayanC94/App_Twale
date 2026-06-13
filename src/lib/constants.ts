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
 * Questionnaires de satisfaction (Google Forms). Le public donne son avis
 * via ces deux formulaires depuis la page /sondage.
 */
export const FEEDBACK_FORMS = [
  {
    key: "sport",
    label: "Sport",
    desc: "Tournoi, athlétisme, organisation des matchs",
    emoji: "🏆",
    accent: "var(--color-omas-teal)",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSd5fIG-mca2ornqqRkagdGsCts58EwUs4tBMJ26n4-oDFIBZQ/viewform",
  },
  {
    key: "sante",
    label: "Village santé",
    desc: "Stands, ateliers et animations bien-être",
    emoji: "💚",
    accent: "var(--color-twale-purple)",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSc6bbi0JT8nfGXLH7llckFmKpuKFGuT066pt15cYaf0Qcucuw/viewform",
  },
] as const;

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
  {
    name: "Paramedic",
    logo: "/sponsors/paramedic.svg",
    description: "Donateur — merci pour son soutien à l'organisation de la journée.",
    website: "https://www.paramedic.tech/",
  },
];

/**
 * Établissements qui offrent les repas des bénévoles.
 * Affichés (logo + nom + adresse, lien Google Maps) dans une section dédiée
 * de /sponsors — distincts du bandeau de logos des partenaires de l'événement.
 */
export type FoodPartner = { name: string; address: string; logo: string };

export const VOLUNTEER_FOOD_PARTNERS: readonly FoodPartner[] = [
  { name: "Abi Kebab", address: "29 Av. Gambetta, 94600 Choisy-le-Roi", logo: "/sponsors/abi-kebab.png" },
  { name: "Maison Braisée", address: "18 Av. Jean Monnet, 94450 Limeil-Brévannes", logo: "/sponsors/maison-braisee.png" },
  { name: "Afrik'N'Fusion", address: "Centre Commercial Régional Créteil-Soleil, 94000 Créteil", logo: "/sponsors/afrik-n-fusion.png" },
  { name: "Le Boostan", address: "97 Av. de Paris, 94380 Bonneuil-sur-Marne", logo: "/sponsors/boostan.png" },
  { name: "Africano", address: "1 All. Costes et Bellonte, 94550 Chevilly-Larue", logo: "/sponsors/africano.jpeg" },
];

/**
 * Programme officiel de la journée (grille reçue le 13 juin 2026), affiché sur /planning.
 * Source de vérité statique : le déroulé ne dépend pas de la base — il s'affiche
 * tel quel le jour J. Heures locales (Europe/Paris). `end: null` = repère ponctuel.
 */
export type ScheduleEntry = {
  start: string; // "HH:MM"
  end: string | null;
  title: string;
  description?: string;
  category: "ouverture" | "tournoi" | "sante" | "pause" | "podium" | "cloture";
};

export const DAY_SCHEDULE: readonly ScheduleEntry[] = [
  { start: "08:00", end: "08:45", title: "Accueil des bénévoles & installation", category: "ouverture" },
  { start: "08:45", end: "09:00", title: "Ouverture pour les participants & briefing", category: "ouverture" },
  { start: "09:00", end: "09:25", title: "Échauffement collectif (Kiné)", description: "Football & volley", category: "tournoi" },
  { start: "09:25", end: "12:35", title: "Phase de poules — Football & Volley", description: "Sur 3 terrains chacun. Athlétisme : inscriptions ouvertes.", category: "tournoi" },
  { start: "10:00", end: null, title: "Ouverture grand public", category: "ouverture" },
  { start: "12:35", end: "13:45", title: "Pause déjeuner", category: "pause" },
  { start: "13:15", end: "13:45", title: "Athlétisme — Course 3 km (Femmes)", category: "tournoi" },
  { start: "13:45", end: "14:15", title: "Athlétisme — Course 3 km (Hommes)", category: "tournoi" },
  { start: "14:15", end: "15:05", title: "Quarts de finale — Football & Volley", category: "tournoi" },
  { start: "15:05", end: "15:15", title: "Athlétisme — Finale 800 m (H/F)", category: "tournoi" },
  { start: "15:15", end: "16:10", title: "Demi-finales — Football & Volley", description: "Football : 20 min · Volley : 20 min.", category: "tournoi" },
  { start: "15:15", end: "15:40", title: "Athlétisme — Séries 400 m (H/F)", category: "tournoi" },
  { start: "16:10", end: "16:20", title: "Athlétisme — Séries 100 m (H/F)", category: "tournoi" },
  { start: "16:20", end: "16:30", title: "Athlétisme — Finale 4×100 m (H/F)", category: "tournoi" },
  { start: "16:30", end: "16:50", title: "Football — Petite finale", category: "tournoi" },
  { start: "16:30", end: "16:40", title: "Athlétisme — Finale 4×400 m (H/F)", category: "tournoi" },
  { start: "16:40", end: "16:50", title: "Athlétisme — Finales 400 m & 100 m (H/F)", category: "tournoi" },
  { start: "16:50", end: "17:15", title: "Football — Finale 🏆 (2×15 min)", category: "tournoi" },
  { start: "16:50", end: "17:15", title: "Volley — Petite finale (20 min)", category: "tournoi" },
  { start: "17:15", end: "17:45", title: "Volley — Finale 🏆 (25 points)", category: "tournoi" },
  { start: "17:45", end: "18:15", title: "Remise des prix 🏅", category: "podium" },
  { start: "18:00", end: null, title: "Fermeture du village santé", category: "sante" },
];

/**
 * Épreuves d'athlétisme de l'après-midi (grille officielle du 13 juin 2026).
 * Le matin (9h25–12h35) est réservé aux INSCRIPTIONS sur place, gérées par le staff.
 * Affiché sur /tournoi/athle. Source statique : pas de dépendance DB.
 * Le nom n'inclut pas le tour (Séries/Finales) : l'onglet l'indique déjà.
 */
export type AthleticsEvent = {
  name: string;
  gender: "H" | "F";
  stage: "series" | "finale";
  time: string; // "HH:MM" (Europe/Paris)
};

export const ATHLETICS_EVENTS: readonly AthleticsEvent[] = [
  // Séries (après-midi)
  { name: "400 m", gender: "H", stage: "series", time: "15:15" },
  { name: "400 m", gender: "F", stage: "series", time: "15:15" },
  { name: "100 m", gender: "H", stage: "series", time: "16:10" },
  { name: "100 m", gender: "F", stage: "series", time: "16:10" },
  // Finales (après-midi)
  { name: "3 km", gender: "F", stage: "finale", time: "13:15" },
  { name: "3 km", gender: "H", stage: "finale", time: "13:45" },
  { name: "800 m", gender: "H", stage: "finale", time: "15:05" },
  { name: "800 m", gender: "F", stage: "finale", time: "15:05" },
  { name: "4×100 m", gender: "H", stage: "finale", time: "16:20" },
  { name: "4×100 m", gender: "F", stage: "finale", time: "16:20" },
  { name: "4×400 m", gender: "H", stage: "finale", time: "16:30" },
  { name: "4×400 m", gender: "F", stage: "finale", time: "16:30" },
  { name: "400 m", gender: "H", stage: "finale", time: "16:40" },
  { name: "400 m", gender: "F", stage: "finale", time: "16:40" },
  { name: "100 m", gender: "H", stage: "finale", time: "16:40" },
  { name: "100 m", gender: "F", stage: "finale", time: "16:40" },
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
