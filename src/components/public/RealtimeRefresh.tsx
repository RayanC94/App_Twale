"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/**
 * Rafraîchit la page (router.refresh) dès qu'une ligne change dans les tables
 * écoutées (Supabase Realtime). Permet de garder une page mise en cache (ISR)
 * tout en affichant les scores à jour sans rechargement manuel.
 * Ne rend rien. Les tables doivent être publiées dans `supabase_realtime`.
 */
export default function RealtimeRefresh({ tables = ["matches"] }: { tables?: string[] }) {
  const router = useRouter();
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`refresh:${key}`);
    for (const table of key.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => router.refresh());
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, router]);

  return null;
}
