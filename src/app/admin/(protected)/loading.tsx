// Affiché instantanément pendant le rendu serveur de chaque page admin.
// Sans ce skeleton, la navigation reste figée sur l'écran précédent le temps
// du round-trip serveur + Supabase, ce qui donne une sensation de lag/freeze.
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-40 rounded-3xl bg-[color:var(--color-omas-cream)]" />
      <div className="space-y-3">
        <div className="h-20 rounded-2xl bg-[color:var(--color-omas-cream)]" />
        <div className="h-20 rounded-2xl bg-[color:var(--color-omas-cream)]" />
        <div className="h-20 rounded-2xl bg-[color:var(--color-omas-cream)]" />
      </div>
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
