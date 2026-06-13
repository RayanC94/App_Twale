/**
 * Questionnaires du village santé, version numérique.
 * Source : affiches papier « La santé bucco-dentaire » et
 * « Test : êtes-vous dépendant·e aux écrans ? ».
 *
 * Ce module est neutre (ni "use client" ni "use server") : il est importé
 * à la fois par les formulaires (client) et par l'action serveur, afin que
 * le calcul du score soit identique des deux côtés.
 */

export type QuizSlug = "bucco" | "ecrans";

/** Slug du stand santé → questionnaire associé. */
export const QUIZ_BY_STAND: Record<string, QuizSlug> = {
  bucco: "bucco",
  addictologie: "ecrans",
};

// =========================================================
// 1) QUIZ BUCCO-DENTAIRE (quiz de connaissances)
// =========================================================

export type BuccoQuestion =
  | {
      id: string;
      type: "single";
      prompt: string;
      options: readonly string[];
      correct: string;
      explain?: string;
    }
  | {
      id: string;
      type: "multi";
      prompt: string;
      hint?: string;
      options: readonly string[];
      correct: readonly string[];
      explain?: string;
    }
  | {
      id: string;
      type: "match";
      prompt: string;
      /** Schéma de référence affiché au-dessus de l'exercice. */
      image?: { src: string; width: number; height: number; alt: string };
      pool: readonly string[];
      rows: readonly { id: string; label: string; correct: string }[];
      explain?: string;
    }
  | {
      id: string;
      type: "text";
      prompt: string;
      sample: string;
      placeholder?: string;
    };

export const BUCCO_QUESTIONS: readonly BuccoQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Combien de dents possède un adulte ?",
    options: ["26", "32", "40"],
    correct: "32",
    explain: "Un adulte a 32 dents (dents de sagesse comprises).",
  },
  {
    id: "q2",
    type: "multi",
    prompt: "Barre les intrus : lesquels ne sont pas des types de dents ?",
    hint: "Plusieurs réponses possibles.",
    options: ["Émail", "Incisives", "Ivoire", "Canines", "Molaires", "Fluor"],
    correct: ["Émail", "Ivoire", "Fluor"],
    explain:
      "Les types de dents sont les incisives, les canines et les molaires (et prémolaires). L'émail, l'ivoire et le fluor n'en sont pas.",
  },
  {
    id: "q3",
    type: "match",
    prompt: "Complète le schéma de la dent : associe chaque partie à sa description.",
    image: {
      src: "/sante/bucco/anatomie-de-la-dent-thumb.jpg",
      width: 600,
      height: 849,
      alt: "Schéma en coupe d'une dent : couronne, collet, racine, émail, dentine, pulpe, gencive, os.",
    },
    pool: ["Couronne", "Racine", "Émail", "Dentine", "Pulpe", "Gencive", "Os"],
    rows: [
      { id: "r1", label: "Partie visible, au-dessus de la gencive", correct: "Couronne" },
      { id: "r2", label: "Partie cachée dans la mâchoire", correct: "Racine" },
      { id: "r3", label: "Couche externe, la plus dure du corps", correct: "Émail" },
      { id: "r4", label: "Tissu situé juste sous l'émail", correct: "Dentine" },
      { id: "r5", label: "Centre vivant (nerf et vaisseaux)", correct: "Pulpe" },
      { id: "r6", label: "Chair qui entoure et protège la dent", correct: "Gencive" },
      { id: "r7", label: "Support osseux qui maintient la dent", correct: "Os" },
    ],
  },
  {
    id: "q4",
    type: "text",
    prompt: "À quel âge sort la 1ʳᵉ dent définitive ?",
    sample: "Vers 6 ans.",
    placeholder: "Ton estimation…",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Combien de brossages par jour ?",
    options: ["1", "2", "3"],
    correct: "2",
    explain: "Au minimum 2 fois par jour, matin et soir.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Temps de brossage conseillé ?",
    options: ["1 min", "2 min", "3 min"],
    correct: "2 min",
    explain: "2 minutes à chaque brossage.",
  },
  {
    id: "q7",
    type: "single",
    prompt: "Brosse à dents la plus adaptée ?",
    options: ["Souple", "Medium", "Dure"],
    correct: "Souple",
    explain: "Une brosse souple nettoie efficacement sans abîmer l'émail ni les gencives.",
  },
  {
    id: "q8",
    type: "single",
    prompt: "On change de brosse à dents tous les…",
    options: ["3 mois", "6 mois", "1 an"],
    correct: "3 mois",
    explain: "Tous les 3 mois, ou avant si les poils sont abîmés.",
  },
  {
    id: "q9",
    type: "single",
    prompt: "Peut-on utiliser un dentifrice adulte pour un enfant ?",
    options: ["Oui", "Non"],
    correct: "Non",
    explain: "Non : le dosage en fluor d'un dentifrice adulte est trop élevé pour un enfant.",
  },
  {
    id: "q10",
    type: "single",
    prompt: "Une carie fait-elle toujours mal ?",
    options: ["Oui", "Non"],
    correct: "Non",
    explain: "Non : une carie débutante est souvent indolore, d'où l'intérêt des contrôles réguliers.",
  },
  {
    id: "q11",
    type: "single",
    prompt: "Grignoter, est-ce mauvais pour les dents ?",
    options: ["Oui", "Non"],
    correct: "Oui",
    explain: "Oui : grignoter multiplie les attaques acides sur l'émail.",
  },
  {
    id: "q12",
    type: "text",
    prompt: "Cite des boissons qui favorisent les caries.",
    sample: "Sodas, jus de fruits, sirops et boissons énergisantes (riches en sucre et acides).",
    placeholder: "Ta réponse…",
  },
  {
    id: "q13",
    type: "text",
    prompt: "Quand faut-il aller chez le dentiste ?",
    sample: "Au moins une fois par an (idéalement tous les 6 mois), et dès qu'une douleur apparaît.",
    placeholder: "Ta réponse…",
  },
];

export type BuccoAnswers = Record<string, string | string[] | Record<string, string>>;

export type BuccoGrade = {
  score: number;
  max: number;
  /** Vrai/faux par question notée (les questions « text » ne sont pas notées). */
  perQuestion: Record<string, boolean>;
};

export function gradeBucco(answers: BuccoAnswers): BuccoGrade {
  let score = 0;
  let max = 0;
  const perQuestion: Record<string, boolean> = {};
  for (const q of BUCCO_QUESTIONS) {
    if (q.type === "text") continue;
    max += 1;
    const a = answers?.[q.id];
    let ok = false;
    if (q.type === "single") {
      ok = typeof a === "string" && a === q.correct;
    } else if (q.type === "multi") {
      const set = Array.isArray(a) ? a : [];
      ok = set.length === q.correct.length && q.correct.every((c) => set.includes(c));
    } else {
      const m = a && typeof a === "object" && !Array.isArray(a) ? (a as Record<string, string>) : {};
      ok = q.rows.every((r) => m[r.id] === r.correct);
    }
    perQuestion[q.id] = ok;
    if (ok) score += 1;
  }
  return { score, max, perQuestion };
}

// =========================================================
// 2) TEST « ÊTES-VOUS DÉPENDANT·E AUX ÉCRANS ? » (auto-évaluation)
// =========================================================

export type EcransQuestion = { id: string; prompt: string };

export const ECRANS_QUESTIONS: readonly EcransQuestion[] = [
  { id: "q1", prompt: "Restez-vous connecté·e plus longtemps que prévu ?" },
  { id: "q2", prompt: "Avez-vous du mal à réduire votre temps d'écran ?" },
  { id: "q3", prompt: "Pensez-vous souvent à consulter votre téléphone, vos réseaux sociaux, vos jeux ou Internet ?" },
  { id: "q4", prompt: "Vous sentez-vous mal, stressé·e, agacé·e ou irritable lorsque vous ne pouvez pas utiliser un écran ?" },
  { id: "q5", prompt: "Consultez-vous votre téléphone dès le réveil ou très tôt le matin ?" },
  { id: "q6", prompt: "Votre sommeil est-il perturbé par l'utilisation des écrans ?" },
  { id: "q7", prompt: "Négligez-vous parfois vos responsabilités à cause des écrans ?" },
  { id: "q8", prompt: "Utilisez-vous les écrans pour oublier le stress, l'ennui, la solitude ou les difficultés ?" },
  { id: "q9", prompt: "Vos proches vous font-ils des remarques sur votre temps passé devant les écrans ?" },
  { id: "q10", prompt: "Avez-vous déjà essayé de diminuer votre temps d'écran sans y parvenir ?" },
];

export const ECRANS_SCALE: readonly { value: number; label: string; short: string }[] = [
  { value: 0, label: "Jamais", short: "Jamais" },
  { value: 1, label: "Parfois", short: "Parfois" },
  { value: 2, label: "Souvent", short: "Souvent" },
  { value: 3, label: "Très souvent / Toujours", short: "Toujours" },
];

export type EcransBand = {
  key: "maitrise" | "vigilance" | "problematique" | "dependance";
  min: number;
  max: number;
  label: string;
  message: string;
  /** Sert à choisir la couleur côté UI. */
  tone: "good" | "watch" | "warn" | "alert";
};

export const ECRANS_BANDS: readonly EcransBand[] = [
  { key: "maitrise", min: 0, max: 6, label: "Usage maîtrisé", message: "Usage globalement contrôlé.", tone: "good" },
  { key: "vigilance", min: 7, max: 14, label: "Vigilance", message: "Restez attentif·ve.", tone: "watch" },
  { key: "problematique", min: 15, max: 22, label: "Usage problématique", message: "Un impact apparaît. Parlez-en.", tone: "warn" },
  { key: "dependance", min: 23, max: 30, label: "Dépendance forte", message: "Votre usage semble très envahissant. Un accompagnement est conseillé.", tone: "alert" },
];

export type EcransAnswers = Record<string, number>;

export type EcransGrade = { score: number; max: number; band: EcransBand };

export function getEcransBand(score: number): EcransBand {
  return ECRANS_BANDS.find((b) => score >= b.min && score <= b.max) ?? ECRANS_BANDS[0];
}

export function gradeEcrans(answers: EcransAnswers): EcransGrade {
  let score = 0;
  for (const q of ECRANS_QUESTIONS) {
    const v = answers?.[q.id];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 3) {
      score += v;
    }
  }
  return { score, max: ECRANS_QUESTIONS.length * 3, band: getEcransBand(score) };
}
