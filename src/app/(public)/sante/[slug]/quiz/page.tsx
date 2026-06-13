import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { QUIZ_BY_STAND, BUCCO_QUESTIONS, ECRANS_QUESTIONS } from "@/lib/quizzes";
import BuccoQuizForm from "@/components/public/BuccoQuizForm";
import EcransTestForm from "@/components/public/EcransTestForm";

export const dynamic = "force-dynamic";

const QUIZ_META: Record<
  string,
  { eyebrow: string; title: string; intro: string }
> = {
  bucco: {
    eyebrow: "Quiz",
    title: "La santé bucco-dentaire",
    intro: `${BUCCO_QUESTIONS.length} questions pour tester tes connaissances. Les bonnes réponses s'affichent à la fin.`,
  },
  ecrans: {
    eyebrow: "Test",
    title: "Êtes-vous dépendant·e aux écrans ?",
    intro: `Téléphone, réseaux sociaux, jeux vidéo, séries, Internet… ${ECRANS_QUESTIONS.length} questions pour faire le point sur votre usage.`,
  },
};

async function getStand(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("health_stands")
    .select("slug,name,color")
    .eq("slug", slug)
    .maybeSingle();
  return data as { slug: string; name: string; color: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = QUIZ_BY_STAND[slug];
  return { title: quiz ? QUIZ_META[quiz].title : "Questionnaire" };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = QUIZ_BY_STAND[slug];
  if (!quiz) notFound();

  const meta = QUIZ_META[quiz];
  const stand = await getStand(slug);
  const color = stand?.color ?? "var(--color-omas-teal)";

  return (
    <main className="min-h-dvh">
      <header
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${color} 0%, var(--color-omas-navy) 100%)` }}
      >
        <div className="mx-auto max-w-screen-sm px-6 pt-6 pb-10">
          <Link href={`/sante/${slug}`} className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> {stand?.name ?? "Retour au stand"}
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/80">{meta.eyebrow}</p>
          <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-bold">{meta.title}</h1>
          <p className="mt-3 text-sm text-white/90 leading-relaxed">{meta.intro}</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {quiz === "bucco" ? <BuccoQuizForm /> : <EcransTestForm />}
      </section>
    </main>
  );
}
