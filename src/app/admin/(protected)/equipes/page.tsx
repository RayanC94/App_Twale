import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";
import TeamsManager, { type TeamRow } from "./TeamsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Équipes" };

export default async function AdminEquipesPage() {
  const staff = await requireStaff();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("teams")
    .select("id,sport,gender,name")
    .order("sport", { ascending: true })
    .order("gender", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div>
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <div className="text-3xl" aria-hidden>👥</div>
        <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">Équipes</h1>
        <p className="mt-2 text-sm text-white/85">
          Inscrivez les équipes de chaque tournoi, puis composez les poules dans l&apos;onglet Matchs.
        </p>
      </section>

      <section className="mt-6">
        <TeamsManager teams={(data ?? []) as TeamRow[]} staffSport={staff.sport} />
      </section>
    </div>
  );
}
