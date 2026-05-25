import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type StandRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
};
type SpeakerRow = { id: string; name: string; title: string | null; starts_at: string; ends_at: string };
type DocumentRow = { id: string; title: string; file_path: string; size_bytes: number | null };

async function getStandData(slug: string) {
  const supabase = createServiceClient();
  const { data: stand } = await supabase
    .from("health_stands")
    .select("id,slug,name,description,color")
    .eq("slug", slug)
    .maybeSingle();
  if (!stand) return null;
  const [{ data: speakers }, { data: documents }] = await Promise.all([
    supabase
      .from("health_speakers")
      .select("id,name,title,starts_at,ends_at")
      .eq("stand_id", stand.id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("health_documents")
      .select("id,title,file_path,size_bytes")
      .eq("stand_id", stand.id)
      .order("created_at", { ascending: false }),
  ]);
  return { stand: stand as StandRow, speakers: (speakers ?? []) as SpeakerRow[], documents: (documents ?? []) as DocumentRow[] };
}

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("health_stands").select("name").eq("slug", slug).maybeSingle();
  return { title: data?.name ?? "Stand" };
}

export default async function StandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getStandData(slug);
  if (!result) notFound();
  const { stand, speakers, documents } = result;
  const supabase = createServiceClient();

  return (
    <main className="min-h-dvh">
      <header
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${stand.color ?? "var(--color-omas-teal)"} 0%, var(--color-omas-navy) 100%)` }}
      >
        <div className="mx-auto max-w-screen-sm px-6 pt-6 pb-10">
          <Link href="/sante" className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
            <span aria-hidden>‹</span> Village santé
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-outfit)] text-3xl font-bold">{stand.name}</h1>
          {stand.description && <p className="mt-3 text-white/90 leading-relaxed">{stand.description}</p>}
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
        {/* Intervenants */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            Présence des pros
          </h2>
          {speakers.length === 0 ? (
            <p className="mt-3 px-2 text-sm text-[color:var(--color-muted)]">
              Présence en continu — pas de créneau spécifique.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {speakers.map((sp) => (
                <li
                  key={sp.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[color:var(--color-border)]"
                >
                  <div className="text-xs font-mono tabular-nums bg-[color:var(--color-omas-cream)] text-[color:var(--color-omas-navy)] rounded-md px-2 py-1">
                    {formatHour(sp.starts_at)} – {formatHour(sp.ends_at)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[color:var(--color-foreground)]">{sp.name}</div>
                    {sp.title && <div className="text-xs text-[color:var(--color-muted)]">{sp.title}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fiches PDF */}
        <div>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
            À emporter
          </h2>
          {documents.length === 0 ? (
            <p className="mt-3 px-2 text-sm text-[color:var(--color-muted)]">
              Pas encore de fiche disponible. Elles seront ajoutées avant le 14 juin.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {documents.map((d) => {
                const { data: urlData } = supabase.storage.from("health-pdfs").getPublicUrl(d.file_path);
                return (
                  <li key={d.id}>
                    <a
                      href={urlData.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[color:var(--color-border)] hover:ring-[color:var(--color-omas-teal)]/40 transition"
                    >
                      <div className="text-2xl" aria-hidden>📄</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[color:var(--color-foreground)] truncate">{d.title}</div>
                        {d.size_bytes && <div className="text-xs text-[color:var(--color-muted)]">PDF · {formatSize(d.size_bytes)}</div>}
                      </div>
                      <div className="text-[color:var(--color-omas-teal)] font-medium text-sm">Télécharger</div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
