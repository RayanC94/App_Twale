#!/usr/bin/env node
// LECTURE SEULE — récupère les résultats live des poules (foot + volley),
// calcule les classements (même tie-break que PoolStandings), liste les
// qualifiés (top 2 par poule) et vérifie que toutes les poules sont finies.
//   node --env-file=.env.local scripts/read-standings.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("env manquant"); process.exit(1); }
const s = createClient(url, key, { auth: { persistSession: false } });

const SPORTS = [
  { sport: "foot", gender: "H" },
  { sport: "volley", gender: "mixte" },
];

for (const { sport, gender } of SPORTS) {
  console.log(`\n========== ${sport.toUpperCase()} (${gender}) ==========`);

  const { data: pools } = await s.from("pools")
    .select("id,label").eq("sport", sport).eq("gender", gender).order("label");
  const { data: pt } = await s.from("pool_teams").select("pool_id,team_id");
  const { data: teams } = await s.from("teams").select("id,name").eq("sport", sport).eq("gender", gender);
  const nameById = Object.fromEntries((teams ?? []).map((t) => [t.id, t.name]));

  const { data: matches } = await s.from("matches")
    .select("id,stage,status,pool_id,scheduled_at,score_home,score_away,team_home_id,team_away_id,winner_team_id")
    .eq("sport", sport).eq("gender", gender).order("scheduled_at");

  const group = (matches ?? []).filter((m) => m.stage === "group");
  const notFinished = group.filter((m) => m.status !== "finished");
  console.log(`Matchs de poule : ${group.length} — terminés : ${group.filter(m=>m.status==="finished").length}, non terminés : ${notFinished.length}`);
  if (notFinished.length) {
    for (const m of notFinished)
      console.log(`   ⚠️ NON TERMINÉ [${m.status}] ${nameById[m.team_home_id]} vs ${nameById[m.team_away_id]} (${m.score_home ?? "-"}–${m.score_away ?? "-"})`);
  }

  // Classement par poule
  const teamsByPool = {};
  for (const p of pools ?? []) teamsByPool[p.id] = [];
  for (const row of pt ?? []) if (teamsByPool[row.pool_id]) teamsByPool[row.pool_id].push(row.team_id);

  for (const p of pools ?? []) {
    const ids = teamsByPool[p.id] ?? [];
    const stat = Object.fromEntries(ids.map((id) => [id, { id, name: nameById[id], J:0,V:0,N:0,D:0,Pts:0,BP:0,BC:0 }]));
    for (const m of group.filter((g) => g.pool_id === p.id && g.status === "finished")) {
      const h = stat[m.team_home_id], a = stat[m.team_away_id];
      if (!h || !a) continue;
      const sh = m.score_home ?? 0, sa = m.score_away ?? 0;
      h.J++; a.J++; h.BP += sh; h.BC += sa; a.BP += sa; a.BC += sh;
      if (sh > sa) { h.V++; a.D++; h.Pts += 3; }
      else if (sa > sh) { a.V++; h.D++; a.Pts += 3; }
      else { h.N++; a.N++; h.Pts += 1; a.Pts += 1; }
    }
    const ranked = Object.values(stat).sort((x, y) => {
      if (y.Pts !== x.Pts) return y.Pts - x.Pts;
      const dx = x.BP - x.BC, dy = y.BP - y.BC;
      if (dy !== dx) return dy - dx;
      return y.BP - x.BP;
    });
    console.log(`\n  ${p.label}`);
    ranked.forEach((r, i) => {
      const diff = r.BP - r.BC;
      const tag = i < 2 ? "✅" : "  ";
      console.log(`   ${tag} ${i+1}. ${r.name.padEnd(34)} J${r.J} Pts ${String(r.Pts).padStart(2)}  ${r.V}V ${r.N}N ${r.D}D  BP ${r.BP} BC ${r.BC} (${diff>=0?"+":""}${diff})`);
    });
    // signaler les égalités non départagées sur les 3 critères (top 2 frontière)
    const tieKey = (r) => `${r.Pts}|${r.BP-r.BC}|${r.BP}`;
    if (ranked[1] && ranked[2] && tieKey(ranked[1]) === tieKey(ranked[2]))
      console.log(`      ⚠️ Égalité parfaite 2e/3e (${ranked[1].name} / ${ranked[2].name}) — à départager manuellement`);
  }

  // Phases finales déjà créées ?
  const bracket = (matches ?? []).filter((m) => m.stage !== "group");
  console.log(`\n  Phase finale déjà en base : ${bracket.length} match(s)`);
  for (const m of bracket)
    console.log(`     [${m.stage}] ${nameById[m.team_home_id] ?? "(libellé)"} vs ${nameById[m.team_away_id] ?? "(libellé)"}`);
}
console.log("\n— fin —");
