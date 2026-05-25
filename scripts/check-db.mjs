#!/usr/bin/env node
// Sonde la DB directement via REST (sans head:true qui ment).
//   node --env-file=.env.local scripts/check-db.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  "staff", "teams", "pools", "fields", "matches",
  "athletics_events", "athletes", "schedule_items",
  "health_stands", "health_documents",
  "map_pois", "photos", "sponsors", "survey_responses", "app_settings",
];

console.log("Probing Supabase tables via plain SELECT:\n");
for (const t of tables) {
  const { data, error } = await supabase.from(t).select("*").limit(1);
  if (error) {
    console.log(`  ❌ ${t.padEnd(22)} ${error.message}`);
  } else {
    console.log(`  ✓ ${t.padEnd(22)} (${data.length} row${data.length === 1 ? "" : "s"} sampled)`);
  }
}
