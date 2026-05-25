import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const EXPECTED_TABLES = [
  "staff", "staff_sessions", "staff_login_attempts",
  "teams", "pools", "pool_teams", "fields", "matches",
  "athletics_events", "athletes", "event_results",
  "schedule_items",
  "health_stands", "health_speakers", "health_documents",
  "map_pois", "foodtruck_items", "photos", "sponsors", "survey_responses",
  "app_settings",
];

export async function GET() {
  const supabase = createServiceClient();

  const present: string[] = [];
  const missing: string[] = [];
  const tableCounts: Record<string, number | string> = {};

  for (const table of EXPECTED_TABLES) {
    // Pas de head:true — ça ment quand la table n'existe pas.
    // SELECT explicite + count séparé.
    const { error: existsError } = await supabase
      .from(table)
      .select("*")
      .limit(1);
    if (existsError) {
      missing.push(table);
      tableCounts[table] = `ERROR: ${existsError.message}`;
      continue;
    }
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    present.push(table);
    tableCounts[table] = count ?? 0;
  }

  const allTablesPresent = missing.length === 0;
  const seedSeemsApplied =
    typeof tableCounts.health_stands === "number" && tableCounts.health_stands >= 5 &&
    typeof tableCounts.schedule_items === "number" && tableCounts.schedule_items >= 5 &&
    typeof tableCounts.athletics_events === "number" && tableCounts.athletics_events >= 10;

  return NextResponse.json({
    ok: allTablesPresent && seedSeemsApplied,
    env: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    schema: {
      expected: EXPECTED_TABLES.length,
      present: present.length,
      missing,
    },
    seed: { applied: seedSeemsApplied },
    counts: tableCounts,
  });
}
