import type { HealthStandSlug } from "@/lib/constants";

/**
 * Fiches du village santé servies en statique depuis `public/sante/<stand>/`.
 * Source : dossier « Village santé - 14 Juin 2026 » (affiches imprimées le jour J).
 * Complète les documents éventuellement déposés dans Supabase Storage (`health_documents`).
 */
export type HealthDoc = {
  title: string;
  /** Chemin public du fichier (sous /sante/...). */
  file: string;
  kind: "pdf" | "image";
  size_label: string;
  /** Miniature 600px pour la grille (images uniquement). */
  thumb?: string;
};

export const HEALTH_DOCS: Partial<Record<HealthStandSlug, readonly HealthDoc[]>> = {
  premiers: [
    {
      title: "Arrêt cardiaque — conduite à tenir",
      file: "/sante/premiers/arret-cardiaque.jpg",
      kind: "image",
      thumb: "/sante/premiers/arret-cardiaque-thumb.jpg",
      size_label: "0,5 Mo",
    },
    {
      title: "Position latérale de sécurité (PLS)",
      file: "/sante/premiers/position-laterale-securite.jpg",
      kind: "image",
      thumb: "/sante/premiers/position-laterale-securite-thumb.jpg",
      size_label: "0,5 Mo",
    },
    {
      title: "Étouffement — manœuvre de Heimlich",
      file: "/sante/premiers/etouffement-heimlich.jpg",
      kind: "image",
      thumb: "/sante/premiers/etouffement-heimlich-thumb.jpg",
      size_label: "0,5 Mo",
    },
    {
      title: "Hémorragie — conduite à tenir",
      file: "/sante/premiers/hemorragie.jpg",
      kind: "image",
      thumb: "/sante/premiers/hemorragie-thumb.jpg",
      size_label: "0,4 Mo",
    },
    {
      title: "Brûlure — conduite à tenir",
      file: "/sante/premiers/brulure.jpg",
      kind: "image",
      thumb: "/sante/premiers/brulure-thumb.jpg",
      size_label: "0,5 Mo",
    },
  ],
  orientation: [
    {
      title: "Après le bac : quelles voies pour ton avenir ?",
      file: "/sante/orientation/apres-le-bac-quelles-voies.jpg",
      kind: "image",
      thumb: "/sante/orientation/apres-le-bac-quelles-voies-thumb.jpg",
      size_label: "0,4 Mo",
    },
    {
      title: "Les principales filières post-bac",
      file: "/sante/orientation/principales-filieres-post-bac.jpg",
      kind: "image",
      thumb: "/sante/orientation/principales-filieres-post-bac-thumb.jpg",
      size_label: "0,3 Mo",
    },
    {
      title: "Licence : où s'inscrivent les bacheliers ?",
      file: "/sante/orientation/licence-ou-s-inscrivent-les-bacheliers.jpg",
      kind: "image",
      thumb: "/sante/orientation/licence-ou-s-inscrivent-les-bacheliers-thumb.jpg",
      size_label: "0,1 Mo",
    },
    {
      title: "Le schéma des études d'ingénieur",
      file: "/sante/orientation/schema-etudes-ingenieur.jpg",
      kind: "image",
      thumb: "/sante/orientation/schema-etudes-ingenieur-thumb.jpg",
      size_label: "0,1 Mo",
    },
    {
      title: "Je suis en terminale et je veux faire des études de santé",
      file: "/sante/orientation/etudes-de-sante-apres-terminale.pdf",
      kind: "pdf",
      size_label: "60 Ko",
    },
    {
      title: "PASS / LAS : comment ça marche ?",
      file: "/sante/orientation/pass-las-comment-ca-marche.pdf",
      kind: "pdf",
      size_label: "64 Ko",
    },
  ],
  bucco: [
    {
      title: "Anatomie de la dent",
      file: "/sante/bucco/anatomie-de-la-dent.jpg",
      kind: "image",
      thumb: "/sante/bucco/anatomie-de-la-dent-thumb.jpg",
      size_label: "0,1 Mo",
    },
    {
      title: "Arcade dentaire",
      file: "/sante/bucco/arcade-dentaire.jpg",
      kind: "image",
      thumb: "/sante/bucco/arcade-dentaire-thumb.jpg",
      size_label: "0,1 Mo",
    },
    {
      title: "Prévenir plutôt que guérir",
      file: "/sante/bucco/prevenir-plutot-que-guerir.pdf",
      kind: "pdf",
      size_label: "0,2 Mo",
    },
    {
      title: "Quiz santé bucco-dentaire",
      file: "/sante/bucco/quiz-sante-bucco-dentaire.pdf",
      kind: "pdf",
      size_label: "0,7 Mo",
    },
  ],
  addictologie: [
    {
      title: "Addiction aux écrans : comprendre, agir",
      file: "/sante/addictologie/addiction-aux-ecrans.jpg",
      kind: "image",
      thumb: "/sante/addictologie/addiction-aux-ecrans-thumb.jpg",
      size_label: "0,5 Mo",
    },
    {
      title: "Quand je prends mon téléphone, je cherche à…",
      file: "/sante/addictologie/pourquoi-je-prends-mon-telephone.jpg",
      kind: "image",
      thumb: "/sante/addictologie/pourquoi-je-prends-mon-telephone-thumb.jpg",
      size_label: "0,2 Mo",
    },
    {
      title: "Le violentomètre",
      file: "/sante/addictologie/violentometre.png",
      kind: "image",
      thumb: "/sante/addictologie/violentometre-thumb.jpg",
      size_label: "0,2 Mo",
    },
    {
      title: "Harcèlement scolaire : les conseils",
      file: "/sante/addictologie/harcelement-scolaire.pdf",
      kind: "pdf",
      size_label: "0,6 Mo",
    },
    {
      title: "Violences conjugales — le 3919",
      file: "/sante/addictologie/violences-conjugales-3919.pdf",
      kind: "pdf",
      size_label: "0,6 Mo",
    },
    {
      title: "Non aux violences conjugales (affiche 3919)",
      file: "/sante/addictologie/non-aux-violences-conjugales-3919.pdf",
      kind: "pdf",
      size_label: "0,8 Mo",
    },
    {
      title: "Reconnaître la violence conjugale (3919)",
      file: "/sante/addictologie/reconnaitre-la-violence-conjugale-3919.pdf",
      kind: "pdf",
      size_label: "0,5 Mo",
    },
    {
      title: "Le cyberviolentoscope",
      file: "/sante/addictologie/cyberviolentoscope.pdf",
      kind: "pdf",
      size_label: "4 Mo",
    },
    {
      title: "Protoxyde d'azote — affiche ARS",
      file: "/sante/addictologie/protoxyde-azote-affiche-ars.pdf",
      kind: "pdf",
      size_label: "0,5 Mo",
    },
    {
      title: "Protoxyde d'azote — flyer Addictions France",
      file: "/sante/addictologie/protoxyde-azote-flyer-addictions-france.pdf",
      kind: "pdf",
      size_label: "0,7 Mo",
    },
    {
      title: "Protoxyde d'azote — brochure ARS",
      file: "/sante/addictologie/protoxyde-azote-brochure-ars.pdf",
      kind: "pdf",
      size_label: "0,2 Mo",
    },
  ],
};
