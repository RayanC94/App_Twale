import ComingSoon from "@/components/public/ComingSoon";

export const metadata = { title: "Galerie photo" };

export default function GaleriePage() {
  return (
    <ComingSoon
      title="Galerie photo"
      icon="📷"
      description="Les photos de la journée, prises par le photographe officiel et l'équipe. La galerie se remplit au fil des matchs."
    />
  );
}
