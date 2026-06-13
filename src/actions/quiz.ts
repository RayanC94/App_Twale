"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import {
  BUCCO_QUESTIONS,
  ECRANS_QUESTIONS,
  gradeBucco,
  gradeEcrans,
  type BuccoAnswers,
  type EcransAnswers,
} from "@/lib/quizzes";

export type QuizState = {
  success?: boolean;
  /** "save_failed" si l'enregistrement a échoué (le résultat reste affiché côté client). */
  error?: string;
};

/** Borne de sécurité : un payload de réponses légitime fait < 2 Ko. */
const MAX_ANSWERS_CHARS = 20_000;

async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.SESSION_SECRET ?? "salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Ne conserve que les clés/valeurs attendues du quiz bucco-dentaire, en
 * forçant le type de chaque réponse. Tout le reste (clés inconnues, valeurs
 * hors options, texte trop long) est écarté avant stockage.
 */
function sanitizeBucco(raw: Record<string, unknown>): BuccoAnswers {
  const out: BuccoAnswers = {};
  for (const q of BUCCO_QUESTIONS) {
    const v = raw[q.id];
    if (q.type === "single") {
      if (typeof v === "string" && q.options.includes(v)) out[q.id] = v;
    } else if (q.type === "multi") {
      if (Array.isArray(v)) {
        const picked = q.options.filter((opt) => v.includes(opt));
        if (picked.length) out[q.id] = picked;
      }
    } else if (q.type === "match") {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const m: Record<string, string> = {};
        for (const row of q.rows) {
          const rv = (v as Record<string, unknown>)[row.id];
          if (typeof rv === "string" && q.pool.includes(rv)) m[row.id] = rv;
        }
        if (Object.keys(m).length) out[q.id] = m;
      }
    } else {
      if (typeof v === "string") {
        const t = v.trim().slice(0, 200);
        if (t) out[q.id] = t;
      }
    }
  }
  return out;
}

/** Ne conserve que q1..q10 du test écrans, en entiers 0–3. */
function sanitizeEcrans(raw: Record<string, unknown>): EcransAnswers {
  const out: EcransAnswers = {};
  for (const q of ECRANS_QUESTIONS) {
    const v = raw[q.id];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (Number.isInteger(n) && n >= 0 && n <= 3) out[q.id] = n;
  }
  return out;
}

/**
 * Enregistre une réponse à un questionnaire du village santé.
 * Le score est recalculé côté serveur (source de vérité = src/lib/quizzes.ts) :
 * on ne fait jamais confiance au score envoyé par le client, ni aux données brutes.
 *
 * Pas de déduplication par IP volontairement : le jour J, le public partage le
 * même WiFi (une seule IP publique), un filtre par IP bloquerait des visiteurs
 * légitimes. Les payloads sont bornés (MAX_ANSWERS_CHARS) et filtrés (sanitize*).
 */
export async function submitQuiz(formData: FormData): Promise<QuizState> {
  const quizSlug = formData.get("quiz_slug");
  const rawAnswers = formData.get("answers");

  if (typeof quizSlug !== "string" || (quizSlug !== "bucco" && quizSlug !== "ecrans")) {
    return { error: "Quiz inconnu." };
  }

  if (typeof rawAnswers !== "string" || rawAnswers.length > MAX_ANSWERS_CHARS) {
    return { error: "Réponses invalides." };
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(rawAnswers);
  } catch {
    return { error: "Réponses invalides." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: "Réponses invalides." };
  }
  const rawObj = parsed as Record<string, unknown>;

  let answers: BuccoAnswers | EcransAnswers;
  let score: number;
  let maxScore: number;
  let resultBand: string | null = null;

  if (quizSlug === "bucco") {
    answers = sanitizeBucco(rawObj);
    const g = gradeBucco(answers as BuccoAnswers);
    score = g.score;
    maxScore = g.max;
  } else {
    answers = sanitizeEcrans(rawObj);
    const g = gradeEcrans(answers as EcransAnswers);
    score = g.score;
    maxScore = g.max;
    resultBand = g.band.key;
  }

  const ipHash = hashIp(await getClientIp());
  const supabase = createServiceClient();

  const { error } = await supabase.from("quiz_responses").insert({
    quiz_slug: quizSlug,
    answers,
    score,
    max_score: maxScore,
    result_band: resultBand,
    ip_hash: ipHash,
  });

  if (error) {
    // Best-effort : on ne bloque pas l'affichage du résultat au visiteur si
    // l'enregistrement échoue (table absente, RLS, coupure réseau côté DB).
    return { error: "save_failed" };
  }

  return { success: true };
}
