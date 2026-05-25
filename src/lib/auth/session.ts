import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type StaffSession = {
  staff_id: string;
  display_name: string;
  role: "admin" | "referee";
  sport: "foot" | "volley" | null;
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(staffId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const supabase = createServiceClient();
  const { error } = await supabase.from("staff_sessions").insert({
    staff_id: staffId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) {
    throw new Error(`Impossible de créer la session : ${error.message}`);
  }
  return token;
}

export async function verifySessionToken(token: string): Promise<StaffSession | null> {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("staff_sessions")
    .select("staff_id, expires_at, staff(id, display_name, role, sport, active)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const staff = Array.isArray(data.staff) ? data.staff[0] : data.staff;
  if (!staff || staff.active === false) return null;

  return {
    staff_id: staff.id,
    display_name: staff.display_name,
    role: staff.role,
    sport: staff.sport ?? null,
  };
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashToken(token);
  const supabase = createServiceClient();
  await supabase.from("staff_sessions").delete().eq("token_hash", tokenHash);
}
