"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginWithPin, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[color:var(--color-omas-teal)] py-3.5 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-[color:var(--color-omas-teal-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}

export default function PinForm() {
  const [state, formAction] = useActionState(loginWithPin, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="pin"
          className="block text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)] mb-2"
        >
          Code à 6 chiffres
        </label>
        <input
          id="pin"
          name="pin"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          placeholder="••••••"
          className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-5 py-4 text-center font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[0.4em] text-[color:var(--color-omas-navy)] placeholder:text-[color:var(--color-muted)]/40 focus:border-[color:var(--color-omas-teal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-omas-teal)]/30"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
