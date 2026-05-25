import { createServiceClient } from "@/lib/supabase/service";
import Lightbox, { type LightboxPhoto } from "@/components/public/Lightbox";

export const revalidate = 30;
export const metadata = { title: "Galerie photo" };

type Photo = {
  id: string;
  file_path: string;
  thumb_path: string | null;
  caption: string | null;
  created_at: string;
};

async function getPhotos(): Promise<LightboxPhoto[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id,file_path,thumb_path,caption,created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error || !data) return [];

  const bucket = supabase.storage.from("gallery");

  return (data as Photo[]).map((p) => {
    const thumbPath = p.thumb_path && p.thumb_path.length > 0 ? p.thumb_path : p.file_path;
    return {
      id: p.id,
      fullUrl: bucket.getPublicUrl(p.file_path).data.publicUrl,
      thumbUrl: bucket.getPublicUrl(thumbPath).data.publicUrl,
      caption: p.caption,
    };
  });
}

export default async function GaleriePage() {
  const photos = await getPhotos();

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Souvenirs du jour</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Galerie photo</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">Les meilleurs moments de la journée.</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {photos.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--color-muted)] py-12">
            La galerie se remplira au fil de la journée.
          </p>
        ) : (
          <Lightbox photos={photos} />
        )}
      </section>
    </main>
  );
}
