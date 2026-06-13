import { requireStaff } from "@/lib/auth/require";
import { getLiveStreams } from "@/lib/live";
import LiveLinksForm from "./LiveLinksForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live vidéo" };

export default async function AdminLivePage() {
  await requireStaff({ role: "admin" });
  const streams = await getLiveStreams();

  return (
    <div>
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <div className="text-3xl" aria-hidden>📺</div>
        <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">Live vidéo</h1>
        <p className="mt-2 text-sm text-white/85">
          Colle ici les liens de diffusion (caméras XbotGo, YouTube…). Ils
          s&apos;affichent aussitôt sur la page <strong>Live</strong> du public.
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-[color:var(--color-surface)] p-5 ring-1 ring-[color:var(--color-border)]">
        <LiveLinksForm initial={streams} />
        <ul className="mt-5 space-y-1.5 text-xs text-[color:var(--color-muted)]">
          <li>• Colle le <strong>lien de partage XbotGo</strong> (cloud.xbotgo.net) : il s&apos;affiche en vidéo intégrée dans la page.</li>
          <li>• Un lien YouTube fonctionne aussi ; tout autre lien devient un bouton « Regarder en direct ».</li>
          <li>• Laisse un champ <strong>vide</strong> pour masquer la diffusion correspondante.</li>
        </ul>
      </section>
    </div>
  );
}
