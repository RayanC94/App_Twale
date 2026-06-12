import BottomNav from "@/components/public/BottomNav";

// Rendu à la requête — données live (tournoi temps réel).
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Padding-bottom : hauteur de la bottom-nav (64px) */}
      <div style={{ paddingBottom: "64px" }}>{children}</div>
      <BottomNav />
    </>
  );
}
