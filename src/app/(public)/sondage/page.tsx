import { FEEDBACK_FORMS } from "@/lib/constants";

export const revalidate = 3600;
export const metadata = { title: "Votre avis" };

export default function SondagePage() {
  return (
    <main className="min-h-dvh">
      <header className="bg-mixte-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Votre avis compte</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Donnez votre avis</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">
            Deux courts questionnaires pour nous aider à améliorer la prochaine édition. Choisissez celui qui vous concerne.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        <ul className="space-y-3">
          {FEEDBACK_FORMS.map((f) => (
            <li key={f.key}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)] shadow-sm transition active:scale-[0.99] hover:ring-[color:var(--color-omas-teal)]/40"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white"
                  style={{ backgroundColor: f.accent }}
                  aria-hidden
                >
                  {f.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[color:var(--color-omas-navy)]">
                    Questionnaire {f.label}
                  </span>
                  <span className="block text-xs text-[color:var(--color-muted)]">{f.desc}</span>
                </span>
                <span aria-hidden className="shrink-0 text-[color:var(--color-muted)]">→</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-[11px] text-[color:var(--color-muted)]">
          Les questionnaires s’ouvrent dans Google Forms. Réponses anonymes.
        </p>
      </section>
    </main>
  );
}
