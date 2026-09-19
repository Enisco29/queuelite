import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main>
      <section className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-14 py-14 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
        <div>
          <p className="text-sm font-bold text-green-700">Simple queues for walk-in businesses</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-.06em] text-neutral-950 sm:text-6xl lg:text-7xl">A waiting line everyone understands.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">Share one link, keep customers informed, and run your queue without crowded waiting rooms or complicated software.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClass("primary")} href="/dashboard">Create a queue</Link>
            <Link className={buttonClass("secondary")} href="/q/demo">View customer demo</Link>
          </div>
          <p className="mt-5 text-sm text-neutral-500">No app download. Customers join without an account.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
            <div><p className="text-sm font-bold text-neutral-950">Today’s queue</p><p className="mt-1 text-xs text-neutral-500">Friday, 18 September</p></div>
            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-800">Open</span>
          </div>
          <div className="p-6">
            <div className="rounded-xl bg-green-800 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-green-200">Now serving</p>
              <p className="mt-3 text-3xl font-bold tracking-[-.04em]">Amara O.</p>
              <p className="mt-2 text-sm text-green-100">Called just now</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-neutral-200 pb-3"><p className="text-sm font-bold text-neutral-950">Waiting</p><p className="text-sm font-semibold text-neutral-500">3 people</p></div>
            <ol className="divide-y divide-neutral-200">
              {["Tobi A.", "Maya K.", "Daniel E."].map((name, index) => <li key={name} className="flex items-center gap-3 py-3"><span className="flex size-8 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-800">{index + 1}</span><span className="text-sm font-semibold text-neutral-800">{name}</span></li>)}
            </ol>
          </div>
        </Card>
      </section>
    </main>
  );
}
