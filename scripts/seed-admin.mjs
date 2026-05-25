#!/usr/bin/env node
// Crée (ou met à jour) un compte admin de test avec un PIN connu.
// Usage : node --env-file=.env.local scripts/seed-admin.mjs

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}

const PIN = "987654";
const DISPLAY_NAME = "Admin test";

const supabase = createClient(url, key, { auth: { persistSession: false } });

const pinHash = await bcrypt.hash(PIN, 10);

const { data: existing, error: selectErr } = await supabase
  .from("staff")
  .select("id")
  .eq("display_name", DISPLAY_NAME)
  .maybeSingle();

if (selectErr) {
  console.error("Erreur lecture staff :", selectErr.message);
  process.exit(1);
}

if (existing?.id) {
  const { error } = await supabase
    .from("staff")
    .update({ pin_hash: pinHash, role: "admin", sport: null, active: true })
    .eq("id", existing.id);
  if (error) {
    console.error("Erreur update staff :", error.message);
    process.exit(1);
  }
  console.log(`Compte mis à jour : ${DISPLAY_NAME} (id=${existing.id})`);
} else {
  const { data, error } = await supabase
    .from("staff")
    .insert({
      display_name: DISPLAY_NAME,
      role: "admin",
      sport: null,
      pin_hash: pinHash,
      active: true,
    })
    .select("id")
    .single();
  if (error) {
    console.error("Erreur insert staff :", error.message);
    process.exit(1);
  }
  console.log(`Compte créé : ${DISPLAY_NAME} (id=${data.id})`);
}

console.log("");
console.log(`PIN admin de test : ${PIN}`);
console.log("Connecte-toi sur /admin/login avec ce code.");
