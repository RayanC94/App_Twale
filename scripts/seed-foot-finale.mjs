#!/usr/bin/env node
// =========================================================
// Seed de la PHASE FINALE foot (tableau complet) — 14 juin 2026.
//   node --env-file=.env.local scripts/seed-foot-finale.mjs
//
// Robuste & idempotent :
//   - recalcule les classements de poule DEPUIS la base (mêmes tie-breaks
//     que PoolStandings : Pts, puis diff. de buts, puis buts marqués) ;
//   - s'ARRÊTE si les 24 matchs de poule ne sont pas tous « finished » ;
//   - résout les équipes par leur ID réel (aucun nom d'équipe en dur) ;
//   - supprime d'éventuels matchs foot qf/sf/final/third existants, puis
//     insère le tableau complet :
//        QF1 = 1er A vs 2e B   (14:15, Terrain Foot 1)
//        QF2 = 1er C vs 2e D   (14:15, Terrain Foot 2)
//        QF3 = 1er B vs 2e A   (14:45, Terrain Foot 1)
//        QF4 = 1er D vs 2e C   (14:45, Terrain Foot 2)
//        Demi 1 = Vainqueur QF1 vs Vainqueur QF2   (15:30, Terrain Foot 1)
//        Demi 2 = Vainqueur QF3 vs Vainqueur QF4   (15:30, Terrain Foot 2)
//        Petite finale = Perdant Demi 1 vs Perdant Demi 2   (16:30, Terrain Foot 1)
//        Finale = Vainqueur Demi 1 vs Vainqueur Demi 2      (17:30, Terrain Foot 1)
//   Demies/finales sont posées en LIBELLÉS (placeholders) : on remplace par
//   les vraies équipes via /admin/matchs au fil des résultats.
// =========================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("❌ env manquant (lance avec --env-file=.env.local)"); process.exit(1); }
const s = createClient(url, key, { auth: { persistSession: false } });
const die = (msg, err) => { console.error("❌", msg, err?.message ?? err ?? ""); process.exit(1); };

const SPORT = "foot", GENDER = "H", D = "2026-06-14", tz = "+02:00";

// --- 1) Charger l'état des poules foot ---
const { data: pools } = await s.from("pools").select("id,label").eq("sport", SPORT).eq("gender", GENDER).order("label");
if (!pools || pools.length !== 4) die(`Attendu 4 poules foot, trouvé ${pools?.length ?? 0}`);
const poolByLabel = Object.fromEntries(pools.map((p) => [p.label, p.id]));
for (const lbl of ["Poule A", "Poule B", "Poule C", "Poule D"])
  if (!poolByLabel[lbl]) die(`Poule manquante : ${lbl}`);

const { data: pt } = await s.from("pool_teams").select("pool_id,team_id");
const { data: teams } = await s.from("teams").select("id,name").eq("sport", SPORT).eq("gender", GENDER);
const nameById = Object.fromEntries((teams ?? []).map((t) => [t.id, t.name]));

const { data: group } = await s.from("matches")
  .select("id,status,pool_id,score_home,score_away,team_home_id,team_away_id")
  .eq("sport", SPORT).eq("gender", GENDER).eq("stage", "group");

// --- 2) Garde-fou : toutes les poules doivent être terminées ---
const notFinished = (group ?? []).filter((m) => m.status !== "finished");
if ((group ?? []).length !== 24) die(`Attendu 24 matchs de poule, trouvé ${(group ?? []).length}`);
if (notFinished.length) die(`${notFinished.length} match(s) de poule pas terminé(s) — saisie incomplète, on n'écrit rien.`);

// --- 3) Classement par poule (mêmes critères que PoolStandings) ---
const teamsByPool = Object.fromEntries(pools.map((p) => [p.id, []]));
for (const row of pt ?? []) if (teamsByPool[row.pool_id]) teamsByPool[row.pool_id].push(row.team_id);

function rank(poolId) {
  const ids = teamsByPool[poolId] ?? [];
  const st = Object.fromEntries(ids.map((id) => [id, { id, Pts: 0, BP: 0, BC: 0 }]));
  for (const m of (group ?? []).filter((g) => g.pool_id === poolId)) {
    const h = st[m.team_home_id], a = st[m.team_away_id];
    if (!h || !a) continue;
    const sh = m.score_home ?? 0, sa = m.score_away ?? 0;
    h.BP += sh; h.BC += sa; a.BP += sa; a.BC += sh;
    if (sh > sa) h.Pts += 3; else if (sa > sh) a.Pts += 3; else { h.Pts += 1; a.Pts += 1; }
  }
  return Object.values(st).sort((x, y) => {
    if (y.Pts !== x.Pts) return y.Pts - x.Pts;
    const dx = x.BP - x.BC, dy = y.BP - y.BC;
    if (dy !== dx) return dy - dx;
    return y.BP - x.BP;
  });
}

const pos = {}; // pos["A"] = [id 1er, id 2e]
for (const lbl of ["Poule A", "Poule B", "Poule C", "Poule D"]) {
  const r = rank(poolByLabel[lbl]);
  if (r.length < 2) die(`${lbl} : moins de 2 équipes classées`);
  const letter = lbl.split(" ")[1];
  pos[letter] = [r[0].id, r[1].id];
}

console.log("→ Qualifiés (top 2 par poule) :");
for (const L of ["A", "B", "C", "D"])
  console.log(`   Poule ${L} : 1. ${nameById[pos[L][0]]}   2. ${nameById[pos[L][1]]}`);

// --- 4) Terrains ---
const { data: fields } = await s.from("fields").select("id,name");
const fieldByName = Object.fromEntries((fields ?? []).map((f) => [f.name, f.id]));
for (const fn of ["Terrain Foot 1", "Terrain Foot 2"])
  if (!fieldByName[fn]) die(`Terrain introuvable : ${fn}`);

// --- 5) Helpers ---
const kickoff = (hhmm) => `${D}T${hhmm}:00${tz}`;
const fld = (n) => fieldByName[n];

// --- 6) Reset d'une éventuelle phase finale foot ---
// Insertion dans l'ordre des dépendances pour câbler next_match_id :
//   finale + petite finale → demies (→ finale) → quarts (→ demies).
// La progression (vainqueur → tour suivant, perdant de demi → petite finale)
// est ensuite faite AUTOMATIQUEMENT côté serveur quand l'arbitre « Termine ».
console.log("\n→ Nettoyage d'une éventuelle phase finale foot existante…");
{
  const { error } = await s.from("matches").delete()
    .eq("sport", SPORT).eq("gender", GENDER).in("stage", ["qf", "sf", "final", "third"]);
  if (error) die("delete bracket foot", error);
}

// 6a) Finale + petite finale (aucun match aval)
console.log("→ Création finale + petite finale…");
const { data: finalIns, error: eFinal } = await s.from("matches").insert({
  sport: SPORT, gender: GENDER, stage: "final", bracket_slot: 1,
  field_id: fld("Terrain Foot 1"), scheduled_at: kickoff("17:30"),
  placeholder_home: "Vainqueur Demi 1", placeholder_away: "Vainqueur Demi 2", status: "scheduled",
}).select("id").single();
if (eFinal) die("insert finale", eFinal);
const finaleId = finalIns.id;

const { error: eThird } = await s.from("matches").insert({
  sport: SPORT, gender: GENDER, stage: "third", bracket_slot: 1,
  field_id: fld("Terrain Foot 1"), scheduled_at: kickoff("16:30"),
  placeholder_home: "Perdant Demi 1", placeholder_away: "Perdant Demi 2", status: "scheduled",
}).select("id").single();
if (eThird) die("insert petite finale", eThird);
// (le perdant de chaque demi est routé vers la petite finale par le code serveur)

// 6b) Demi-finales : vainqueur → finale (home/away)
console.log("→ Création des 2 demi-finales…");
const sfDefs = [
  { slot: 1, ph_home: "Vainqueur Quart 1", ph_away: "Vainqueur Quart 2", time: "15:30", field: "Terrain Foot 1", next_slot: "home" },
  { slot: 2, ph_home: "Vainqueur Quart 3", ph_away: "Vainqueur Quart 4", time: "15:30", field: "Terrain Foot 2", next_slot: "away" },
];
const { data: sfIns, error: eSf } = await s.from("matches").insert(
  sfDefs.map((d) => ({
    sport: SPORT, gender: GENDER, stage: "sf", bracket_slot: d.slot,
    field_id: fld(d.field), scheduled_at: kickoff(d.time),
    placeholder_home: d.ph_home, placeholder_away: d.ph_away,
    next_match_id: finaleId, next_match_slot: d.next_slot, status: "scheduled",
  })),
).select("id,bracket_slot");
if (eSf) die("insert demies", eSf);
const sfIdBySlot = Object.fromEntries((sfIns ?? []).map((r) => [r.bracket_slot, r.id]));
if (!sfIdBySlot[1] || !sfIdBySlot[2]) die("ids demies manquants");

// 6c) Quarts : équipes réelles (croisé standard), vainqueur → demi (home/away).
//     Permutation demandée : FC BEMSON–UPEC (QF3) à 14h15, LA TWALE–TWH FC (QF1) à 14h45.
console.log("→ Création des 4 quarts de finale…");
const qfDefs = [
  { slot: 1, home: pos.A[0], away: pos.B[1], time: "14:45", field: "Terrain Foot 1", next: sfIdBySlot[1], next_slot: "home" }, // 1A-2B → Demi 1 (dom.)
  { slot: 2, home: pos.C[0], away: pos.D[1], time: "14:15", field: "Terrain Foot 2", next: sfIdBySlot[1], next_slot: "away" }, // 1C-2D → Demi 1 (ext.)
  { slot: 3, home: pos.B[0], away: pos.A[1], time: "14:15", field: "Terrain Foot 1", next: sfIdBySlot[2], next_slot: "home" }, // 1B-2A → Demi 2 (dom.)
  { slot: 4, home: pos.D[0], away: pos.C[1], time: "14:45", field: "Terrain Foot 2", next: sfIdBySlot[2], next_slot: "away" }, // 1D-2C → Demi 2 (ext.)
];
{
  const { error } = await s.from("matches").insert(
    qfDefs.map((q) => ({
      sport: SPORT, gender: GENDER, stage: "qf", bracket_slot: q.slot,
      field_id: fld(q.field), scheduled_at: kickoff(q.time),
      team_home_id: q.home, team_away_id: q.away,
      next_match_id: q.next, next_match_slot: q.next_slot, status: "scheduled",
    })),
  );
  if (error) die("insert quarts", error);
}

// --- 7) Vérification finale ---
console.log("\n→ Vérification…");
{
  const STAGE_ORDER = { qf: 0, sf: 1, third: 2, final: 3 };
  const STAGE_LABEL = { qf: "Quart", sf: "Demi", third: "Petite finale", final: "Finale" };
  const { data: created } = await s.from("matches")
    .select("stage,scheduled_at,bracket_slot,placeholder_home,placeholder_away,field:fields(name),team_home:teams!matches_team_home_id_fkey(name),team_away:teams!matches_team_away_id_fkey(name)")
    .eq("sport", SPORT).eq("gender", GENDER).in("stage", ["qf", "sf", "final", "third"]);
  if ((created ?? []).length !== 8) die(`Attendu 8 matchs de phase finale, trouvé ${(created ?? []).length}`);
  const sorted = (created ?? []).sort((a, b) =>
    (STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]) || ((a.bracket_slot ?? 0) - (b.bracket_slot ?? 0)));
  for (const m of sorted) {
    const t = new Date(m.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
    const fname = Array.isArray(m.field) ? m.field[0]?.name : m.field?.name;
    const h = (Array.isArray(m.team_home) ? m.team_home[0]?.name : m.team_home?.name) ?? m.placeholder_home;
    const a = (Array.isArray(m.team_away) ? m.team_away[0]?.name : m.team_away?.name) ?? m.placeholder_away;
    const lbl = `${STAGE_LABEL[m.stage]}${m.stage === "qf" || m.stage === "sf" ? " " + m.bracket_slot : ""}`;
    console.log(`   ${lbl.padEnd(14)} ${t}  ${(fname ?? "").padEnd(14)}  ${h} vs ${a}`);
  }
  console.log("\n✅ Tableau foot créé : 4 quarts (équipes réelles) + 2 demies + petite finale + finale (libellés).");
  console.log("   → Progression AUTO : l'arbitre saisit le score et « Termine » ; le vainqueur monte");
  console.log("     dans la demi/finale, le perdant de demi descend en petite finale. Aucune autre manip.");
}
