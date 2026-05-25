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

export async function submitSurvey(formData: FormData): Promise<SurveyState> {
  const rawStand = formData.get("favorite_stand_id");
  const rawRating = formData.get("rating");
  const rawComment = formData.get("comment");

  const favoriteStandId =
    typeof rawStand === "string" && rawStand.length > 0 && isUuid(rawStand)
      ? rawStand
      : null;

  const ratingNum = typeof rawRating === "string" ? Number.parseInt(rawRating, 10) : NaN;
  const rating = Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null;

  const comment =
    typeof rawComment === "string" ? rawComment.trim().slice(0, 500) : "";

  if (!favoriteStandId && !rating && !comment) {
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

  const { error } = await supabase.from("survey_responses").insert({
    favorite_stand_id: favoriteStandId,
    rating,
    comment: comment.length > 0 ? comment : null,
    ip_hash: ipHash,
    approved: true,
  });

  if (error) {
    return { error: "Une erreur est survenue. Réessayez." };
  }

  return { success: true };
}
