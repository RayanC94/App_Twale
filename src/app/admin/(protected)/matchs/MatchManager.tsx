"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addTeamToPool,
  createMatch,
  createPool,
  deleteMatch,
  deletePool,
  removeTeamFromPool,
  setMatchStatus,
  updateMatchScore,
} from "@/actions/tournoi";

export type TeamOption = { id: string; name: string };
export type FieldOption = { id: string; name: string };
export type PoolWithTeams = { id: string; label: string; teams: TeamOption[] };
export type AdminMatch = {
  id: string;
  stage: string;
  scheduled_at: string;
  status: "scheduled" | "live" | "finished" | "cancelled";
  score_home: number | null;
  score_away: number | null;
  pool_id: string | null;
  home_label: string;
  away_label: string;
  field_name: string | null;
};

type Props = {
  sport: "foot" | "volley";
  gender: "H" | "F" | "mixte";
  teams: TeamOption[];
  pools: PoolWithTeams[];
  fields: FieldOption[];
  matches: AdminMatch[];
};

const STAGE_LABEL: Record<string, string> = {
  group: "Poule",
  qf: "Quart",
  sf: "Demi",
  final: "Finale",
  third: "3e place",
};

const STATUS_META: Record<AdminMatch["status"], { label: string; className: string }> = {
  scheduled: { label: "Prévu", className: "bg-[color:var(--color-omas-cream)] text-[color:var(--color-omas-navy)]" },
  live: { label: "En cours", className: "bg-red-100 text-red-700" },
  finished: { label: "Terminé", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulé", className: "bg-gray-200 text-gray-500" },
};

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

export default function MatchManager({ sport, gender, teams, pools, fields, matches }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ success?: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function submit(action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>, entries: Record<string, string>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(entries)) fd.set(k, v);
    run(() => action(fd));
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </p>
      )}

      <PoolsSection
        sport={sport}
        gender={gender}
        teams={teams}
        pools={pools}
        isPending={isPending}
        submit={submit}
        run={run}
      />

      <NewMatchForm
        sport={sport}
        gender={gender}
        teams={teams}
        pools={pools}
        fields={fields}
        isPending={isPending}
        run={run}
      />

      <MatchList pools={pools} matches={matches} isPending={isPending} submit={submit} />
    </div>
  );
}

// =========================================================
// POULES
// =========================================================

function PoolsSection({
  sport,
  gender,
  teams,
  pools,
  isPending,
  submit,
  run,
}: {
  sport: string;
  gender: string;
  teams: TeamOption[];
  pools: PoolWithTeams[];
  isPending: boolean;
  submit: (action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>, entries: Record<string, string>) => void;
  run: (action: () => Promise<{ success?: boolean; error?: string }>) => void;
}) {
  const [label, setLabel] = useState("");

  function handleCreate(formData: FormData) {
    run(async () => {
      const result = await createPool(formData);
      if (!result.error) setLabel("");
      return result;
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
        Poules
      </h2>

      {pools.length === 0 && (
        <p className="mt-3 px-1 text-sm text-[color:var(--color-muted)]">
          Aucune poule. Créez « Poule A », « Poule B »… puis ajoutez-y les équipes.
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {pools.map((pool) => {
          const remaining = teams.filter((t) => !pool.teams.some((pt) => pt.id === t.id));
          return (
            <li key={pool.id} className="rounded-xl bg-[color:var(--color-omas-cream)]/60 p-3 ring-1 ring-[color:var(--color-border)]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[color:var(--color-omas-navy)]">{pool.label}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (window.confirm(`Supprimer ${pool.label} ?`)) {
                      submit(deletePool, { id: pool.id });
                    }
                  }}
                  className="rounded-lg px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </div>

              <ul className="mt-2 flex flex-wrap gap-1.5">
                {pool.teams.map((t) => (
                  <li key={t.id}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium ring-1 ring-[color:var(--color-border)]">
                      {t.name}
                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={`Retirer ${t.name} de ${pool.label}`}
                        onClick={() => submit(removeTeamFromPool, { pool_id: pool.id, team_id: t.id })}
                        className="text-[color:var(--color-muted)] transition hover:text-red-600 disabled:opacity-60"
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
                {pool.teams.length === 0 && (
                  <li className="text-xs text-[color:var(--color-muted)]">Aucune équipe.</li>
                )}
              </ul>

              {remaining.length > 0 && (
                <select
                  disabled={isPending}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) submit(addTeamToPool, { pool_id: pool.id, team_id: e.target.value });
                  }}
                  aria-label={`Ajouter une équipe à ${pool.label}`}
                  className="mt-2 w-full rounded-xl border-0 bg-white px-3 py-2 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)] disabled:opacity-60"
                >
                  <option value="">+ Ajouter une équipe…</option>
                  {remaining.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>

      <form action={handleCreate} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="sport" value={sport} />
        <input type="hidden" name="gender" value={gender} />
        <input
          type="text"
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nouvelle poule (ex. Poule A)"
          maxLength={30}
          required
          className="min-w-0 flex-1 rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-xl bg-[color:var(--color-omas-navy)] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          Créer
        </button>
      </form>
    </div>
  );
}

// =========================================================
// NOUVEAU MATCH
// =========================================================

function NewMatchForm({
  sport,
  gender,
  teams,
  pools,
  fields,
  isPending,
  run,
}: {
  sport: string;
  gender: string;
  teams: TeamOption[];
  pools: PoolWithTeams[];
  fields: FieldOption[];
  isPending: boolean;
  run: (action: () => Promise<{ success?: boolean; error?: string }>) => void;
}) {
  const [stage, setStage] = useState("group");
  const [poolId, setPoolId] = useState("");
  const [homeMode, setHomeMode] = useState<"team" | "placeholder">("team");
  const [awayMode, setAwayMode] = useState<"team" | "placeholder">("team");

  // En phase de poules, seules les équipes de la poule choisie sont proposées
  // (le serveur impose la même règle).
  const teamOptions =
    stage === "group" ? pools.find((p) => p.id === poolId)?.teams ?? [] : teams;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Pas de prop `action` : on garde les champs remplis si le serveur refuse.
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    run(async () => {
      const result = await createMatch(formData);
      if (!result.error) form.reset();
      return result;
    });
  }

  const teamPicker = (
    side: "home" | "away",
    mode: "team" | "placeholder",
    setMode: (m: "team" | "placeholder") => void,
  ) => {
    const label = side === "home" ? "Équipe domicile" : "Équipe extérieure";
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-[color:var(--color-muted)]">{label}</span>
          <button
            type="button"
            onClick={() => setMode(mode === "team" ? "placeholder" : "team")}
            className="text-[11px] text-[color:var(--color-omas-teal)] underline underline-offset-2"
          >
            {mode === "team" ? "Libellé libre" : "Choisir une équipe"}
          </button>
        </div>
        {mode === "team" ? (
          <select
            name={`team_${side}_id`}
            aria-label={label}
            required
            defaultValue=""
            disabled={stage === "group" && !poolId}
            className="w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)] disabled:opacity-60"
          >
            <option value="" disabled>
              {stage === "group" && !poolId ? "Choisissez d'abord la poule" : "— Équipe —"}
            </option>
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name={`placeholder_${side}`}
            aria-label={`${label} (libellé libre)`}
            placeholder="ex. 1er Poule A"
            maxLength={40}
            required
            className="w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
          />
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
        Nouveau match
      </h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <input type="hidden" name="sport" value={sport} />
        <input type="hidden" name="gender" value={gender} />

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="px-1 text-xs font-medium text-[color:var(--color-muted)]">Phase</span>
            <select
              name="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
            >
              <option value="group">Poule</option>
              <option value="qf">Quart de finale</option>
              <option value="sf">Demi-finale</option>
              <option value="third">3e place</option>
              <option value="final">Finale</option>
            </select>
          </label>

          {stage === "group" ? (
            <label className="block">
              <span className="px-1 text-xs font-medium text-[color:var(--color-muted)]">Poule</span>
              <select
                name="pool_id"
                required
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                className="mt-1 w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
              >
                <option value="" disabled>
                  — Poule —
                </option>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div />
          )}
        </div>

        {teamPicker("home", homeMode, setHomeMode)}
        {teamPicker("away", awayMode, setAwayMode)}

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="px-1 text-xs font-medium text-[color:var(--color-muted)]">Heure</span>
            <input
              type="time"
              name="time"
              required
              className="mt-1 w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
            />
          </label>
          <label className="block">
            <span className="px-1 text-xs font-medium text-[color:var(--color-muted)]">Terrain</span>
            <select
              name="field_id"
              defaultValue=""
              className="mt-1 w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
            >
              <option value="">— Terrain —</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[color:var(--color-omas-teal)] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          Programmer le match
        </button>
      </form>
    </div>
  );
}

// =========================================================
// LISTE + SCORES
// =========================================================

function MatchList({
  pools,
  matches,
  isPending,
  submit,
}: {
  pools: PoolWithTeams[];
  matches: AdminMatch[];
  isPending: boolean;
  submit: (action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>, entries: Record<string, string>) => void;
}) {
  const poolLabel = (id: string | null) => pools.find((p) => p.id === id)?.label ?? null;

  if (matches.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center text-sm text-[color:var(--color-muted)] ring-1 ring-[color:var(--color-border)]">
        Aucun match programmé pour cette catégorie.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
        Programme & scores ({matches.length})
      </h2>
      <ul className="space-y-2">
        {matches.map((m) => {
          const status = STATUS_META[m.status];
          const scoreEditable = m.status === "scheduled" || m.status === "live";
          const stepper = (side: "home" | "away") => {
            const current = side === "home" ? m.score_home ?? 0 : m.score_away ?? 0;
            const apply = (delta: 1 | -1) =>
              submit(updateMatchScore, { id: m.id, side, delta: String(delta) });
            return (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPending || !scoreEditable || current === 0}
                  onClick={() => apply(-1)}
                  aria-label={`-1 ${side === "home" ? m.home_label : m.away_label}`}
                  className="h-8 w-8 rounded-lg bg-[color:var(--color-omas-cream)] text-base font-bold text-[color:var(--color-omas-navy)] transition active:scale-95 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-7 text-center font-mono text-lg font-bold tabular-nums text-[color:var(--color-omas-navy)]">
                  {current}
                </span>
                <button
                  type="button"
                  disabled={isPending || !scoreEditable}
                  onClick={() => apply(1)}
                  aria-label={`+1 ${side === "home" ? m.home_label : m.away_label}`}
                  className="h-8 w-8 rounded-lg bg-[color:var(--color-omas-teal)] text-base font-bold text-white transition active:scale-95 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            );
          };

          return (
            <li key={m.id} className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono tabular-nums font-semibold text-[color:var(--color-omas-navy)]">
                  {formatHour(m.scheduled_at)}
                </span>
                <span className="rounded-full bg-[color:var(--color-omas-cream)] px-2 py-0.5 font-medium text-[color:var(--color-omas-navy)]">
                  {m.stage === "group" ? poolLabel(m.pool_id) ?? "Poule" : STAGE_LABEL[m.stage] ?? m.stage}
                </span>
                {m.field_name && <span className="text-[color:var(--color-muted)]">📍 {m.field_name}</span>}
                <span className={`ml-auto rounded-full px-2 py-0.5 font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--color-foreground)]">
                    {m.home_label}
                  </span>
                  {stepper("home")}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--color-foreground)]">
                    {m.away_label}
                  </span>
                  {stepper("away")}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {m.status === "scheduled" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(setMatchStatus, { id: m.id, status: "live" })}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-60"
                  >
                    ▶ Démarrer
                  </button>
                )}
                {m.status === "live" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(setMatchStatus, { id: m.id, status: "finished" })}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-60"
                  >
                    ✔ Terminer
                  </button>
                )}
                {m.status === "finished" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(setMatchStatus, { id: m.id, status: "live" })}
                    className="rounded-lg bg-[color:var(--color-omas-cream)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-omas-navy)] transition active:scale-95 disabled:opacity-60"
                  >
                    Rouvrir
                  </button>
                )}
                {(m.status === "scheduled" || m.status === "live") && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(setMatchStatus, { id: m.id, status: "cancelled" })}
                    className="rounded-lg bg-[color:var(--color-omas-cream)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-muted)] transition active:scale-95 disabled:opacity-60"
                  >
                    Annuler
                  </button>
                )}
                {m.status === "cancelled" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(setMatchStatus, { id: m.id, status: "scheduled" })}
                    className="rounded-lg bg-[color:var(--color-omas-cream)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-omas-navy)] transition active:scale-95 disabled:opacity-60"
                  >
                    Rétablir
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (window.confirm("Supprimer définitivement ce match ?")) {
                      submit(deleteMatch, { id: m.id });
                    }
                  }}
                  className="ml-auto rounded-lg px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
