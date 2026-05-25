"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Status = "scheduled" | "live" | "finished" | "cancelled";

type Props = {
  matchId: string;
  initialScoreHome: number | null;
  initialScoreAway: number | null;
  initialStatus: Status;
};

type MatchRow = {
  score_home: number | null;
  score_away: number | null;
  status: Status;
};

export default function LiveScore({ matchId, initialScoreHome, initialScoreAway, initialStatus }: Props) {
  const [scoreHome, setScoreHome] = useState<number | null>(initialScoreHome);
  const [scoreAway, setScoreAway] = useState<number | null>(initialScoreAway);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const next = payload.new as MatchRow;
          setScoreHome(next.score_home);
          setScoreAway(next.score_away);
          setStatus(next.status);
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const isLive = status === "live";
  const isFinished = status === "finished";
  const hasScore = scoreHome !== null && scoreAway !== null;

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
      <div className="flex items-center justify-center gap-2">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-omas-teal)] text-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            En direct
          </span>
        )}
        {isFinished && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-omas-navy)]/10 text-[color:var(--color-omas-navy)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            Match terminé
          </span>
        )}
        {status === "scheduled" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-muted)]/15 text-[color:var(--color-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            À venir
          </span>
        )}
      </div>
      <div
        className={`mt-4 text-center font-mono tabular-nums text-6xl font-bold text-[color:var(--color-omas-navy)] transition-transform ${
          pulse ? "scale-110" : "scale-100"
        }`}
      >
        {hasScore ? (
          <span>
            {scoreHome}
            <span className="px-3 text-[color:var(--color-muted)] font-light">–</span>
            {scoreAway}
          </span>
        ) : (
          <span className="text-[color:var(--color-muted)] text-3xl font-light">— vs —</span>
        )}
      </div>
    </div>
  );
}
