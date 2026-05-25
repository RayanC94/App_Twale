export default function AdminStub({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <div>
      <section className="rounded-3xl bg-omas-gradient p-6 text-white shadow-sm">
        <div className="text-3xl" aria-hidden>
          {icon}
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">
          {title}
        </h1>
      </section>
      <section className="mt-6 rounded-2xl bg-[color:var(--color-surface)] p-6 ring-1 ring-[color:var(--color-border)] text-center">
        <div className="text-2xl" aria-hidden>
          🚧
        </div>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Section bientôt opérationnelle.
        </p>
      </section>
    </div>
  );
}
