import { createServiceClient } from "@/lib/supabase/service";
import BottomNav from "@/components/public/BottomNav";
import SponsorsMarquee from "@/components/public/SponsorsMarquee";

// Revalide périodiquement le shell (sponsors) côté serveur.
export const revalidate = 60;

async function getSponsors() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("sponsors")
      .select("id,name,logo_url,website_url")
      .eq("show_in_marquee", true)
      .order("position", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const sponsors = await getSponsors();
  const hasSponsors = sponsors.length > 0;

  return (
    <>
      {/* Padding-bottom adapté : bottom-nav (64px) + marquee (48px si présent) */}
      <div style={{ paddingBottom: hasSponsors ? "112px" : "64px" }}>
        {children}
      </div>
      {hasSponsors && <SponsorsMarquee sponsors={sponsors} />}
      <BottomNav />
    </>
  );
}
