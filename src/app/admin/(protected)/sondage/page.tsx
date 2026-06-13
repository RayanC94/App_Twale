import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";
import {
  BUCCO_QUESTIONS,
  ECRANS_QUESTIONS,
  ECRANS_BANDS,
  gradeBucco,
  getEcransBand,
  type BuccoAnswers,
  type BuccoQuestion,
  type EcransAnswers,
  type EcransBand,
} from "@/lib/quizzes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sondage & questionnaires" };

type QuizRow = {
  id: string;
  quiz_slug: "bucco" | "ecrans";
  answers: Record<string, unknown> | null;
  score: number | null;
  max_score: number | null;
  result_band: string | null;
  created_at: string;
};

type SurveyRow = { id: string; rating: number | null; comment: string | null; created_at: string };

const BAND_COLOR: Record<EcransBand["tone"], string> = {
  good: "#1F9E94",
  watch: "#D99A00",
  warn: "#E2620E",
  alert: "#C92A2A",
};

// =========================================================
// Récupération + agrégation
// =========================================================

async function getData() {
  const supabase = createServiceClient();

  // Réponses aux quiz (table créée par 2026-06-13-quiz-village.sql).
  const { data: quizData, error: quizError } = await supabase
    .from("quiz_responses")
    .select("id,quiz_slug,answers,score,max_score,result_band,created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  // Sondage de satisfaction — colonnes de base uniquement (toujours présentes).
  const { data: surveyData } = await supabase
    .from("survey_responses")
    .select("id,rating,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = (quizData ?? []) as QuizRow[];
  return {
    tableMissing: !!quizError,
    bucco: rows.filter((r) => r.quiz_slug === "bucco"),
    ecrans: rows.filter((r) => r.quiz_slug === "ecrans"),
    survey: (surveyData ?? []) as SurveyRow[],
  };
}

function asBuccoAnswers(a: QuizRow["answers"]): BuccoAnswers {
  return (a && typeof a === "object" ? a : {}) as BuccoAnswers;
}
function asEcransAnswers(a: QuizRow["answers"]): EcransAnswers {
  return (a && typeof a === "object" ? a : {}) as EcransAnswers;
}

function buccoStats(rows: QuizRow[]) {
  const total = rows.length;
  const maxScore = BUCCO_QUESTIONS.filter((q) => q.type !== "text").length;
  let scoreSum = 0;
  // Réussite par question notée.
  const correctByQ: Record<string, number> = {};
  // Réponses libres par question « text ».
  const textByQ: Record<string, string[]> = {};
  for (const q of BUCCO_QUESTIONS) {
    if (q.type === "text") textByQ[q.id] = [];
    else correctByQ[q.id] = 0;
  }

  for (const row of rows) {
    const answers = asBuccoAnswers(row.answers);
    const graded = gradeBucco(answers);
    scoreSum += graded.score;
    for (const [qid, ok] of Object.entries(graded.perQuestion)) {
      if (ok) correctByQ[qid] = (correctByQ[qid] ?? 0) + 1;
    }
    for (const q of BUCCO_QUESTIONS) {
      if (q.type !== "text") continue;
      const v = answers[q.id];
      if (typeof v === "string" && v.trim()) textByQ[q.id].push(v.trim());
    }
  }

  return {
    total,
    maxScore,
    avgScore: total ? scoreSum / total : 0,
    correctByQ,
    textByQ,
  };
}

function ecransStats(rows: QuizRow[]) {
  const total = rows.length;
  let scoreSum = 0;
  const bandCounts: Record<EcransBand["key"], number> = {
    maitrise: 0,
    vigilance: 0,
    problematique: 0,
    dependance: 0,
  };
  const qSum: Record<string, number> = {};
  const qCount: Record<string, number> = {};
  for (const q of ECRANS_QUESTIONS) {
    qSum[q.id] = 0;
    qCount[q.id] = 0;
  }

  for (const row of rows) {
    const answers = asEcransAnswers(row.answers);
    const score = typeof row.score === "number" ? row.score : null;
    const effectiveScore =
      score ??
      ECRANS_QUESTIONS.reduce((acc, q) => {
        const v = answers[q.id];
        return acc + (typeof v === "number" && v >= 0 && v <= 3 ? v : 0);
      }, 0);
    scoreSum += effectiveScore;

    const bandKey = (row.result_band as EcransBand["key"] | null) ?? getEcransBand(effectiveScore).key;
    if (bandKey in bandCounts) bandCounts[bandKey] += 1;

    for (const q of ECRANS_QUESTIONS) {
      const v = answers[q.id];
      if (typeof v === "number" && v >= 0 && v <= 3) {
        qSum[q.id] += v;
        qCount[q.id] += 1;
      }
    }
  }

  const perQuestionAvg = ECRANS_QUESTIONS.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    avg: qCount[q.id] ? qSum[q.id] / qCount[q.id] : 0,
  })).sort((a, b) => b.avg - a.avg);

  return {
    total,
    avgScore: total ? scoreSum / total : 0,
    maxScore: ECRANS_QUESTIONS.length * 3,
    bandCounts,
    perQuestionAvg,
  };
}

function surveyStats(rows: SurveyRow[]) {
  const total = rows.length;
  const rated = rows.filter((r) => typeof r.rating === "number");
  const avgRating = rated.length
    ? rated.reduce((acc, r) => acc + (r.rating ?? 0), 0) / rated.length
    : 0;
  const comments = rows.filter((r) => r.comment && r.comment.trim()).slice(0, 12);
  return { total, avgRating, comments };
}

// =========================================================
// Page
// =========================================================

export default async function AdminSondagePage() {
  await requireStaff();
  const { tableMissing, bucco, ecrans, survey } = await getData();

  const b = buccoStats(bucco);
  const e = ecransStats(ecrans);
  const s = surveyStats(survey);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <div className="text-3xl" aria-hidden>💬</div>
        <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Sondage & questionnaires
        </h1>
        <p className="mt-2 text-sm text-white/85">
          Réponses anonymes collectées au village santé.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <HeaderStat value={b.total} label="Quiz bucco" />
          <HeaderStat value={e.total} label="Test écrans" />
          <HeaderStat value={s.total} label="Sondage" />
        </div>
      </section>

      {tableMissing && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          La table <code>quiz_responses</code> est introuvable. Applique{" "}
          <code>supabase/2026-06-13-quiz-village.sql</code> dans l&apos;éditeur SQL Supabase.
        </p>
      )}

      {/* ============== QUIZ BUCCO ============== */}
      <SectionCard emoji="🦷" title="Quiz santé bucco-dentaire">
        {b.total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Kpi value={String(b.total)} label="Participations" tint="teal" />
              <Kpi value={`${b.avgScore.toFixed(1)} / ${b.maxScore}`} label="Score moyen" tint="navy" />
            </div>

            <div>
              <SubTitle>Réussite par question</SubTitle>
              <ul className="mt-2 space-y-2">
                {BUCCO_QUESTIONS.filter((q) => q.type !== "text").map((q, i) => {
                  const correct = b.correctByQ[q.id] ?? 0;
                  const pct = b.total ? Math.round((correct / b.total) * 100) : 0;
                  return (
                    <li key={q.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-[color:var(--color-foreground)]">
                          <span className="text-[color:var(--color-muted)]">{i + 1}. </span>
                          {shortPrompt(q)}
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-[color:var(--color-muted)]">
                          {pct}% ({correct}/{b.total})
                        </span>
                      </div>
                      <Bar pct={pct} color="var(--color-omas-teal)" />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <SubTitle>Réponses libres</SubTitle>
              <div className="mt-2 space-y-3">
                {BUCCO_QUESTIONS.filter((q): q is Extract<BuccoQuestion, { type: "text" }> => q.type === "text").map(
                  (q) => {
                    const list = b.textByQ[q.id] ?? [];
                    return (
                      <div key={q.id} className="rounded-xl bg-[color:var(--color-omas-cream)] p-3">
                        <p className="text-xs font-semibold text-[color:var(--color-omas-navy)]">{q.prompt}</p>
                        {list.length === 0 ? (
                          <p className="mt-1 text-xs text-[color:var(--color-muted)]">Aucune réponse.</p>
                        ) : (
                          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                            {list.slice(0, 30).map((txt, idx) => (
                              <li
                                key={idx}
                                className="rounded-full bg-white px-2.5 py-1 text-xs text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border)]"
                              >
                                {txt}
                              </li>
                            ))}
                            {list.length > 30 && (
                              <li className="px-1 py-1 text-xs text-[color:var(--color-muted)]">
                                +{list.length - 30} autres
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ============== TEST ÉCRANS ============== */}
      <SectionCard emoji="📱" title="Test : dépendance aux écrans">
        {e.total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Kpi value={String(e.total)} label="Participations" tint="teal" />
              <Kpi value={`${e.avgScore.toFixed(1)} / ${e.maxScore}`} label="Score moyen" tint="navy" />
            </div>

            <div>
              <SubTitle>Répartition des profils</SubTitle>
              <ul className="mt-2 space-y-2">
                {ECRANS_BANDS.map((band) => {
                  const count = e.bandCounts[band.key];
                  const pct = e.total ? Math.round((count / e.total) * 100) : 0;
                  const color = BAND_COLOR[band.tone];
                  return (
                    <li key={band.key}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                          {band.label}{" "}
                          <span className="text-xs font-normal text-[color:var(--color-muted)]">
                            ({band.min}–{band.max})
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-[color:var(--color-muted)]">
                          {pct}% ({count})
                        </span>
                      </div>
                      <Bar pct={pct} color={color} />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <SubTitle>Comportements les plus fréquents</SubTitle>
              <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                Moyenne par question (0 = jamais → 3 = toujours).
              </p>
              <ul className="mt-2 space-y-2">
                {e.perQuestionAvg.map((q) => {
                  const pct = Math.round((q.avg / 3) * 100);
                  return (
                    <li key={q.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-[color:var(--color-foreground)]">{q.prompt}</span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-[color:var(--color-muted)]">
                          {q.avg.toFixed(1)}
                        </span>
                      </div>
                      <Bar pct={pct} color="var(--color-omas-navy)" />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ============== SONDAGE SATISFACTION ============== */}
      <SectionCard emoji="⭐" title="Sondage de satisfaction">
        {s.total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Kpi value={String(s.total)} label="Réponses" tint="teal" />
              <Kpi value={`${s.avgRating.toFixed(1)} / 5`} label="Note moyenne" tint="navy" />
            </div>
            {s.comments.length > 0 && (
              <div>
                <SubTitle>Derniers commentaires</SubTitle>
                <ul className="mt-2 space-y-2">
                  {s.comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl bg-[color:var(--color-omas-cream)] p-3 text-sm text-[color:var(--color-foreground)]"
                    >
                      {c.rating != null && (
                        <span className="mr-2 text-xs font-semibold text-[color:var(--color-omas-teal)]">
                          {c.rating}/5
                        </span>
                      )}
                      “{c.comment}”
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// =========================================================
// Sous-composants UI
// =========================================================

function HeaderStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-2 py-2 text-center">
      <div className="font-[family-name:var(--font-outfit)] text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-white/80">{label}</div>
    </div>
  );
}

function SectionCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
      <h2 className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-lg font-semibold text-[color:var(--color-omas-navy)]">
        <span aria-hidden>{emoji}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kpi({ value, label, tint }: { value: string; label: string; tint: "teal" | "navy" }) {
  const tintClass = tint === "teal" ? "text-[color:var(--color-omas-teal)]" : "text-[color:var(--color-omas-navy)]";
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-border)]">
      <div className={`font-[family-name:var(--font-outfit)] text-2xl font-bold tabular-nums ${tintClass}`}>
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-[color:var(--color-muted)]">{label}</div>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">{children}</h3>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-omas-cream)]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <p className="rounded-xl bg-[color:var(--color-omas-cream)] px-4 py-6 text-center text-sm text-[color:var(--color-muted)]">
      Aucune réponse pour le moment.
    </p>
  );
}

/** Intitulé court pour les barres de réussite (les prompts complets sont longs). */
function shortPrompt(q: BuccoQuestion): string {
  const map: Record<string, string> = {
    q1: "Nombre de dents",
    q2: "Intrus (types de dents)",
    q3: "Schéma de la dent",
    q5: "Brossages / jour",
    q6: "Temps de brossage",
    q7: "Type de brosse",
    q8: "Fréquence de changement",
    q9: "Dentifrice adulte / enfant",
    q10: "Carie = douleur ?",
    q11: "Grignotage",
  };
  return map[q.id] ?? q.prompt;
}
