import Link from "next/link";
import { requireOwnerSession } from "@/lib/server/auth";
import { logout } from "./actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireOwnerSession();
  return (
    <main>
      <nav className="border-b border-neutral-200 bg-white" aria-label="Owner navigation">
        <div className="container-page flex min-h-16 items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-sm font-bold text-neutral-950">Queues</Link>
            <Link href="/dashboard/queues/new" className="hidden text-sm font-semibold text-neutral-600 hover:text-neutral-950 sm:block">New queue</Link>
          </div>
          <div className="flex items-center gap-3"><span className="hidden max-w-56 truncate text-xs text-neutral-500 sm:block">{user.email}</span><form action={logout}><Button variant="quiet" type="submit">Sign out</Button></form></div>
        </div>
      </nav>
      <div className="container-page py-7 sm:py-10">{children}</div>
    </main>
  );
}
