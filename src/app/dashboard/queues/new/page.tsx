import { createQueue } from "@/app/dashboard/actions";

export default function NewQueuePage() {
  return <div className="mx-auto max-w-xl"><p className="eyebrow">New queue</p><h1 className="mt-2 text-4xl font-black tracking-tight">Open your waiting line</h1>
    <form action={createQueue} className="card mt-8 space-y-5 p-7 sm:p-9">
      <div><label className="label" htmlFor="name">Queue name</label><input className="input" id="name" name="name" minLength={2} maxLength={100} required placeholder="e.g. Ade’s Barbershop" /></div>
      <div><label className="label" htmlFor="slug">Public link</label><div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:border-green-700 focus-within:ring-3 focus-within:ring-green-700/10"><span className="pl-3 text-sm text-neutral-400">/q/</span><input className="min-w-0 flex-1 border-0 bg-transparent p-3 outline-none" id="slug" name="slug" minLength={3} maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" required placeholder="ades-barbershop" /></div></div>
      <div><label className="label" htmlFor="averageServiceMinutes">Average service time (minutes)</label><input className="input" id="averageServiceMinutes" name="averageServiceMinutes" type="number" defaultValue="10" min="1" max="240" required /></div>
      <button className="button w-full" type="submit">Create queue</button>
    </form>
  </div>;
}
