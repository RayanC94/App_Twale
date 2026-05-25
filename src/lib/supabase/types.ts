/**
 * Types de la base Supabase.
 *
 * Régénérer après chaque migration :
 *   npx supabase gen types typescript \
 *     --project-id gnwqycedllwyincbllpo > src/lib/supabase/types.ts
 *
 * En attendant la première génération, on expose un type permissif
 * pour ne pas bloquer la compilation.
 */
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: Record<string, string>;
  };
};
