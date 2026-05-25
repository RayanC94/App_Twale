import { createServiceClient } from "@/lib/supabase/service";
import { SOS_FALLBACK } from "@/lib/constants";
import SosButton from "@/components/public/SosButton";
import BottomNav from "@/components/public/BottomNav";
import SponsorsMarquee from "@/components/public/SponsorsMarquee";

// Revalide périodiquement le shell (SOS, sponsors) côté serveur.
export const revalidate = 60;

async function getSosConfig() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "sos")
      .maybeSingle<{ value: Record<string, string> }>();
    const value = data?.value ?? {};
    return {
      phone: value.phone || SOS_FALLBACK.phone,
      location_label: value.location_label || SOS_FALLBACK.location_label,
      samu: value.samu || SOS_FALLBACK.samu,
      pompiers: value.pompiers || SOS_FALLBACK.pompiers,
    };
  } catch {
    return SOS_FALLBACK;
  }
}

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
  const [sosConfig, sponsors] = await Promise.all([getSosConfig(), getSponsors()]);
  const hasSponsors = sponsors.length > 0;

  return (
    <>
      {/* Padding-bottom adapté : bottom-nav (64px) + marquee (48px si présent) */}
      <div style={{ paddingBottom: hasSponsors ? "112px" : "64px" }}>
        {children}
      </div>
      <SosButton config={sosConfig} bottomOffset={hasSponsors ? 128 : 80} />
      {hasSponsors && <SponsorsMarquee sponsors={sponsors} />}
      <BottomNav />
    </>
  );
}
