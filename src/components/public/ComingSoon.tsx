export default function ComingSoon({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <div className="text-4xl" aria-hidden>{icon}</div>
          <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-white/85 max-w-sm">{description}</p>
        </div>
      </header>
      <section className="mx-auto max-w-screen-sm px-4 py-10">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-[color:var(--color-border)] text-center">
          <div className="text-3xl" aria-hidden>🚧</div>
          <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-xl font-semibold text-[color:var(--color-omas-navy)]">
            Bientôt disponible
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)] text-balance">
            Cette section sera activée d'ici le 14 juin. En attendant, retrouve les autres rubriques via le menu en bas.
          </p>
        </div>
      </section>
    </main>
  );
}
