import Image from "next/image";
import { redirect } from "next/navigation";
import PinForm from "./PinForm";
import { getCurrentStaff } from "@/lib/auth/require";

export const metadata = { title: "Espace équipe" };

export default async function AdminLoginPage() {
  const session = await getCurrentStaff();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-dvh bg-mixte-gradient flex flex-col">
      <div className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col px-6 py-10">
        <div className="flex items-center justify-center gap-3 pt-6">
          <div className="rounded-full bg-white p-1.5 ring-2 ring-white/20 shadow">
            <Image
              src="/logo-omas.jpg"
              alt=""
              width={56}
              height={56}
              className="rounded-full"
              preload
            />
          </div>
          <span aria-hidden className="text-white/40 text-xl select-none">
            ×
          </span>
          <div className="rounded-full bg-[color:var(--color-twale-cream)] p-1.5 ring-2 ring-white/20 shadow">
            <Image
              src="/logo-twale.jpeg"
              alt=""
              width={56}
              height={56}
              className="rounded-full"
              preload
            />
          </div>
        </div>

        <div className="mt-8 text-center text-white">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold">
            Espace équipe
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Code à 6 chiffres
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-[color:var(--color-surface)] p-6 shadow-xl ring-1 ring-white/30">
          <PinForm />
          <p className="mt-4 text-center text-xs text-[color:var(--color-muted)]">
            Accès réservé aux organisateurs et arbitres.
          </p>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] text-white/60">
          Village santé & Tournoi multisports · 14 juin 2026
        </p>
      </div>
    </main>
  );
}
