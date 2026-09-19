import { createQueue } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/server/auth";

export default async function NewQueuePage() {
  await requireOwnerSession();
  return <div className="mx-auto max-w-xl"><p className="text-sm font-semibold text-green-700">New queue</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-neutral-950 sm:text-4xl">Open your waiting line</h1><p className="mt-2 text-sm leading-6 text-neutral-600">You can change the name and service time later. The public link stays with this queue.</p>
    <Card className="mt-7 p-5 sm:p-8"><form action={createQueue} className="space-y-5">
      <div><label className="field-label" htmlFor="name">Queue name</label><input className="text-input" id="name" name="name" minLength={2} maxLength={100} required placeholder="e.g. Ade’s Barbershop" /></div>
      <div><label className="field-label" htmlFor="slug">Public link</label><div className="flex min-h-12 items-center rounded-xl border border-neutral-300 bg-white focus-within:border-green-700 focus-within:ring-3 focus-within:ring-green-700/10"><span className="pl-3 text-sm text-neutral-400">/q/</span><input className="min-w-0 flex-1 border-0 bg-transparent p-3 outline-none" id="slug" name="slug" minLength={3} maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" required placeholder="ades-barbershop" /></div><p className="mt-2 text-xs text-neutral-500">Use lowercase letters, numbers, and hyphens.</p></div>
      <div><label className="field-label" htmlFor="averageServiceMinutes">Average service time</label><div className="relative"><input className="text-input pr-20" id="averageServiceMinutes" name="averageServiceMinutes" type="number" defaultValue="10" min="1" max="240" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">minutes</span></div></div>
      <Button full type="submit">Create queue</Button>
    </form></Card>
  </div>;
}
