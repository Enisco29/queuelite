import Link from "next/link";
import { requireOwnerSession } from "@/lib/server/auth";
import { StatusBadge } from "@/components/status-badge";
import type { Queue } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const { supabase } = await requireOwnerSession();
  const { data, error } = await supabase.from("queues").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const queues = data as Queue[];
  return (
    <>
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-green-700">Owner workspace</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-neutral-950 sm:text-4xl">Your queues</h1><p className="mt-2 text-sm text-neutral-600">Manage today’s lines or create a new one.</p></div><Link href="/dashboard/queues/new" className={buttonClass("primary")}>New queue</Link></div>
      {queues.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">{queues.map((queue) => (
          <Link key={queue.id} href={`/dashboard/queues/${queue.id}`} className="rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-green-300 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="truncate text-lg font-bold tracking-[-.02em] text-neutral-950">{queue.name}</h2><p className="mt-1 truncate text-sm text-neutral-500">/q/{queue.slug}</p></div><StatusBadge status={queue.status} /></div>
            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4"><p className="text-sm text-neutral-600">{queue.average_service_minutes} min average</p><span className="text-sm font-bold text-green-700">Manage →</span></div>
          </Link>
        ))}</div>
      ) : <Card className="mt-7"><EmptyState title="No queues yet" description="Create your first queue, then share its link with customers." action={<Link href="/dashboard/queues/new" className={buttonClass("primary")}>Create a queue</Link>} /></Card>}
    </>
  );
}
