import BottomNav from "@/components/public/BottomNav";

// Layout sans donnée : laissé cacheable pour que chaque page choisisse son
// propre cache (ISR pour les pages d'info, temps réel pour le tournoi).

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Padding-bottom : hauteur de la bottom-nav (64px) */}
      <div style={{ paddingBottom: "64px" }}>{children}</div>
      <BottomNav />
    </>
  );
}
