import { createServiceClient } from "@/lib/supabase/service";

export const revalidate = 30;

type ScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  category: string | null;
};

const CATEGORY_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  ouverture: { label: "Ouverture",  color: "#1F9E94", bg: "rgba(31,158,148,0.10)" },
  tournoi:   { label: "Tournoi",    color: "#2B2C82", bg: "rgba(43,44,130,0.10)" },
  sante:     { label: "Santé",      color: "#5B2A86", bg: "rgba(91,42,134,0.10)" },
  pause:     { label: "Pause",      color: "#A87B00", bg: "rgba(168,123,0,0.10)" },
  podium:    { label: "Podium",     color: "#B83A3A", bg: "rgba(184,58,58,0.10)" },
  cloture:   { label: "Clôture",    color: "#374151", bg: "rgba(55,65,81,0.10)" },
};

async function getSchedule(): Promise<ScheduleItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,description,starts_at,ends_at,location,category")
    .order("starts_at", { ascending: true });
  if (error || !data) return [];
  return data;
}

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

export const metadata = { title: "Planning" };

export default async function PlanningPage() {
  const items = await getSchedule();
  const now = new Date();

  return (
    <main className="min-h-dvh">
      <header className="bg-omas-gradient text-white">
        <div className="mx-auto max-w-screen-sm px-6 pt-8 pb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Dimanche 14 juin 2026</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">Planning</h1>
          <p className="mt-2 text-sm text-white/85">Le déroulé de la journée, heure par heure.</p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-sm px-4 py-6">
        {items.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--color-muted)] py-12">Planning non disponible.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item) => {
              const cat = item.category ? CATEGORY_STYLE[item.category] : undefined;
              const start = new Date(item.starts_at);
              const end = item.ends_at ? new Date(item.ends_at) : null;
              const isCurrent = end && start <= now && now <= end;
              const isPast = end && now > end;
              return (
                <li
                  key={item.id}
                  className={`flex gap-4 rounded-2xl bg-white p-4 ring-1 transition ${
                    isCurrent
                      ? "ring-[color:var(--color-omas-teal)] shadow-lg shadow-[color:var(--color-omas-teal)]/10"
                      : "ring-[color:var(--color-border)]"
                  } ${isPast ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col items-center w-16 shrink-0 pt-0.5">
                    <div className="text-base font-bold font-mono tabular-nums text-[color:var(--color-omas-navy)]">
                      {formatHour(item.starts_at)}
                    </div>
                    {end && (
                      <div className="text-[10px] font-mono tabular-nums text-[color:var(--color-muted)]">
                        → {formatHour(item.ends_at!)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[color:var(--color-foreground)] text-balance">{item.title}</h3>
                      {cat && (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5"
                          style={{ color: cat.color, backgroundColor: cat.bg }}
                        >
                          {cat.label}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[color:var(--color-omas-teal)] text-white px-2 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> En cours
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-[color:var(--color-muted)] leading-relaxed">{item.description}</p>
                    )}
                    {item.location && (
                      <p className="mt-1.5 text-xs text-[color:var(--color-muted)]">📍 {item.location}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
