import { redirect } from "next/navigation";
import { getSessionToken } from "./cookies";
import { verifySessionToken, type StaffSession } from "./session";

type RequireOptions = {
  role?: "admin" | "referee";
  sport?: "foot" | "volley";
};

export async function getCurrentStaff(): Promise<StaffSession | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireStaff(options: RequireOptions = {}): Promise<StaffSession> {
  const session = await getCurrentStaff();
  if (!session) {
    redirect("/admin/login");
  }

  if (options.role && session.role !== options.role) {
    // Un admin peut tout faire ; un referee n'a pas accès aux écrans admin.
    if (!(options.role === "referee" && session.role === "admin")) {
      redirect("/admin/login");
    }
  }

  if (options.sport && session.sport && session.sport !== options.sport) {
    redirect("/admin/login");
  }

  return session;
}
