import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 md:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="eyebrow">A calmer waiting line</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl">
            Less crowding.<br /><span className="text-green-700">More clarity.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600">
            Create a simple digital queue, share one link, and keep every walk-in customer up to date in real time.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="button px-6" href="/dashboard">Create a queue</Link>
            <Link className="button button-secondary px-6" href="/q/demo">Try the demo queue</Link>
          </div>
        </div>
        <div className="card relative overflow-hidden p-7 sm:p-10">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-lime-200/60" />
          <p className="eyebrow relative">Today’s queue</p>
          <div className="relative mt-8 rounded-2xl bg-green-900 p-7 text-white">
            <p className="text-sm font-bold text-green-200">You’re up next</p>
            <p className="mt-2 text-4xl font-black">Position 1</p>
            <p className="mt-5 text-green-100">Estimated wait: about 10 minutes</p>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/8 p-5"><p className="text-3xl font-black">3</p><p className="mt-1 text-sm text-neutral-500">waiting</p></div>
            <div className="rounded-2xl border border-black/8 p-5"><p className="text-3xl font-black">1</p><p className="mt-1 text-sm text-neutral-500">being served</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
