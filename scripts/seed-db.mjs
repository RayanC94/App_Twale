#!/usr/bin/env node
// Seed la base Supabase via l'API service-role.
// Idempotent : upserts + ignore les conflits.
// Lit les vars depuis .env.local automatiquement (chargé via --env-file).
//
//   node --env-file=.env.local scripts/seed-db.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
let totalErrors = 0;

function ok(label, n) { console.log(`  ✓ ${label}${n != null ? ` (${n})` : ""}`); }
function fail(label, err) { totalErrors++; console.error(`  ✗ ${label} : ${err.message ?? err}`); }

// ---- Stands village santé ----------------------------------------------------
const stands = [
  { slug: "orientation",  name: "Orientation",              description: "Filières et carrières : médecine, kinésithérapie, paramédical. Témoignages et conseils de pros & étudiants.", color: "#5B2A8C", icon: "graduation-cap", position: 1 },
  { slug: "bucco",        name: "Hygiène bucco-dentaire",   description: "Prévention des caries, gestes d'hygiène, dépistage rapide avec un chirurgien-dentiste.",                  color: "#8B5DBA", icon: "tooth",          position: 2 },
  { slug: "premiers",     name: "Premiers secours",         description: "Gestes qui sauvent : PLS, massage cardiaque, alerte. Ateliers pratiques avec démonstration.",             color: "#3D1B5E", icon: "life-buoy",      position: 3 },
  { slug: "addictologie", name: "Addictologie",             description: "Écrans, tabac, alcool : auto-dépistage et orientation avec des addictologues.",                          color: "#5B2A8C", icon: "shield-alert",   position: 4 },
  { slug: "kine",         name: "Kiné / Ostéo",             description: "Posture, étirements, gestion des blessures sportives. Conseils par des kinés et ostéopathes.",            color: "#8B5DBA", icon: "activity",       position: 5 },
];
{
  const { data, error } = await supabase.from("health_stands").upsert(stands, { onConflict: "slug" }).select();
  error ? fail("health_stands", error) : ok("health_stands", data.length);
}

// ---- Terrains ----------------------------------------------------------------
const fields = [
  { name: "Terrain Foot 1",  sport: "foot"   },
  { name: "Terrain Foot 2",  sport: "foot"   },
  { name: "Terrain Foot 3",  sport: "foot"   },
  { name: "Terrain Volley A", sport: "volley" },
  { name: "Terrain Volley B", sport: "volley" },
  { name: "Terrain Volley C", sport: "volley" },
  { name: "Terrain Volley D", sport: "volley" },
  { name: "Piste Athlé",     sport: null     },
];
{
  const { data, error } = await supabase.from("fields").upsert(fields, { onConflict: "name" }).select();
  error ? fail("fields", error) : ok("fields", data.length);
}

// ---- Programme de la journée -------------------------------------------------
const schedule = [
  { title: "Accueil des équipes & installation",          description: "Inscription, distribution des dossards et installation.", starts_at: "2026-06-14T08:00:00+02:00", ends_at: "2026-06-14T08:45:00+02:00", location: "Entrée principale", category: "ouverture" },
  { title: "Briefing général & ouverture officielle",      description: "Mot d'accueil de La TWALE, rappel des règles.",          starts_at: "2026-06-14T08:45:00+02:00", ends_at: "2026-06-14T09:00:00+02:00", location: "Place centrale",    category: "ouverture" },
  { title: "Phases de poules — Foot & Athlé séries",       description: "Foot sur 3 terrains. Séries de relais 4×100/4×400, puis 100/400/800m, puis 3km.", starts_at: "2026-06-14T09:00:00+02:00", ends_at: "2026-06-14T11:05:00+02:00", location: "Terrains & piste",  category: "tournoi" },
  { title: "Phases de poules — Volley démarre",            description: "Volley sur 4 terrains, en parallèle de la fin du foot.", starts_at: "2026-06-14T11:05:00+02:00", ends_at: "2026-06-14T12:45:00+02:00", location: "Terrains volley",   category: "tournoi" },
  { title: "Village santé — ouverture",                    description: "Les 5 stands accessibles toute la journée.",             starts_at: "2026-06-14T09:00:00+02:00", ends_at: "2026-06-14T18:00:00+02:00", location: "Place centrale",    category: "sante" },
  { title: "Pause déjeuner — food truck & buvette",        description: "Restauration sur place.",                                starts_at: "2026-06-14T12:45:00+02:00", ends_at: "2026-06-14T14:00:00+02:00", location: "Food truck",        category: "pause" },
  { title: "Phases finales — Foot, Volley, Athlé",         description: "Demi-finales, quarts, petites et grandes finales.",      starts_at: "2026-06-14T14:00:00+02:00", ends_at: "2026-06-14T17:30:00+02:00", location: "Terrains & piste",  category: "tournoi" },
  { title: "Finales — consolidation des résultats",        description: "Grande finale foot femmes puis hommes.",                 starts_at: "2026-06-14T17:30:00+02:00", ends_at: "2026-06-14T18:15:00+02:00", location: "Terrains",          category: "tournoi" },
  { title: "Cérémonie officielle & remise des récompenses",description: "Podiums et clôture de la journée.",                      starts_at: "2026-06-14T18:15:00+02:00", ends_at: "2026-06-14T18:45:00+02:00", location: "Place centrale",    category: "podium" },
];
{
  await supabase.from("schedule_items").delete().gt("id", "00000000-0000-0000-0000-000000000000");
  const { data, error } = await supabase.from("schedule_items").insert(schedule).select();
  error ? fail("schedule_items", error) : ok("schedule_items", data.length);
}

// ---- Athlétisme : épreuves ---------------------------------------------------
const athletics = [
  { name: "Relais 4×100", gender: "H", stage: "series", scheduled_at: "2026-06-14T09:00:00+02:00", position: 10 },
  { name: "Relais 4×100", gender: "F", stage: "series", scheduled_at: "2026-06-14T09:00:00+02:00", position: 11 },
  { name: "Relais 4×400", gender: "H", stage: "series", scheduled_at: "2026-06-14T09:30:00+02:00", position: 12 },
  { name: "Relais 4×400", gender: "F", stage: "series", scheduled_at: "2026-06-14T09:30:00+02:00", position: 13 },
  { name: "100m",         gender: "F", stage: "series", scheduled_at: "2026-06-14T10:15:00+02:00", position: 20 },
  { name: "400m",         gender: "F", stage: "series", scheduled_at: "2026-06-14T10:20:00+02:00", position: 21 },
  { name: "800m",         gender: "F", stage: "series", scheduled_at: "2026-06-14T10:30:00+02:00", position: 22 },
  { name: "100m",         gender: "H", stage: "series", scheduled_at: "2026-06-14T10:40:00+02:00", position: 23 },
  { name: "400m",         gender: "H", stage: "series", scheduled_at: "2026-06-14T10:45:00+02:00", position: 24 },
  { name: "800m",         gender: "H", stage: "series", scheduled_at: "2026-06-14T10:55:00+02:00", position: 25 },
  { name: "3km",          gender: "F", stage: "series", scheduled_at: "2026-06-14T11:30:00+02:00", position: 30 },
  { name: "3km",          gender: "H", stage: "series", scheduled_at: "2026-06-14T12:00:00+02:00", position: 31 },
  { name: "Finale 800m",         gender: "H", stage: "finale", scheduled_at: "2026-06-14T14:50:00+02:00", position: 50 },
  { name: "Finale 800m",         gender: "F", stage: "finale", scheduled_at: "2026-06-14T14:50:00+02:00", position: 51 },
  { name: "Finale Relais 4×100", gender: "H", stage: "finale", scheduled_at: "2026-06-14T15:40:00+02:00", position: 60 },
  { name: "Finale Relais 4×100", gender: "F", stage: "finale", scheduled_at: "2026-06-14T15:40:00+02:00", position: 61 },
  { name: "Finale Relais 4×400", gender: "H", stage: "finale", scheduled_at: "2026-06-14T15:45:00+02:00", position: 62 },
  { name: "Finale Relais 4×400", gender: "F", stage: "finale", scheduled_at: "2026-06-14T15:45:00+02:00", position: 63 },
  { name: "Finale 100m",         gender: "H", stage: "finale", scheduled_at: "2026-06-14T16:55:00+02:00", position: 70 },
  { name: "Finale 100m",         gender: "F", stage: "finale", scheduled_at: "2026-06-14T16:55:00+02:00", position: 71 },
  { name: "Finale 400m",         gender: "H", stage: "finale", scheduled_at: "2026-06-14T17:05:00+02:00", position: 72 },
  { name: "Finale 400m",         gender: "F", stage: "finale", scheduled_at: "2026-06-14T17:05:00+02:00", position: 73 },
];
{
  await supabase.from("athletics_events").delete().gt("id", "00000000-0000-0000-0000-000000000000");
  const { data, error } = await supabase.from("athletics_events").insert(athletics).select();
  error ? fail("athletics_events", error) : ok("athletics_events", data.length);
}

// ---- Paramètres globaux ------------------------------------------------------
const settings = [
  {
    key: "sos",
    value: {
      phone: "+33 0 00 00 00 00",
      location_label: "Infirmerie — Tente blanche près de l'entrée",
      samu: "15",
      pompiers: "18",
      note: "À mettre à jour avec le numéro réel avant le 14 juin",
    },
  },
  {
    key: "event",
    value: {
      name: "Tournoi multisports",
      organizer: "",
      tagline: "Sport, Santé, Prévention",
      date: "2026-06-14",
      opens_at: "2026-06-14T09:00:00+02:00",
      closes_at: "2026-06-14T19:00:00+02:00",
      venue: "Stade Jean Bouin",
      city: "Choisy",
      max_capacity: 800,
      expected_participants: 300,
    },
  },
];
{
  const { data, error } = await supabase.from("app_settings").upsert(settings, { onConflict: "key" }).select();
  error ? fail("app_settings", error) : ok("app_settings", data.length);
}

// ---- Buckets Storage ---------------------------------------------------------
const buckets = [
  { id: "team-logos",  public: true },
  { id: "sponsors",    public: true },
  { id: "foodtruck",   public: true },
  { id: "health-pdfs", public: true },
  { id: "gallery",     public: true },
  { id: "map",         public: true },
];
for (const b of buckets) {
  const { error } = await supabase.storage.createBucket(b.id, { public: b.public });
  if (error && !error.message.includes("already exists")) {
    fail(`bucket ${b.id}`, error);
  } else {
    ok(`bucket ${b.id}`);
  }
}

console.log(totalErrors === 0 ? "\n✅ Seed terminé sans erreur." : `\n⚠️  Seed terminé avec ${totalErrors} erreur(s).`);
process.exit(totalErrors > 0 ? 1 : 0);
