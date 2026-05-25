import { createServiceClient } from "@/lib/supabase/service";
import SurveyForm from "@/components/public/SurveyForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sondage de fin" };

type Stand = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
};

async function getStands(): Promise<Stand[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("health_stands")
    .select("id,slug,name,color,position")
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

export default async function SondagePage() {
  const stands = await getStands();

  return (
    <main className="min-h-dvh">
      <header className="bg-mixte-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Votre avis compte</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Sondage de fin</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Quelques secondes pour nous aider à améliorer la prochaine édition.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        <SurveyForm stands={stands} />
      </section>
    </main>
  );
}
