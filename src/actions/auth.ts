"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/service";
import { createSession, destroySession } from "@/lib/auth/session";
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionToken,
} from "@/lib/auth/cookies";
import { isRateLimited, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { isValidPinFormat } from "@/lib/auth/pins";

export type LoginState = {
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

export async function loginWithPin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = formData.get("pin");
  const pin = typeof raw === "string" ? raw.trim() : "";

  if (!isValidPinFormat(pin)) {
    return { error: "Le code doit contenir exactement 6 chiffres." };
  }

  const ip = await getClientIp();

  if (await isRateLimited(ip)) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const supabase = createServiceClient();
  const { data: staffList, error } = await supabase
    .from("staff")
    .select("id, display_name, role, sport, pin_hash, active")
    .eq("active", true);

  if (error || !staffList) {
    await recordLoginAttempt(ip, false);
    return { error: "Erreur serveur. Réessayez." };
  }

  let matchedStaffId: string | null = null;
  for (const row of staffList as Array<{ id: string; pin_hash: string }>) {
    try {
      if (await bcrypt.compare(pin, row.pin_hash)) {
        matchedStaffId = row.id;
        break;
      }
    } catch {
      // pin_hash invalide — on ignore et on continue
    }
  }

  if (!matchedStaffId) {
    await recordLoginAttempt(ip, false);
    return { error: "Code incorrect." };
  }

  await recordLoginAttempt(ip, true);
  const token = await createSession(matchedStaffId);
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await destroySession(token);
  }
  await clearSessionCookie();
  redirect("/admin/login");
}
