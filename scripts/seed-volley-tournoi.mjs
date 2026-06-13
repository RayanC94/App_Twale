#!/usr/bin/env node
// =========================================================
// Seed du tournoi VOLLEY — 2 poules de 6, 30 matchs de poule.
// Source : feuille de match officielle (13 juin 2026).
//   node --env-file=.env.local scripts/seed-volley-tournoi.mjs
//
// Idempotent : remet à zéro la phase de poules volley puis recrée tout.
// Noms définitifs (les génériques « Équipe Volley N » sont remplacés).
// ⚠️ Correction appliquée vs la feuille : pour éviter qu'« Équipe 8 » joue
// 2 fois à 12h25, on a échangé deux matchs :
//   - 9h45 Terrain 1 : « FC MSEMEN vs Les Machines » → « 530 IQ vs Équipe 8 »
//   - 12h25 Terrain 3 : « 530 IQ vs Équipe 8 » → « FC MSEMEN vs Les Machines »
// La phase finale (quarts/demies/finales) se saisira via /admin/matchs.
// =========================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (lance avec --env-file=.env.local)");
  process.exit(1);
}
const s = createClient(url, key, { auth: { persistSession: false } });

const GENDER = "mixte"; // le volley est mixte (cf. /tournoi/volley)

// --- Composition des poules (noms officiels figés) ---
const POULES = {
  "Poule A": ["FC MSEMEN", "EL MANO", "Les Machines", "530 IQ", "Jackson Five", "Équipe 8"],
  "Poule B": ["Smash DRAGONS", "MMOP", "HYPOVOLLEYMIQUE", "Les volleyers de coupe", "LesDZAlpha", "Les Bras Cassés"],
};
const OFFICIAL_NAMES = Object.values(POULES).flat();

// --- Calendrier corrigé : [poule, terrain (1-3), "HH:MM", domicile, extérieur] ---
const D = "2026-06-14";
const tz = "+02:00";
const MATCHES = [
  // 9h25
  ["Poule A", 1, "09:25", "FC MSEMEN", "EL MANO"],
  ["Poule B", 2, "09:25", "Smash DRAGONS", "MMOP"],
  ["Poule A", 3, "09:25", "Les Machines", "530 IQ"],
  // 9h45  (Terrain 1 corrigé : ex « FC MSEMEN vs Les Machines »)
  ["Poule A", 1, "09:45", "530 IQ", "Équipe 8"],
  ["Poule B", 2, "09:45", "HYPOVOLLEYMIQUE", "Les volleyers de coupe"],
  ["Poule B", 3, "09:45", "LesDZAlpha", "Les Bras Cassés"],
  // 10h05
  ["Poule A", 1, "10:05", "EL MANO", "530 IQ"],
  ["Poule B", 2, "10:05", "Smash DRAGONS", "HYPOVOLLEYMIQUE"],
  ["Poule B", 3, "10:05", "MMOP", "Les volleyers de coupe"],
  // 10h25
  ["Poule A", 1, "10:25", "FC MSEMEN", "Jackson Five"],
  ["Poule B", 2, "10:25", "Smash DRAGONS", "Les volleyers de coupe"],
  ["Poule A", 3, "10:25", "EL MANO", "Équipe 8"],
  // 10h45
  ["Poule A", 1, "10:45", "Les Machines", "Jackson Five"],
  ["Poule B", 2, "10:45", "MMOP", "LesDZAlpha"],
  ["Poule B", 3, "10:45", "HYPOVOLLEYMIQUE", "Les Bras Cassés"],
  // 11h05
  ["Poule A", 1, "11:05", "FC MSEMEN", "Équipe 8"],
  ["Poule B", 2, "11:05", "Smash DRAGONS", "LesDZAlpha"],
  ["Poule A", 3, "11:05", "530 IQ", "Jackson Five"],
  // 11h25
  ["Poule A", 1, "11:25", "EL MANO", "Jackson Five"],
  ["Poule B", 2, "11:25", "MMOP", "Les Bras Cassés"],
  ["Poule A", 3, "11:25", "Les Machines", "Équipe 8"],
  // 11h45
  ["Poule A", 1, "11:45", "FC MSEMEN", "530 IQ"],
  ["Poule B", 2, "11:45", "HYPOVOLLEYMIQUE", "LesDZAlpha"],
  ["Poule B", 3, "11:45", "Les volleyers de coupe", "Les Bras Cassés"],
  // 12h05
  ["Poule A", 1, "12:05", "EL MANO", "Les Machines"],
  ["Poule B", 2, "12:05", "Smash DRAGONS", "Les Bras Cassés"],
  ["Poule B", 3, "12:05", "MMOP", "HYPOVOLLEYMIQUE"],
  // 12h25  (Terrain 3 corrigé : ex « 530 IQ vs Équipe 8 »)
  ["Poule A", 1, "12:25", "Jackson Five", "Équipe 8"],
  ["Poule B", 2, "12:25", "Les volleyers de coupe", "LesDZAlpha"],
  ["Poule A", 3, "12:25", "FC MSEMEN", "Les Machines"],
];

const VOLLEY_TERRAINS = { 1: "Terrain Volley A", 2: "Terrain Volley B", 3: "Terrain Volley C" };
const kickoff = (hhmm) => `${D}T${hhmm}:00${tz}`;
const die = (msg, err) => { console.error("❌", msg, err?.message ?? err ?? ""); process.exit(1); };

// --- Sanity checks avant toute écriture ---
{
  if (MATCHES.length !== 30) die(`Attendu 30 matchs, défini ${MATCHES.length}`);
  const slotCount = {};
  const pairsByPool = { "Poule A": new Set(), "Poule B": new Set() };
  for (const [pool, terrain, time, home, away] of MATCHES) {
    if (!POULES[pool]) die(`Poule inconnue : ${pool}`);
    for (const t of [home, away]) if (!POULES[pool].includes(t)) die(`Équipe « ${t} » absente de ${pool}`);
    // pas 2 matchs sur le même terrain au même créneau, ni une équipe 2 fois
    slotCount[`${time}|T${terrain}`] = (slotCount[`${time}|T${terrain}`] ?? 0) + 1;
    slotCount[`${time}|${home}`] = (slotCount[`${time}|${home}`] ?? 0) + 1;
    slotCount[`${time}|${away}`] = (slotCount[`${time}|${away}`] ?? 0) + 1;
    // round-robin : chaque paire une seule fois
    const pair = [home, away].sort().join(" ~ ");
    if (pairsByPool[pool].has(pair)) die(`Match en double dans ${pool} : ${pair}`);
    pairsByPool[pool].add(pair);
  }
  for (const [k, v] of Object.entries(slotCount)) if (v > 1) die(`Conflit de planning : ${k} apparaît ${v}×`);
  // chaque poule de 6 = 15 affrontements
  for (const [pool, teams] of Object.entries(POULES)) {
    if (pairsByPool[pool].size !== 15) die(`${pool} : ${pairsByPool[pool].size} matchs (attendu 15 — round-robin incomplet)`);
  }
  console.log("✓ Calendrier cohérent : 30 matchs, round-robin complet (2×15), aucun conflit terrain/équipe par créneau\n");
}

// 1) Reset de la phase de poules volley existante
console.log("→ Nettoyage de la phase de poules volley existante…");
{
  const { error: e1 } = await s.from("matches").delete().eq("sport", "volley").eq("stage", "group");
  if (e1) die("delete matches", e1);
  const { data: oldPools } = await s.from("pools").select("id").eq("sport", "volley");
  const oldPoolIds = (oldPools ?? []).map((p) => p.id);
  if (oldPoolIds.length) {
    await s.from("pool_teams").delete().in("pool_id", oldPoolIds);
    const { error: e2 } = await s.from("pools").delete().in("id", oldPoolIds);
    if (e2) die("delete pools", e2);
  }
}

// 2) Remplacer les équipes génériques par les vraies
console.log("→ Mise à jour des 12 équipes volley…");
{
  const { data: existing } = await s.from("teams").select("id,name").eq("sport", "volley");
  const obsolete = (existing ?? []).filter((t) => !OFFICIAL_NAMES.includes(t.name)).map((t) => t.id);
  if (obsolete.length) {
    const { error } = await s.from("teams").delete().in("id", obsolete);
    if (error) die("delete équipes génériques", error);
    console.log(`   ${obsolete.length} équipe(s) générique(s) supprimée(s)`);
  }
  const rows = OFFICIAL_NAMES.map((name) => ({ sport: "volley", gender: GENDER, name }));
  const { error } = await s.from("teams").upsert(rows, { onConflict: "sport,gender,name", ignoreDuplicates: true });
  if (error) die("upsert équipes", error);
}

// 3) Créer les 2 poules
console.log("→ Création des 2 poules…");
{
  const rows = Object.keys(POULES).map((label) => ({ sport: "volley", gender: GENDER, label }));
  const { error } = await s.from("pools").insert(rows);
  if (error) die("insert pools", error);
}

// 4) Maps nom→id
const idByTeam = {}, idByPool = {}, idByField = {};
{
  const { data: teams } = await s.from("teams").select("id,name").eq("sport", "volley").eq("gender", GENDER);
  for (const t of teams ?? []) idByTeam[t.name] = t.id;
  const { data: pools } = await s.from("pools").select("id,label").eq("sport", "volley").eq("gender", GENDER);
  for (const p of pools ?? []) idByPool[p.label] = p.id;
  const { data: fields } = await s.from("fields").select("id,name");
  for (const f of fields ?? []) idByField[f.name] = f.id;

  for (const name of OFFICIAL_NAMES) if (!idByTeam[name]) die(`team id introuvable : ${name}`);
  for (const lbl of Object.keys(POULES)) if (!idByPool[lbl]) die(`pool id introuvable : ${lbl}`);
  for (const fname of Object.values(VOLLEY_TERRAINS)) if (!idByField[fname]) die(`terrain introuvable : ${fname}`);
}

// 5) Affectation des équipes aux poules
console.log("→ Affectation des équipes aux poules…");
{
  const rows = [];
  for (const [label, names] of Object.entries(POULES))
    for (const name of names) rows.push({ pool_id: idByPool[label], team_id: idByTeam[name] });
  const { error } = await s.from("pool_teams").insert(rows);
  if (error) die("insert pool_teams", error);
}

// 6) Créer les 30 matchs de poule
console.log("→ Création des 30 matchs de poule…");
{
  const rows = MATCHES.map(([pool, terrain, time, home, away]) => ({
    sport: "volley",
    gender: GENDER,
    stage: "group",
    pool_id: idByPool[pool],
    field_id: idByField[VOLLEY_TERRAINS[terrain]],
    scheduled_at: kickoff(time),
    team_home_id: idByTeam[home],
    team_away_id: idByTeam[away],
    status: "scheduled",
  }));
  const { error } = await s.from("matches").insert(rows);
  if (error) die("insert matches", error);
}

// 7) Vérification finale
console.log("\n→ Vérification…");
{
  const { count: nTeams } = await s.from("teams").select("*", { count: "exact", head: true }).eq("sport", "volley");
  const { count: nPools } = await s.from("pools").select("*", { count: "exact", head: true }).eq("sport", "volley");
  const { data: matches } = await s.from("matches")
    .select("scheduled_at,field_id,team_home_id,team_away_id,team_home:teams!matches_team_home_id_fkey(name),team_away:teams!matches_team_away_id_fkey(name)")
    .eq("sport", "volley").eq("stage", "group").order("scheduled_at");
  const nBad = (matches ?? []).filter((m) => !m.team_home_id || !m.team_away_id || !m.field_id).length;

  console.log(`   Équipes volley : ${nTeams}`);
  console.log(`   Poules volley  : ${nPools}`);
  console.log(`   Matchs poule   : ${matches?.length ?? 0}  (sans équipe/terrain : ${nBad})`);
  if (nTeams !== 12 || nPools !== 2 || (matches?.length ?? 0) !== 30 || nBad !== 0)
    die("Comptes inattendus — vérifier au-dessus.");

  console.log("\n   Aperçu :");
  for (const m of matches ?? []) {
    const t = new Date(m.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
    const h = Array.isArray(m.team_home) ? m.team_home[0]?.name : m.team_home?.name;
    const a = Array.isArray(m.team_away) ? m.team_away[0]?.name : m.team_away?.name;
    console.log(`     ${t}  ${h} vs ${a}`);
  }
  console.log("\n✅ Tournoi volley seedé : 12 équipes, 2 poules, 30 matchs de poule.");
}
