"use client";

import { useState, useTransition } from "react";
import { submitQuiz } from "@/actions/quiz";
import {
  ECRANS_QUESTIONS,
  ECRANS_SCALE,
  ECRANS_BANDS,
  gradeEcrans,
  type EcransAnswers,
  type EcransBand,
} from "@/lib/quizzes";

const TONE: Record<EcransBand["tone"], { bg: string; text: string; ring: string }> = {
  good: { bg: "#1F9E94", text: "#0f5e58", ring: "#1F9E94" },
  watch: { bg: "#D99A00", text: "#8a6400", ring: "#D99A00" },
  warn: { bg: "#E2620E", text: "#9c3f06", ring: "#E2620E" },
  alert: { bg: "#C92A2A", text: "#9b1c1c", ring: "#C92A2A" },
};

type ResultState = ReturnType<typeof gradeEcrans> | null;

function scrollToTop() {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export default function EcransTestForm() {
  const [answers, setAnswers] = useState<EcransAnswers>({});
  const [result, setResult] = useState<ResultState>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = ECRANS_QUESTIONS.filter((q) => typeof answers[q.id] === "number").length;

  function setValue(qid: string, value: number) {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    if (answeredCount < ECRANS_QUESTIONS.length) {
      setError("Merci de répondre à toutes les questions.");
      return;
    }
    const graded = gradeEcrans(answers);
    setResult(graded);
    formData.set("quiz_slug", "ecrans");
    formData.set("answers", JSON.stringify(answers));
    scrollToTop();
    startTransition(async () => {
      const res = await submitQuiz(formData);
      setSaved(!res.error);
    });
  }

  if (result) {
    return <EcransResult result={result} saved={saved} />;
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Légende de l'échelle */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
        <p className="text-sm font-semibold text-[color:var(--color-omas-navy)]">Pour chaque question :</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[color:var(--color-muted)]">
          {ECRANS_SCALE.map((s) => (
            <li key={s.value} className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[color:var(--color-omas-cream)] text-[11px] font-bold text-[color:var(--color-omas-navy)]">
                {s.value}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {ECRANS_QUESTIONS.map((q, i) => {
        const current = answers[q.id];
        return (
          <div key={q.id} className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-omas-navy)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <h3 id={`${q.id}-label`} className="text-sm font-semibold text-[color:var(--color-omas-navy)]">
                {q.prompt}
              </h3>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby={`${q.id}-label`}>
              {ECRANS_SCALE.map((s) => {
                const checked = current === s.value;
                return (
                  <label
                    key={s.value}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2.5 ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[color:var(--color-omas-navy)] has-[:focus-visible]:ring-offset-1 ${
                      checked
                        ? "bg-[color:var(--color-omas-teal)] text-white ring-[color:var(--color-omas-teal)]"
                        : "text-[color:var(--color-foreground)] ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={s.value}
                      checked={checked}
                      onChange={() => setValue(q.id, s.value)}
                      className="sr-only"
                    />
                    <span className="text-base font-bold leading-none">{s.value}</span>
                    <span className={`text-[10px] leading-tight ${checked ? "text-white/90" : "text-[color:var(--color-muted)]"}`}>
                      {s.short}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

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
        {isPending ? "Calcul…" : `Voir mon résultat (${answeredCount}/${ECRANS_QUESTIONS.length})`}
      </button>
      <p className="text-center text-[11px] text-[color:var(--color-muted)]">
        Test indicatif et anonyme — il ne remplace pas l’avis d’un professionnel de santé.
      </p>
    </form>
  );
}

function EcransResult({ result, saved }: { result: NonNullable<ResultState>; saved: boolean | null }) {
  const { score, max, band } = result;
  const tone = TONE[band.tone];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-[color:var(--color-border)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
          Votre score
        </p>
        <p className="mt-2 font-[family-name:var(--font-outfit)] text-4xl font-bold" style={{ color: tone.text }}>
          {score}
          <span className="text-2xl text-[color:var(--color-muted)]"> / {max}</span>
        </p>
        <span
          className="mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white"
          style={{ backgroundColor: tone.bg }}
        >
          {band.label}
        </span>
        <p className="mt-3 text-sm text-balance text-[color:var(--color-foreground)]">{band.message}</p>
        {saved === false && (
          <p className="mt-2 text-[11px] text-[color:var(--color-muted)]">
            (Votre réponse n’a pas pu être enregistrée — votre résultat reste affiché.)
          </p>
        )}
      </div>

      {/* Échelle d'interprétation complète */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
          Interprétation
        </h2>
        <ul className="mt-3 space-y-2">
          {ECRANS_BANDS.map((b) => {
            const active = b.key === band.key;
            const t = TONE[b.tone];
            return (
              <li
                key={b.key}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition ${active ? "ring-2" : "ring-1 ring-[color:var(--color-border)]"}`}
                style={active ? { ["--tw-ring-color" as string]: t.ring, backgroundColor: `${t.bg}10` } : undefined}
              >
                <span
                  className="w-14 shrink-0 text-center text-xs font-bold tabular-nums text-white rounded-md py-1"
                  style={{ backgroundColor: t.bg }}
                >
                  {b.min}–{b.max}
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-semibold text-[color:var(--color-foreground)]">{b.label}</span>
                  <span className="block text-xs text-[color:var(--color-muted)]">{b.message}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Besoin d'aide ? */}
      <div className="rounded-2xl bg-[color:var(--color-omas-navy)] p-5 text-white">
        <p className="font-[family-name:var(--font-outfit)] font-bold">Besoin d’aide&nbsp;?</p>
        <p className="mt-1 text-sm text-white/90">
          Parlez-en à un professionnel de santé — médecin, psychologue — ou directement à l’équipe du stand prévention,
          présente sur place.
        </p>
      </div>
    </div>
  );
}
