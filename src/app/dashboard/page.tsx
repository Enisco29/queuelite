import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import type { Queue } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("queues").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const queues = data as Queue[];
  return (
    <>
      <div className="flex items-end justify-between gap-4"><div><h1 className="text-4xl font-black tracking-tight">Your queues</h1><p className="mt-2 text-neutral-600">Manage today’s line or create a new one.</p></div><Link href="/dashboard/queues/new" className="button">New queue</Link></div>
      {queues.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">{queues.map((queue) => (
          <Link key={queue.id} href={`/dashboard/queues/${queue.id}`} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">{queue.name}</h2><p className="mt-1 text-sm text-neutral-500">/q/{queue.slug}</p></div><StatusBadge status={queue.status} /></div>
            <p className="mt-6 text-sm font-semibold text-neutral-600">Average service: {queue.average_service_minutes} minutes</p>
          </Link>
        ))}</div>
      ) : <div className="card mt-8 p-10 text-center"><h2 className="text-xl font-black">No queues yet</h2><p className="mt-2 text-neutral-600">Create your first queue and share its public link.</p></div>}
    </>
  );
}
