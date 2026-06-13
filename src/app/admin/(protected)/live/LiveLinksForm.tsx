"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateLiveStreams, type LiveActionState } from "@/actions/live";
import type { LiveStreams } from "@/lib/live";

const FIELDS: { name: keyof LiveStreams; label: string; icon: string }[] = [
  { name: "foot", label: "Caméra Foot (XbotGo)", icon: "⚽" },
  { name: "volley", label: "Caméra Volley (XbotGo)", icon: "🏐" },
  { name: "sante", label: "Village santé", icon: "💚" },
];

const initialState: LiveActionState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[color:var(--color-omas-teal)] py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-[color:var(--color-omas-teal-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Enregistrement…" : "Enregistrer les liens"}
    </button>
  );
}

export default function LiveLinksForm({ initial }: { initial: LiveStreams }) {
  const [state, formAction] = useActionState(updateLiveStreams, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label
            htmlFor={`live-${f.name}`}
            className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]"
          >
            <span aria-hidden>{f.icon}</span> {f.label}
          </label>
          <input
            id={`live-${f.name}`}
            name={f.name}
            type="url"
            inputMode="url"
            defaultValue={initial[f.name] ?? ""}
            placeholder="https://cloud.xbotgo.net/share?shareEventId=…"
            className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-omas-navy)] placeholder:text-[color:var(--color-muted)]/50 focus:border-[color:var(--color-omas-teal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]/30"
          />
        </div>
      ))}

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          Liens enregistrés — visibles immédiatement sur la page Live du public.
        </p>
      )}

      <SaveButton />
    </form>
  );
}
