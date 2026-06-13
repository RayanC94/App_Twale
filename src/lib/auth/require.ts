import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionToken } from "./cookies";
import { verifySessionToken, type StaffSession } from "./session";

type RequireOptions = {
  role?: "admin" | "referee";
  sport?: "foot" | "volley";
};

// Mémoïsé par requête (React cache) : le layout admin ET la page rendue
// appellent tous deux requireStaff(). Sans ça, chaque navigation déclenche
// 2 requêtes Supabase de session en série ; cache() les fusionne en une seule.
export const getCurrentStaff = cache(async (): Promise<StaffSession | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
});

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
