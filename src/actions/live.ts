"use server";

import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";

export type LiveActionState = {
  success?: boolean;
  cleared?: boolean;
  error?: string;
};

/** Valide un champ lien : vide autorisé, sinon URL http(s) bien formée. */
function cleanUrl(formData: FormData, name: string): { url: string | null; error: string | null } {
  const raw = formData.get(name);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { url: null, error: null };
  if (value.length > 500) return { url: null, error: "Lien trop long." };
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { url: null, error: "Lien invalide — il doit commencer par https://" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { url: null, error: "Seuls les liens http(s) sont autorisés." };
  }
  return { url: parsed.toString(), error: null };
}

/**
 * Enregistre les liens de diffusion live (caméras XbotGo + village santé)
 * dans app_settings. Réservé aux admins. Modifiable à tout moment sans
 * redéploiement : les pages publiques (force-dynamic) relisent à chaque visite.
 */
export async function updateLiveStreams(
  _prev: LiveActionState,
  formData: FormData,
): Promise<LiveActionState> {
  await requireStaff({ role: "admin" });

  const supabase = createServiceClient();

  // Bouton « Supprimer tous les liens » : on efface la diffusion sans tenir
  // compte des champs (la page Live publique repasse alors en « jour J »).
  if (formData.get("intent") === "clear") {
    const { error } = await supabase.from("app_settings").upsert(
      {
        key: "live_streams",
        value: { foot: null, volley: null, sante: null },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { error: "Suppression impossible. Réessayez." };
    return { success: true, cleared: true };
  }

  const foot = cleanUrl(formData, "foot");
  const volley = cleanUrl(formData, "volley");
  const sante = cleanUrl(formData, "sante");
  for (const f of [foot, volley, sante]) {
    if (f.error) return { error: f.error };
  }

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: "live_streams",
      value: { foot: foot.url, volley: volley.url, sante: sante.url },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { error: "Enregistrement impossible. Réessayez." };
  return { success: true };
}
