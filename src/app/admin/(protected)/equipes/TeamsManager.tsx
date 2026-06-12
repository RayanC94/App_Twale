"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, deleteTeam } from "@/actions/tournoi";

export type TeamRow = {
  id: string;
  sport: "foot" | "volley";
  gender: "H" | "F" | "mixte";
  name: string;
};

type Sport = "foot" | "volley";
type Gender = "H" | "F" | "mixte";

const SPORT_LABEL: Record<Sport, string> = { foot: "⚽ Foot", volley: "🏐 Volley" };
const GENDER_LABEL: Record<Gender, string> = { H: "Hommes", F: "Femmes", mixte: "Mixte" };

export default function TeamsManager({
  teams,
  staffSport,
}: {
  teams: TeamRow[];
  staffSport: Sport | null;
}) {
  const sports: Sport[] = staffSport ? [staffSport] : ["foot", "volley"];
  const [sport, setSport] = useState<Sport>(sports[0]);
  // Foot : tournoi hommes uniquement (décision du 12 juin) ; volley : mixte.
  const gender: Gender = sport === "volley" ? "mixte" : "H";
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function switchSport(s: Sport) {
    setSport(s);
    setError(null);
  }

  const visible = teams.filter((t) => t.sport === sport && t.gender === gender);

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTeam(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function handleDelete(team: TeamRow) {
    if (!window.confirm(`Supprimer « ${team.name} » ? Ses matchs perdront cette équipe.`)) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", team.id);
      const result = await deleteTeam(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur sport / catégorie */}
      <div className="flex flex-wrap items-center gap-2">
        {sports.length > 1 && (
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-[color:var(--color-border)]">
            {sports.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => switchSport(s)}
                aria-pressed={sport === s}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  sport === s
                    ? "bg-[color:var(--color-omas-teal)] text-white"
                    : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-omas-cream)]"
                }`}
              >
                {SPORT_LABEL[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ajout */}
      <form
        action={handleAdd}
        className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-[color:var(--color-border)]"
      >
        <input type="hidden" name="sport" value={sport} />
        <input type="hidden" name="gender" value={gender} />
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Nom de l'équipe (${SPORT_LABEL[sport]} · ${GENDER_LABEL[gender]})`}
          maxLength={60}
          required
          className="min-w-0 flex-1 rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-xl bg-[color:var(--color-omas-teal)] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          Ajouter
        </button>
      </form>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </p>
      )}

      {/* Liste */}
      {visible.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-[color:var(--color-muted)] ring-1 ring-[color:var(--color-border)]">
          Aucune équipe {GENDER_LABEL[gender].toLowerCase()} pour le moment.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((t, i) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[color:var(--color-border)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-omas-cream)] text-xs font-bold text-[color:var(--color-omas-navy)]">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-[color:var(--color-foreground)]">
                {t.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(t)}
                disabled={isPending}
                aria-label={`Supprimer ${t.name}`}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-[color:var(--color-muted)]">
        {visible.length} équipe{visible.length > 1 ? "s" : ""} · {SPORT_LABEL[sport]} {GENDER_LABEL[gender]}
      </p>
    </div>
  );
}
