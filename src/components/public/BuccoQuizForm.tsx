"use client";

import { useMemo, useState, useTransition } from "react";
import { submitQuiz } from "@/actions/quiz";
import {
  BUCCO_QUESTIONS,
  gradeBucco,
  type BuccoAnswers,
  type BuccoQuestion,
} from "@/lib/quizzes";

type ResultState = ReturnType<typeof gradeBucco> | null;

export default function BuccoQuizForm() {
  const [answers, setAnswers] = useState<BuccoAnswers>({});
  const [result, setResult] = useState<ResultState>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => BUCCO_QUESTIONS.filter((q) => q.type !== "text").length,
    []
  );

  function setSingle(qid: string, value: string) {
    setAnswers((a) => ({ ...a, [qid]: value }));
  }
  function toggleMulti(qid: string, value: string) {
    setAnswers((a) => {
      const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...a, [qid]: next };
    });
  }
  function setMatch(qid: string, rowId: string, value: string) {
    setAnswers((a) => {
      const cur = (a[qid] && typeof a[qid] === "object" && !Array.isArray(a[qid])
        ? a[qid]
        : {}) as Record<string, string>;
      return { ...a, [qid]: { ...cur, [rowId]: value } };
    });
  }
  function setText(qid: string, value: string) {
    setAnswers((a) => ({ ...a, [qid]: value }));
  }

  function handleSubmit(formData: FormData) {
    const graded = gradeBucco(answers);
    setResult(graded);
    formData.set("quiz_slug", "bucco");
    formData.set("answers", JSON.stringify(answers));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    startTransition(async () => {
      const res = await submitQuiz(formData);
      setSaved(!res.error);
    });
  }

  if (result) {
    return <BuccoResult answers={answers} result={result} total={total} saved={saved} />;
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {BUCCO_QUESTIONS.map((q, i) => (
        <QuestionCard key={q.id} index={i + 1} q={q}>
          <QuestionInputs
            q={q}
            answers={answers}
            onSingle={setSingle}
            onMulti={toggleMulti}
            onMatch={setMatch}
            onText={setText}
          />
        </QuestionCard>
      ))}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[color:var(--color-omas-teal)] px-6 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-[color:var(--color-omas-teal-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Validation…" : "Voir mes résultats"}
      </button>
      <p className="text-center text-[11px] text-[color:var(--color-muted)]">
        Réponses anonymes — aucune donnée personnelle n’est stockée.
      </p>
    </form>
  );
}

function QuestionCard({
  index,
  q,
  children,
}: {
  index: number;
  q: BuccoQuestion;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
      <legend className="px-1">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--color-omas-teal)] text-xs font-bold text-white align-middle">
          {index}
        </span>
        <span className="text-sm font-semibold text-[color:var(--color-omas-navy)]">{q.prompt}</span>
      </legend>
      {q.type === "multi" && q.hint && (
        <p className="mt-2 px-1 text-xs text-[color:var(--color-muted)]">{q.hint}</p>
      )}
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function QuestionInputs({
  q,
  answers,
  onSingle,
  onMulti,
  onMatch,
  onText,
}: {
  q: BuccoQuestion;
  answers: BuccoAnswers;
  onSingle: (qid: string, v: string) => void;
  onMulti: (qid: string, v: string) => void;
  onMatch: (qid: string, rowId: string, v: string) => void;
  onText: (qid: string, v: string) => void;
}) {
  if (q.type === "single") {
    const current = typeof answers[q.id] === "string" ? (answers[q.id] as string) : "";
    return (
      <div className="flex flex-wrap gap-2">
        {q.options.map((opt) => {
          const checked = current === opt;
          return (
            <label
              key={opt}
              className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium ring-1 transition ${
                checked
                  ? "bg-[color:var(--color-omas-teal)] text-white ring-[color:var(--color-omas-teal)]"
                  : "text-[color:var(--color-foreground)] ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={checked}
                onChange={() => onSingle(q.id, opt)}
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === "multi") {
    const current = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
    return (
      <div className="flex flex-wrap gap-2">
        {q.options.map((opt) => {
          const checked = current.includes(opt);
          return (
            <label
              key={opt}
              className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium ring-1 transition ${
                checked
                  ? "bg-[color:var(--color-omas-teal)] text-white ring-[color:var(--color-omas-teal)]"
                  : "text-[color:var(--color-foreground)] ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40"
              }`}
            >
              <input
                type="checkbox"
                name={q.id}
                value={opt}
                checked={checked}
                onChange={() => onMulti(q.id, opt)}
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === "match") {
    const current = (answers[q.id] && typeof answers[q.id] === "object" && !Array.isArray(answers[q.id])
      ? answers[q.id]
      : {}) as Record<string, string>;
    return (
      <ul className="space-y-2">
        {q.rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3">
            <span className="flex-1 text-sm text-[color:var(--color-foreground)]">{row.label}</span>
            <select
              value={current[row.id] ?? ""}
              onChange={(e) => onMatch(q.id, row.id, e.target.value)}
              className="shrink-0 rounded-lg border-0 bg-[color:var(--color-omas-cream)] px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
            >
              <option value="">—</option>
              {q.pool.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    );
  }

  // text
  const current = typeof answers[q.id] === "string" ? (answers[q.id] as string) : "";
  return (
    <input
      type="text"
      name={q.id}
      value={current}
      onChange={(e) => onText(q.id, e.target.value.slice(0, 200))}
      placeholder={q.placeholder}
      className="w-full rounded-xl border-0 bg-[color:var(--color-omas-cream)] px-3 py-2.5 text-sm text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]"
    />
  );
}

function BuccoResult({
  answers,
  result,
  total,
  saved,
}: {
  answers: BuccoAnswers;
  result: NonNullable<ResultState>;
  total: number;
  saved: boolean | null;
}) {
  const pct = total > 0 ? Math.round((result.score / total) * 100) : 0;
  const message =
    pct >= 80
      ? "Bravo, tes connaissances sont solides ! 🦷"
      : pct >= 50
        ? "Pas mal ! Quelques réponses à revoir ci-dessous."
        : "À découvrir avec les pros du stand — les bonnes réponses sont ci-dessous.";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-[color:var(--color-border)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
          Ton résultat
        </p>
        <p className="mt-2 font-[family-name:var(--font-outfit)] text-4xl font-bold text-[color:var(--color-omas-navy)]">
          {result.score}
          <span className="text-2xl text-[color:var(--color-muted)]"> / {total}</span>
        </p>
        <p className="mt-2 text-sm text-balance text-[color:var(--color-foreground)]">{message}</p>
        {saved === false && (
          <p className="mt-2 text-[11px] text-[color:var(--color-muted)]">
            (Réponse non enregistrée — connexion indisponible.)
          </p>
        )}
      </div>

      <h2 className="px-2 pt-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
        Le corrigé
      </h2>
      <ul className="space-y-3">
        {BUCCO_QUESTIONS.map((q, i) => (
          <li key={q.id} className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-start gap-2">
              <ResultBadge q={q} perQuestion={result.perQuestion} />
              <p className="flex-1 text-sm font-semibold text-[color:var(--color-omas-navy)]">
                <span className="text-[color:var(--color-muted)]">{i + 1}. </span>
                {q.prompt}
              </p>
            </div>
            <div className="mt-2 pl-7 text-sm">
              <CorrectAnswer q={q} answers={answers} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultBadge({
  q,
  perQuestion,
}: {
  q: BuccoQuestion;
  perQuestion: Record<string, boolean>;
}) {
  if (q.type === "text") {
    return (
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-omas-cream)] text-xs text-[color:var(--color-omas-navy)]">
        ✎
      </span>
    );
  }
  const ok = perQuestion[q.id];
  return (
    <span
      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
        ok ? "bg-[color:var(--color-omas-teal)]" : "bg-red-400"
      }`}
      aria-hidden
    >
      {ok ? "✓" : "✗"}
    </span>
  );
}

function CorrectAnswer({ q, answers }: { q: BuccoQuestion; answers: BuccoAnswers }) {
  if (q.type === "single") {
    return (
      <p className="text-[color:var(--color-foreground)]">
        Bonne réponse : <strong>{q.correct}</strong>
        {q.explain && <span className="block text-[color:var(--color-muted)]">{q.explain}</span>}
      </p>
    );
  }
  if (q.type === "multi") {
    return (
      <p className="text-[color:var(--color-foreground)]">
        Intrus : <strong>{q.correct.join(", ")}</strong>
        {q.explain && <span className="block text-[color:var(--color-muted)]">{q.explain}</span>}
      </p>
    );
  }
  if (q.type === "match") {
    return (
      <ul className="space-y-1 text-[color:var(--color-foreground)]">
        {q.rows.map((r) => (
          <li key={r.id}>
            {r.label} → <strong>{r.correct}</strong>
          </li>
        ))}
      </ul>
    );
  }
  const given = typeof answers[q.id] === "string" ? (answers[q.id] as string).trim() : "";
  return (
    <div className="text-[color:var(--color-foreground)]">
      {given && (
        <p className="text-[color:var(--color-muted)]">
          Ta réponse : <span className="italic">{given}</span>
        </p>
      )}
      <p>
        Réponse type : <strong>{q.sample}</strong>
      </p>
    </div>
  );
}
