import Link from "next/link";

export type MatchCardData = {
  id: string;
  scheduled_at: string;
  status: "scheduled" | "live" | "finished" | "cancelled";
  score_home: number | null;
  score_away: number | null;
  placeholder_home: string | null;
  placeholder_away: string | null;
  team_home: { name: string } | null;
  team_away: { name: string } | null;
  field: { name: string } | null;
};

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function labelOf(team: { name: string } | null, placeholder: string | null) {
  if (team?.name) return team.name;
  if (placeholder) return placeholder;
  return "À définir";
}

export default function MatchCard({ match }: { match: MatchCardData }) {
  const home = labelOf(match.team_home, match.placeholder_home);
  const away = labelOf(match.team_away, match.placeholder_away);
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isCancelled = match.status === "cancelled";
  const hasScore = match.score_home !== null && match.score_away !== null;

  return (
    <Link
      href={`/tournoi/match/${match.id}`}
      className={`block rounded-2xl bg-white p-4 ring-1 transition active:scale-[0.99] hover:ring-[color:var(--color-omas-teal)]/40 ${
        isLive
          ? "ring-[color:var(--color-omas-teal)] shadow-lg shadow-[color:var(--color-omas-teal)]/10"
          : "ring-[color:var(--color-border)]"
      } ${isCancelled ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-mono tabular-nums text-[color:var(--color-omas-navy)]">
          {formatHour(match.scheduled_at)}
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-omas-teal)] text-white px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> En cours
            </span>
          )}
          {isFinished && (
            <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-omas-navy)]/10 text-[color:var(--color-omas-navy)] px-2 py-0.5">
              Terminé
            </span>
          )}
          {isCancelled && (
            <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-muted)]/15 text-[color:var(--color-muted)] px-2 py-0.5">
              Annulé
            </span>
          )}
          {match.field?.name && (
            <span className="text-[10px] text-[color:var(--color-muted)]">{match.field.name}</span>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-sm font-medium text-[color:var(--color-foreground)] truncate text-right">{home}</div>
        <div className="font-mono tabular-nums text-base font-bold text-[color:var(--color-omas-navy)] min-w-[44px] text-center">
          {hasScore ? (
            <span>
              {match.score_home}
              <span className="px-1 text-[color:var(--color-muted)]">–</span>
              {match.score_away}
            </span>
          ) : (
            <span className="text-[color:var(--color-muted)]">vs</span>
          )}
        </div>
        <div className="text-sm font-medium text-[color:var(--color-foreground)] truncate">{away}</div>
      </div>
    </Link>
  );
}
