/**
 * Constantes globales — fallbacks pour ne jamais perdre les infos critiques
 * même si la DB est indisponible le jour J.
 */

export const TOURNOI_DATE_ISO = "2026-06-14";
export const TOURNOI_DATE_LABEL = "Dimanche 14 juin 2026";
export const TOURNOI_HOURS = "9h – 19h";

export const EVENT = {
  name: "Tournoi OMAS",
  full_name: "Tournoi multisports OMAS",
  tagline: "Sport, Santé, Prévention",
  venue: "Stade Jean Bouin",
  city: "Choisy",
} as const;

export const ASSO = {
  name: "OMAS",
  full_name: "Organisation Musulmane des Acteurs de Santé",
  email: "contact@omas.fr",
} as const;

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

export type HealthStandSlug = (typeof HEALTH_STANDS)[number]["slug"];
