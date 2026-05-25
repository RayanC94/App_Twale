import { createServiceClient } from "@/lib/supabase/service";

type StandingRow = {
  pool_id: string;
  sport: string;
  pool_label: string;
  team_id: string;
  name: string;
  played: number | null;
  points: number | null;
  scored: number | null;
  conceded: number | null;
};

type PoolGroup = {
  pool_id: string;
  label: string;
  rows: StandingRow[];
};

async function getStandings(sport: "foot" | "volley", gender: "H" | "F" | "mixte"): Promise<PoolGroup[]> {
  const supabase = createServiceClient();
  const { data: pools } = await supabase
    .from("pools")
    .select("id,label")
    .eq("sport", sport)
    .eq("gender", gender)
    .order("label", { ascending: true });
  if (!pools || pools.length === 0) return [];

  const { data: standings } = await supabase
    .from("pool_standings")
    .select("pool_id,sport,pool_label,team_id,name,played,points,scored,conceded")
    .eq("sport", sport);

  const rows = (standings ?? []) as StandingRow[];
  const groups: PoolGroup[] = pools.map((p: { id: string; label: string }) => {
    const groupRows = rows
      .filter((r) => r.pool_id === p.id)
      .sort((a, b) => {
        const pa = a.points ?? 0;
        const pb = b.points ?? 0;
        if (pb !== pa) return pb - pa;
        const da = (a.scored ?? 0) - (a.conceded ?? 0);
        const db = (b.scored ?? 0) - (b.conceded ?? 0);
        if (db !== da) return db - da;
        return (b.scored ?? 0) - (a.scored ?? 0);
      });
    return { pool_id: p.id, label: p.label, rows: groupRows };
  });
  return groups;
}

export default async function PoolStandings({
  sport,
  gender,
}: {
  sport: "foot" | "volley";
  gender: "H" | "F" | "mixte";
}) {
  const groups = await getStandings(sport, gender);

  if (groups.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
        Les poules seront affichées dès que le tirage aura été effectué.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.pool_id} className="rounded-2xl bg-white ring-1 ring-[color:var(--color-border)] overflow-hidden">
          <div className="px-4 py-2.5 bg-[color:var(--color-omas-cream)] border-b border-[color:var(--color-border)]">
            <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-[color:var(--color-omas-navy)]">
              Poule {g.label}
            </h3>
          </div>
          {g.rows.length === 0 ? (
            <p className="px-4 py-4 text-xs text-[color:var(--color-muted)]">Équipes non assignées.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                  <th className="px-3 py-2 text-left font-semibold">Équipe</th>
                  <th className="px-2 py-2 text-center font-semibold w-8">J</th>
                  <th className="px-2 py-2 text-center font-semibold w-10">Pts</th>
                  <th className="px-2 py-2 text-center font-semibold w-8">BP</th>
                  <th className="px-2 py-2 text-center font-semibold w-8">BC</th>
                  <th className="px-2 py-2 text-center font-semibold w-10">+/-</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r, i) => {
                  const diff = (r.scored ?? 0) - (r.conceded ?? 0);
                  return (
                    <tr
                      key={r.team_id}
                      className={`border-t border-[color:var(--color-border)] ${
                        i === 0 ? "bg-[color:var(--color-omas-teal)]/5" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-[color:var(--color-foreground)] font-medium truncate max-w-[140px]">
                        <span className="inline-block w-4 text-[color:var(--color-muted)] tabular-nums">{i + 1}.</span>{" "}
                        {r.name}
                      </td>
                      <td className="px-2 py-2 text-center font-mono tabular-nums text-[color:var(--color-muted)]">
                        {r.played ?? 0}
                      </td>
                      <td className="px-2 py-2 text-center font-mono tabular-nums font-bold text-[color:var(--color-omas-navy)]">
                        {r.points ?? 0}
                      </td>
                      <td className="px-2 py-2 text-center font-mono tabular-nums text-[color:var(--color-muted)]">
                        {r.scored ?? 0}
                      </td>
                      <td className="px-2 py-2 text-center font-mono tabular-nums text-[color:var(--color-muted)]">
                        {r.conceded ?? 0}
                      </td>
                      <td
                        className={`px-2 py-2 text-center font-mono tabular-nums font-medium ${
                          diff > 0
                            ? "text-[color:var(--color-omas-teal)]"
                            : diff < 0
                              ? "text-[color:var(--color-muted)]"
                              : "text-[color:var(--color-muted)]"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
