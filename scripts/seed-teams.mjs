#!/usr/bin/env node
// Crée les équipes génériques du tournoi (noms non nominatifs, décision du 12 juin 2026) :
// 16 équipes foot hommes + 12 équipes volley mixte.
// Idempotent : la contrainte unique (sport, gender, name) ignore les doublons.
//
//   node --env-file=.env.local scripts/seed-teams.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const teams = [
  ...Array.from({ length: 16 }, (_, i) => ({
    sport: "foot",
    gender: "H",
    name: `Équipe Foot ${i + 1}`,
    short_name: `F${i + 1}`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    sport: "volley",
    gender: "mixte",
    name: `Équipe Volley ${i + 1}`,
    short_name: `V${i + 1}`,
  })),
];

const { data, error } = await supabase
  .from("teams")
  .upsert(teams, { onConflict: "sport,gender,name", ignoreDuplicates: true })
  .select();

if (error) {
  console.error(`✗ teams : ${error.message}`);
  process.exit(1);
}
console.log(`✓ teams créées/présentes (${data.length} insérées, ${teams.length} attendues au total)`);
