import { createQueue } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/server/auth";
import Link from "next/link";

export default async function NewQueuePage() {
  await requireOwnerSession();
  return (
    <div className="mx-auto max-w-xl">
      <nav
        className="mb-6 flex items-center gap-2 text-sm text-[#667069]"
        aria-label="Breadcrumb"
      >
        <Link
          className="interactive rounded hover:text-[#17201a] focus-visible:outline-none"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Create Queue</span>
      </nav>
      <p className="text-sm font-semibold text-[#17643a]">New queue</p>
      <h1 className="mt-1 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">
        Open your waiting line
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#667069]">
        Choose a clear name and a realistic service time. You can change both
        later without changing the public link.
      </p>
      <Card className="mt-7 p-5 sm:p-8">
        <form action={createQueue} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="name">
              Queue name
            </label>
            <input
              className="text-input"
              id="name"
              name="name"
              minLength={2}
              maxLength={100}
              required
              placeholder="e.g. Ade’s Barbershop"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="slug">
              Public link
            </label>
            <div className="interactive flex min-h-12 items-center rounded-xl border border-[#c8d0c9] bg-white focus-within:border-[#17643a] focus-within:ring-3 focus-within:ring-[#17643a]/10">
              <span className="pl-3 text-sm text-[#929a94]">/q/</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent p-3 outline-none"
                id="slug"
                name="slug"
                minLength={3}
                maxLength={60}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                placeholder="ades-barbershop"
              />
            </div>
            <p className="mt-2 text-xs text-[#667069]">
              Use lowercase letters, numbers, and hyphens.
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="averageServiceMinutes">
              Average service time
            </label>
            <div className="relative">
              <input
                className="text-input pr-20"
                id="averageServiceMinutes"
                name="averageServiceMinutes"
                type="number"
                defaultValue="10"
                min="1"
                max="240"
                required
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#667069]">
                minutes
              </span>
            </div>
          </div>
          <Button full type="submit">
            Create Queue
          </Button>
        </form>
      </Card>
    </div>
  );
}
