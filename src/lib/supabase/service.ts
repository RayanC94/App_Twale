import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Client Supabase avec la clé service-role.
 * À utiliser UNIQUEMENT côté serveur (Server Actions, route handlers).
 * Contourne la RLS — ne jamais l'importer dans un Client Component.
 */
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient ne peut être appelé que côté serveur.");
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
