"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import {
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
 * Enregistre une réponse à un questionnaire du village santé.
 * Le score est recalculé côté serveur (source de vérité = src/lib/quizzes.ts),
 * pas de confiance dans le score envoyé par le client.
 */
export async function submitQuiz(formData: FormData): Promise<QuizState> {
  const quizSlug = formData.get("quiz_slug");
  const rawAnswers = formData.get("answers");

  if (typeof quizSlug !== "string" || (quizSlug !== "bucco" && quizSlug !== "ecrans")) {
    return { error: "Quiz inconnu." };
  }

  let answers: unknown = null;
  if (typeof rawAnswers === "string") {
    try {
      answers = JSON.parse(rawAnswers);
    } catch {
      return { error: "Réponses invalides." };
    }
  }
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return { error: "Réponses invalides." };
  }

  let score: number;
  let maxScore: number;
  let resultBand: string | null = null;

  if (quizSlug === "bucco") {
    const g = gradeBucco(answers as BuccoAnswers);
    score = g.score;
    maxScore = g.max;
  } else {
    const g = gradeEcrans(answers as EcransAnswers);
    score = g.score;
    maxScore = g.max;
    resultBand = g.band.key;
  }

  const ipHash = hashIp(await getClientIp());
  const supabase = createServiceClient();

  const { error } = await supabase.from("quiz_responses").insert({
    quiz_slug: quizSlug,
    answers: answers as Record<string, unknown>,
    score,
    max_score: maxScore,
    result_band: resultBand,
    ip_hash: ipHash,
  });

  if (error) {
    // Table absente tant que supabase/2026-06-13-quiz-village.sql n'est pas
    // appliqué : on ne bloque pas l'affichage du résultat côté visiteur.
    return { error: "save_failed" };
  }

  return { success: true };
}
