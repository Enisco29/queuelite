import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/dashboard" className="eyebrow">Owner dashboard</Link><p className="mt-1 text-sm text-neutral-500">{user.email}</p></div>
        <form action={logout}><button className="button button-secondary" type="submit">Sign out</button></form>
      </div>
      {children}
    </main>
  );
}
