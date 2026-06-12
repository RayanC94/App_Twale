"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export type SurveyState = {
  success?: boolean;
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

const MOMENT_VALUES = new Set(["foot", "volley", "athle", "village_sante", "famille", "food"]);
const RETURN_VALUES = new Set(["oui", "peut_etre", "non"]);

export async function submitSurvey(formData: FormData): Promise<SurveyState> {
  const rawStand = formData.get("favorite_stand_id");
  const rawRating = formData.get("rating");
  const rawComment = formData.get("comment");
  const rawMoment = formData.get("favorite_moment");
  const rawReturn = formData.get("would_return");

  const favoriteStandId =
    typeof rawStand === "string" && rawStand.length > 0 && isUuid(rawStand)
      ? rawStand
      : null;

  const ratingNum = typeof rawRating === "string" ? Number.parseInt(rawRating, 10) : NaN;
  const rating = Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null;

  const comment =
    typeof rawComment === "string" ? rawComment.trim().slice(0, 500) : "";

  const favoriteMoment =
    typeof rawMoment === "string" && MOMENT_VALUES.has(rawMoment) ? rawMoment : null;
  const wouldReturn =
    typeof rawReturn === "string" && RETURN_VALUES.has(rawReturn) ? rawReturn : null;

  if (!favoriteStandId && !rating && !comment && !favoriteMoment && !wouldReturn) {
    return { error: "Merci de remplir au moins un champ." };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);
  const supabase = createServiceClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "Merci, vous avez déjà répondu récemment." };
  }

  const baseRow = {
    favorite_stand_id: favoriteStandId,
    rating,
    comment: comment.length > 0 ? comment : null,
    ip_hash: ipHash,
    approved: true,
  };

  const { error } = await supabase.from("survey_responses").insert({
    ...baseRow,
    favorite_moment: favoriteMoment,
    would_return: wouldReturn,
  });

  if (error) {
    // Colonnes favorite_moment/would_return absentes tant que le SQL
    // supabase/2026-06-12-sondage-partenaires.sql n'est pas appliqué :
    // on enregistre au moins les champs historiques. Uniquement dans ce
    // cas précis — toute autre erreur ne doit pas être masquée.
    const missingColumn =
      error.code === "PGRST204" ||
      error.code === "42703" ||
      /favorite_moment|would_return/.test(error.message ?? "");
    if (!missingColumn) {
      return { error: "Une erreur est survenue. Réessayez." };
    }
    const { error: retryError } = await supabase.from("survey_responses").insert(baseRow);
    if (retryError) {
      return { error: "Une erreur est survenue. Réessayez." };
    }
  }

  return { success: true };
}
