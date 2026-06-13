"use client";

import { useActionState, useState } from "react";
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

function ClearAllButton({ onClear }: { onClear: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="intent"
      value="clear"
      disabled={pending}
      onClick={(e) => {
        if (
          !window.confirm(
            "Supprimer tous les liens live enregistrés ? La page Live publique n’affichera plus de vidéo.",
          )
        ) {
          e.preventDefault();
          return;
        }
        onClear();
      }}
      className="w-full rounded-2xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition active:scale-[0.99] hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Supprimer tous les liens enregistrés
    </button>
  );
}

export default function LiveLinksForm({ initial }: { initial: LiveStreams }) {
  const [state, formAction] = useActionState(updateLiveStreams, initialState);
  const [values, setValues] = useState<Record<keyof LiveStreams, string>>({
    foot: initial.foot ?? "",
    volley: initial.volley ?? "",
    sante: initial.sante ?? "",
  });

  const setField = (name: keyof LiveStreams, v: string) =>
    setValues((s) => ({ ...s, [name]: v }));
  const anyFilled = Object.values(values).some((v) => v.trim());

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
          <div className="relative">
            <input
              id={`live-${f.name}`}
              name={f.name}
              type="url"
              inputMode="url"
              value={values[f.name]}
              onChange={(e) => setField(f.name, e.target.value)}
              placeholder="https://cloud.xbotgo.net/share?shareEventId=…"
              className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 pr-11 text-sm text-[color:var(--color-omas-navy)] placeholder:text-[color:var(--color-muted)]/50 focus:border-[color:var(--color-omas-teal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]/30"
            />
            {values[f.name].trim() && (
              <button
                type="button"
                onClick={() => setField(f.name, "")}
                aria-label={`Effacer le lien ${f.label}`}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--color-muted)] transition hover:bg-red-50 hover:text-red-600"
              >
                <span aria-hidden className="text-lg leading-none">×</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          {state.cleared
            ? "Tous les liens ont été supprimés — la page Live publique n’affiche plus de vidéo."
            : "Liens enregistrés — visibles immédiatement sur la page Live du public."}
        </p>
      )}

      <SaveButton />

      {anyFilled && (
        <ClearAllButton onClear={() => setValues({ foot: "", volley: "", sante: "" })} />
      )}
    </form>
  );
}
