import { createServiceClient } from "@/lib/supabase/service";

const WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

export async function recordLoginAttempt(ip: string, success: boolean): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("staff_login_attempts").insert({
    ip,
    success,
  });
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("staff_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("success", false)
    .gte("attempted_at", since);

  if (error) return false;
  return (count ?? 0) >= MAX_FAILED_ATTEMPTS;
}
