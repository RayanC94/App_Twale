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
 * Renvoie l'URL à placer dans l'iframe si le lien est intégrable :
 *  - XbotGo (cloud.xbotgo.net) → la page de partage elle-même (autorise l'iframe) ;
 *  - YouTube (watch, youtu.be, live, embed) → l'URL d'embed du lecteur.
 * Renvoie null sinon : on affiche alors un simple bouton « regarder » au lieu
 * d'un lecteur (pour éviter une iframe bloquée et restée blanche).
 */
export function embedUrl(url: string): string | null {
  // XbotGo : page de partage intégrable directement.
  try {
    const host = new URL(url).hostname;
    if (host === "xbotgo.net" || host.endsWith(".xbotgo.net")) return url;
  } catch {
    return null;
  }
  // YouTube : conversion vers l'URL d'embed.
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : null;
}
