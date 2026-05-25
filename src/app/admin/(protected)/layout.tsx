import { requireStaff } from "@/lib/auth/require";
import AdminNav from "../AdminNav";

export const metadata = { title: "Admin" };

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();

  return (
    <div className="min-h-dvh bg-[color:var(--color-background)]">
      <AdminNav
        displayName={staff.display_name}
        role={staff.role}
        sport={staff.sport}
      />
      <main className="mx-auto max-w-screen-sm px-4 py-6">{children}</main>
    </div>
  );
}
