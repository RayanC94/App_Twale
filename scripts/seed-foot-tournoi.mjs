#!/usr/bin/env node
// =========================================================
// Seed du tournoi FOOTBALL — 4 poules de 4, 24 matchs de poule.
// Source : feuille de match officielle (13 juin 2026).
//   node --env-file=.env.local scripts/seed-foot-tournoi.mjs
//
// Idempotent : remet à zéro la phase de poules foot (matchs group,
// poules, affectations) puis recrée tout. Les équipes génériques
// « Équipe Foot N » sont remplacées par les vrais noms.
// La phase finale (quarts/demies/finales) n'est PAS créée ici :
// elle dépend des classements et se saisira via l'admin /admin/matchs.
// =========================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (lance avec --env-file=.env.local)");
  process.exit(1);
}
const s = createClient(url, key, { auth: { persistSession: false } });

const GENDER = "H"; // le foot est masculin (cf. TeamsManager)

// --- Composition des poules (noms officiels figés) ---
const POULES = {
  "Poule A": ["LA TWALE", "FC Grands Champs", "UPEC", "LOKMANN"],
  "Poule B": ["FC APHP", "TAWHID FC", "BATMAN", "LES MACHINES"],
  "Poule C": ["FOOLEK EMPIRE", "BECCA JUNIOR", "0 Baraka", "BASIC FIT"],
  "Poule D": ["37 NATION", "BOUZELOUF FC", "HENRI BARBUSS", "L'Oréal Madrid"],
};
const OFFICIAL_NAMES = Object.values(POULES).flat();

// --- Calendrier : [poule, terrain (1-3), "HH:MM", domicile, extérieur] ---
const D = "2026-06-14";
const tz = "+02:00";
const MATCHES = [
  // 9h25
  ["Poule A", 1, "09:25", "LA TWALE", "FC Grands Champs"],
  ["Poule B", 2, "09:25", "FC APHP", "TAWHID FC"],
  ["Poule C", 3, "09:25", "FOOLEK EMPIRE", "BECCA JUNIOR"],
  // 9h50
  ["Poule D", 1, "09:50", "37 NATION", "BOUZELOUF FC"],
  ["Poule A", 2, "09:50", "UPEC", "LOKMANN"],
  ["Poule B", 3, "09:50", "LES MACHINES", "BATMAN"],
  // 10h15
  ["Poule C", 1, "10:15", "0 Baraka", "BASIC FIT"],
  ["Poule D", 2, "10:15", "HENRI BARBUSS", "L'Oréal Madrid"],
  ["Poule A", 3, "10:15", "LA TWALE", "UPEC"],
  // 10h40
  ["Poule B", 1, "10:40", "FC APHP", "BATMAN"],
  ["Poule C", 2, "10:40", "FOOLEK EMPIRE", "0 Baraka"],
  ["Poule D", 3, "10:40", "37 NATION", "HENRI BARBUSS"],
  // 11h05
  ["Poule A", 1, "11:05", "FC Grands Champs", "LOKMANN"],
  ["Poule B", 2, "11:05", "TAWHID FC", "LES MACHINES"],
  ["Poule C", 3, "11:05", "BECCA JUNIOR", "BASIC FIT"],
  // 11h30
  ["Poule D", 1, "11:30", "BOUZELOUF FC", "L'Oréal Madrid"],
  ["Poule A", 2, "11:30", "LA TWALE", "LOKMANN"],
  ["Poule B", 3, "11:30", "FC APHP", "LES MACHINES"],
  // 11h55
  ["Poule C", 1, "11:55", "FOOLEK EMPIRE", "BASIC FIT"],
  ["Poule D", 2, "11:55", "37 NATION", "L'Oréal Madrid"],
  ["Poule A", 3, "11:55", "FC Grands Champs", "UPEC"],
  // 12h20
  ["Poule B", 1, "12:20", "TAWHID FC", "BATMAN"],
  ["Poule C", 2, "12:20", "BECCA JUNIOR", "0 Baraka"],
  ["Poule D", 3, "12:20", "BOUZELOUF FC", "HENRI BARBUSS"],
];

const terrainName = (n) => `Terrain Foot ${n}`;
const kickoff = (hhmm) => `${D}T${hhmm}:00${tz}`;
const die = (msg, err) => { console.error("❌", msg, err?.message ?? err ?? ""); process.exit(1); };

// --- Sanity check du calendrier avant d'écrire quoi que ce soit ---
{
  const counts = {};
  for (const [pool, terrain, time, home, away] of MATCHES) {
    if (!POULES[pool]) die(`Poule inconnue dans MATCHES : ${pool}`);
    for (const t of [home, away]) {
      if (!POULES[pool].includes(t)) die(`Équipe « ${t} » absente de ${pool}`);
    }
    counts[`${time}|${terrain}`] = (counts[`${time}|${terrain}`] ?? 0) + 1;
    counts[`${time}|${home}`] = (counts[`${time}|${home}`] ?? 0) + 1;
    counts[`${time}|${away}`] = (counts[`${time}|${away}`] ?? 0) + 1;
  }
  for (const [k, v] of Object.entries(counts)) {
    if (v > 1) die(`Conflit de planning (même créneau) : ${k} apparaît ${v}×`);
  }
  if (MATCHES.length !== 24) die(`Attendu 24 matchs, défini ${MATCHES.length}`);
  console.log("✓ Calendrier cohérent (24 matchs, aucun conflit terrain/équipe par créneau)\n");
}

// 1) Reset de la phase de poules foot existante
console.log("→ Nettoyage de la phase de poules foot existante…");
{
  const { error: e1 } = await s.from("matches").delete().eq("sport", "foot").eq("stage", "group");
  if (e1) die("delete matches", e1);
  // pool_teams part en cascade avec pools, mais on cible explicitement les poules foot
  const { data: oldPools } = await s.from("pools").select("id").eq("sport", "foot");
  const oldPoolIds = (oldPools ?? []).map((p) => p.id);
  if (oldPoolIds.length) {
    await s.from("pool_teams").delete().in("pool_id", oldPoolIds);
    const { error: e2 } = await s.from("pools").delete().in("id", oldPoolIds);
    if (e2) die("delete pools", e2);
  }
}

// 2) Remplacer les équipes génériques par les vraies
console.log("→ Mise à jour des 16 équipes foot…");
{
  const { data: existing } = await s.from("teams").select("id,name").eq("sport", "foot");
  const obsolete = (existing ?? []).filter((t) => !OFFICIAL_NAMES.includes(t.name)).map((t) => t.id);
  if (obsolete.length) {
    const { error } = await s.from("teams").delete().in("id", obsolete);
    if (error) die("delete équipes génériques", error);
    console.log(`   ${obsolete.length} équipe(s) générique(s) supprimée(s)`);
  }
  const rows = OFFICIAL_NAMES.map((name) => ({ sport: "foot", gender: GENDER, name }));
  const { error } = await s.from("teams").upsert(rows, { onConflict: "sport,gender,name", ignoreDuplicates: true });
  if (error) die("upsert équipes", error);
}

// 3) Créer les 4 poules
console.log("→ Création des 4 poules…");
{
  const rows = Object.keys(POULES).map((label) => ({ sport: "foot", gender: GENDER, label }));
  const { error } = await s.from("pools").insert(rows);
  if (error) die("insert pools", error);
}

// 4) Construire les maps nom→id
const idByTeam = {}, idByPool = {}, idByField = {};
{
  const { data: teams } = await s.from("teams").select("id,name").eq("sport", "foot").eq("gender", GENDER);
  for (const t of teams ?? []) idByTeam[t.name] = t.id;
  const { data: pools } = await s.from("pools").select("id,label").eq("sport", "foot").eq("gender", GENDER);
  for (const p of pools ?? []) idByPool[p.label] = p.id;
  const { data: fields } = await s.from("fields").select("id,name");
  for (const f of fields ?? []) idByField[f.name] = f.id;

  for (const name of OFFICIAL_NAMES) if (!idByTeam[name]) die(`team id introuvable : ${name}`);
  for (const lbl of Object.keys(POULES)) if (!idByPool[lbl]) die(`pool id introuvable : ${lbl}`);
  for (let n = 1; n <= 3; n++) if (!idByField[terrainName(n)]) die(`terrain introuvable : ${terrainName(n)}`);
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

// 6) Créer les 24 matchs de poule
console.log("→ Création des 24 matchs de poule…");
{
  const rows = MATCHES.map(([pool, terrain, time, home, away]) => ({
    sport: "foot",
    gender: GENDER,
    stage: "group",
    pool_id: idByPool[pool],
    field_id: idByField[terrainName(terrain)],
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
  const { count: nTeams } = await s.from("teams").select("*", { count: "exact", head: true }).eq("sport", "foot");
  const { count: nPools } = await s.from("pools").select("*", { count: "exact", head: true }).eq("sport", "foot");
  const { data: matches } = await s.from("matches")
    .select("scheduled_at,field_id,team_home_id,team_away_id,team_home:teams!matches_team_home_id_fkey(name),team_away:teams!matches_team_away_id_fkey(name)")
    .eq("sport", "foot").eq("stage", "group").order("scheduled_at");
  const nBad = (matches ?? []).filter((m) => !m.team_home_id || !m.team_away_id || !m.field_id).length;

  console.log(`   Équipes foot : ${nTeams}`);
  console.log(`   Poules foot  : ${nPools}`);
  console.log(`   Matchs poule : ${matches?.length ?? 0}  (sans équipe/terrain : ${nBad})`);
  if (nTeams !== 16 || nPools !== 4 || (matches?.length ?? 0) !== 24 || nBad !== 0)
    die("Comptes inattendus — vérifier au-dessus.");

  console.log("\n   Aperçu :");
  for (const m of matches ?? []) {
    const t = new Date(m.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
    const h = Array.isArray(m.team_home) ? m.team_home[0]?.name : m.team_home?.name;
    const a = Array.isArray(m.team_away) ? m.team_away[0]?.name : m.team_away?.name;
    console.log(`     ${t}  ${h} vs ${a}`);
  }
  console.log("\n✅ Tournoi foot seedé : 16 équipes, 4 poules, 24 matchs de poule.");
}
