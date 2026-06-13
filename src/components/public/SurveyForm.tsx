"use client";

import { useState, useTransition } from "react";
import { submitSurvey } from "@/actions/survey";

type Stand = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
};

const MOMENTS = [
  { value: "foot", label: "Tournoi de foot", icon: "⚽" },
  { value: "volley", label: "Tournoi de volley", icon: "🏐" },
  { value: "athle", label: "Athlétisme", icon: "🏃" },
  { value: "village_sante", label: "Village santé", icon: "💚" },
  { value: "famille", label: "Animations & famille", icon: "🎪" },
  { value: "food", label: "Food trucks", icon: "🍽️" },
] as const;

const RETURN_OPTIONS = [
  { value: "oui", label: "Oui !" },
  { value: "peut_etre", label: "Peut-être" },
  { value: "non", label: "Non" },
] as const;

export default function SurveyForm({ stands }: { stands: Stand[] }) {
  const [selectedStand, setSelectedStand] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [favoriteMoment, setFavoriteMoment] = useState<string>("");
  const [wouldReturn, setWouldReturn] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitSurvey(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.success) {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-8 ring-1 ring-[color:var(--color-border)] text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-omas-teal)] text-white text-2xl"
          aria-hidden
        >
          ✓
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-outfit)] text-xl font-semibold text-[color:var(--color-omas-navy)]">
          Merci pour votre retour !
        </h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted)] text-balance">
          Votre réponse a bien été enregistrée. À très vite pour la prochaine édition.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Stand préféré */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h3 id="survey-stand" className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Stand préféré du village santé
        </h3>
        {stands.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Aucun stand disponible pour le moment.
          </p>
        ) : (
          <ul className="mt-3 space-y-2" role="radiogroup" aria-labelledby="survey-stand">
            {stands.map((s) => {
              const checked = selectedStand === s.id;
              return (
                <li key={s.id}>
                  <label
                    className={`flex items-center gap-3 rounded-xl p-3 ring-1 transition cursor-pointer focus-within:ring-2 focus-within:ring-[color:var(--color-omas-teal)] ${
                      checked
                        ? "ring-[color:var(--color-omas-teal)] bg-[color:var(--color-omas-teal)]/5"
                        : "ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="favorite_stand_id"
                      value={s.id}
                      checked={checked}
                      onChange={() => setSelectedStand(s.id)}
                      className="sr-only"
                    />
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: s.color ?? "var(--color-omas-teal)" }}
                      aria-hidden
                    >
                      {s.name.charAt(0)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-[color:var(--color-foreground)]">
                      {s.name}
                    </span>
                    <span
                      className={`h-5 w-5 rounded-full ring-2 transition ${
                        checked
                          ? "bg-[color:var(--color-omas-teal)] ring-[color:var(--color-omas-teal)]"
                          : "ring-[color:var(--color-border)]"
                      }`}
                      aria-hidden
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Note */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h3 id="survey-note" className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Note globale de la journée
        </h3>
        <div className="mt-3 flex items-center justify-center gap-2" role="radiogroup" aria-labelledby="survey-note">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hoverRating || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-4xl leading-none transition active:scale-90"
              >
                <span
                  className={active ? "text-[color:var(--color-omas-teal)]" : "text-[color:var(--color-border)]"}
                  aria-hidden
                >
                  ★
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="rating" value={rating > 0 ? String(rating) : ""} />
        <p className="mt-2 text-center text-xs text-[color:var(--color-muted)]">
          {rating > 0 ? `${rating}/5` : "Cliquez sur une étoile"}
        </p>
      </div>

      {/* Moment préféré */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h3 id="survey-moment" className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Qu’avez-vous préféré dans la journée ?
        </h3>
        <ul className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="survey-moment">
          {MOMENTS.map((m) => {
            const checked = favoriteMoment === m.value;
            return (
              <li key={m.value}>
                <label
                  className={`flex items-center gap-2 rounded-xl p-3 ring-1 transition cursor-pointer focus-within:ring-2 focus-within:ring-[color:var(--color-omas-teal)] ${
                    checked
                      ? "ring-[color:var(--color-omas-teal)] bg-[color:var(--color-omas-teal)]/5"
                      : "ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="favorite_moment"
                    value={m.value}
                    checked={checked}
                    onChange={() => setFavoriteMoment(m.value)}
                    className="sr-only"
                  />
                  <span className="text-lg" aria-hidden>{m.icon}</span>
                  <span className="text-xs font-medium text-[color:var(--color-foreground)]">{m.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Reviendrez-vous ? */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h3 id="survey-return" className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Reviendrez-vous l’année prochaine ?
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="survey-return">
          {RETURN_OPTIONS.map((o) => {
            const checked = wouldReturn === o.value;
            return (
              <label
                key={o.value}
                className={`flex items-center justify-center rounded-xl p-3 text-sm font-medium ring-1 transition cursor-pointer focus-within:ring-2 focus-within:ring-[color:var(--color-omas-teal)] ${
                  checked
                    ? "ring-[color:var(--color-omas-teal)] bg-[color:var(--color-omas-teal)] text-white"
                    : "ring-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:ring-[color:var(--color-omas-teal)]/40"
                }`}
              >
                <input
                  type="radio"
                  name="would_return"
                  value={o.value}
                  checked={checked}
                  onChange={() => setWouldReturn(o.value)}
                  className="sr-only"
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Commentaire */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h3 id="survey-comment" className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Un commentaire ? (facultatif)
        </h3>
        <textarea
          name="comment"
          aria-labelledby="survey-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={4}
          placeholder="Vos impressions, suggestions…"
          className="mt-3 w-full resize-y rounded-xl border-0 bg-[color:var(--color-omas-cream)] p-3 text-sm text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
        />
        <p className="mt-1 text-right text-[11px] text-[color:var(--color-muted)] tabular-nums">
          {comment.length}/500
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[color:var(--color-omas-teal)] px-6 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-[color:var(--color-omas-teal-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Envoi en cours…" : "Envoyer ma réponse"}
      </button>

      <p className="text-center text-[11px] text-[color:var(--color-muted)]">
        Réponses anonymes. Aucune donnée personnelle n’est stockée.
      </p>
    </form>
  );
}
