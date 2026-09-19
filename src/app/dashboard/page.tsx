import Link from "next/link";
import { getOwnerQueueSummaries } from "@/lib/server/owner-dashboard";
import { StatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const summaries = await getOwnerQueueSummaries();
  const active = summaries.filter(({ queue }) => queue.status !== "closed");
  const closed = summaries.filter(({ queue }) => queue.status === "closed");
  const totalWaiting = active.reduce(
    (total, item) => total + item.waitingCount,
    0,
  );
  return (
    <>
      <div className="flex flex-col gap-5 border-b border-[#dde3dd] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#17643a]">
            Owner dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">
            Your queues
          </h1>
          <p className="mt-2 text-sm text-[#667069]">
            See what needs attention and move each line forward.
          </p>
        </div>
        <Link href="/dashboard/queues/new" className={buttonClass("primary")}>
          Create Queue
        </Link>
      </div>
      {summaries.length > 0 && (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#dde3dd] bg-[#dde3dd] sm:grid-cols-3">
          <div className="bg-white p-5">
            <p className="text-2xl font-semibold tabular-nums text-[#17201a]">
              {active.length}
            </p>
            <p className="mt-1 text-sm text-[#667069]">active queues</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-2xl font-semibold tabular-nums text-[#17201a]">
              {totalWaiting}
            </p>
            <p className="mt-1 text-sm text-[#667069]">people waiting</p>
          </div>
          <div className="col-span-2 bg-white p-5 sm:col-span-1">
            <p className="text-2xl font-semibold tabular-nums text-[#17201a]">
              {active.filter(({ queue }) => queue.status === "open").length}
            </p>
            <p className="mt-1 text-sm text-[#667069]">open now</p>
          </div>
        </div>
      )}
      <section id="my-queues" className="mt-8 scroll-mt-32">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-[-.02em] text-[#17201a]">
            Active queues
          </h2>
          <span className="text-sm text-[#667069]">{active.length}</span>
        </div>
        {active.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {active.map((item) => (
              <QueueSummaryCard key={item.queue.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <EmptyState
              title="No active queues"
              description={
                closed.length
                  ? "Reopen a closed queue or create a new one when you are ready."
                  : "Create your first queue, then share its link with customers."
              }
              action={
                <Link
                  href="/dashboard/queues/new"
                  className={buttonClass("primary")}
                >
                  Create a Queue
                </Link>
              }
            />
          </Card>
        )}
      </section>
      {closed.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#17201a]">
              Closed queues
            </h2>
            <span className="text-sm text-[#667069]">{closed.length}</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {closed.map((item) => (
              <QueueSummaryCard key={item.queue.id} item={item} quiet />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function QueueSummaryCard({
  item,
  quiet = false,
}: {
  item: Awaited<ReturnType<typeof getOwnerQueueSummaries>>[number];
  quiet?: boolean;
}) {
  const { queue, waitingCount, serving, estimatedWaitMinutes } = item;
  return (
    <article
      className={`rounded-2xl border border-[#dde3dd] bg-white p-5 ${quiet ? "opacity-80" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-[-.015em] text-[#17201a]">
            {queue.name}
          </h3>
          <p className="mt-1 truncate text-xs text-[#667069]">
            /q/{queue.slug}
          </p>
        </div>
        <StatusBadge status={queue.status} />
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-[#edf0ed] py-4">
        <div>
          <dt className="text-xs text-[#667069]">Waiting</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-[#17201a]">
            {waitingCount}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-[#667069]">Now serving</dt>
          <dd className="mt-1 truncate text-sm font-semibold text-[#17201a]">
            {serving?.customer_name ?? "Not serving"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#667069]">Est. wait</dt>
          <dd className="mt-1 text-sm font-semibold text-[#17201a]">
            ~{estimatedWaitMinutes} min
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[#667069]">
          {queue.average_service_minutes} min average service
        </p>
        <Link
          href={`/dashboard/queues/${queue.id}`}
          className={buttonClass(
            quiet ? "secondary" : "primary",
            false,
            "small",
          )}
        >
          Manage
        </Link>
      </div>
    </article>
  );
}
