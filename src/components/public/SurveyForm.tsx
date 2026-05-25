"use client";

import { useState, useTransition } from "react";
import { submitSurvey } from "@/actions/survey";

type Stand = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
};

export default function SurveyForm({ stands }: { stands: Stand[] }) {
  const [selectedStand, setSelectedStand] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
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
      <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <legend className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Stand préféré du village santé
        </legend>
        {stands.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Aucun stand disponible pour le moment.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stands.map((s) => {
              const checked = selectedStand === s.id;
              return (
                <li key={s.id}>
                  <label
                    className={`flex items-center gap-3 rounded-xl p-3 ring-1 transition cursor-pointer ${
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
      </fieldset>

      {/* Note */}
      <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <legend className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Note globale de la journée
        </legend>
        <div className="mt-3 flex items-center justify-center gap-2" role="radiogroup" aria-label="Note de 1 à 5">
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
      </fieldset>

      {/* Commentaire */}
      <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <legend className="px-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
          Un commentaire ? (facultatif)
        </legend>
        <textarea
          name="comment"
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
      </fieldset>

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
        Réponses anonymes. Aucune donnée personnelle n'est stockée.
      </p>
    </form>
  );
}
