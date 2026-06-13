import { createServiceClient } from "@/lib/supabase/service";
import { SANTE_LIVE_URL, XBOTGO_STREAMS } from "@/lib/constants";

/**
 * Liens de diffusion en direct, éditables par l'admin (table app_settings,
 * clé « live_streams »). Les constantes servent de fallback tant qu'aucun
 * lien n'a été enregistré en base.
 */
export type LiveStreams = {
  foot: string | null;
  volley: string | null;
  sante: string | null;
};

const FALLBACK: LiveStreams = {
  foot: XBOTGO_STREAMS.foot,
  volley: XBOTGO_STREAMS.volley,
  sante: SANTE_LIVE_URL,
};

/** Lit les liens live depuis app_settings (service-role). Côté serveur uniquement. */
export async function getLiveStreams(): Promise<LiveStreams> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "live_streams")
      .maybeSingle();

    // Aucune ligne en base → on retombe sur les constantes.
    if (!data?.value || typeof data.value !== "object") return FALLBACK;

    const v = data.value as Record<string, unknown>;
    const pick = (x: unknown) => (typeof x === "string" && x.trim() ? x.trim() : null);
    return { foot: pick(v.foot), volley: pick(v.volley), sante: pick(v.sante) };
  } catch {
    return FALLBACK;
  }
}

/**
 * Convertit une URL YouTube (watch, youtu.be, live, embed) en URL d'embed.
 * Renvoie null si ce n'est pas une vidéo YouTube identifiable
 * (auquel cas on affiche un simple lien au lieu d'un lecteur).
 */
export function youTubeEmbedUrl(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
