import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/navigation/headers";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonClass } from "@/components/ui/button";

const steps = [
  "Create your queue",
  "Share the link or QR code",
  "Customers join from their phones",
  "Call the next person when ready",
];
const benefits = [
  "Less crowding around your counter",
  "Fewer questions about the wait",
  "Customers can wait somewhere else",
  "No app download or customer account",
  "Live position updates as the line moves",
];
const audiences = [
  "Barbers",
  "Salons",
  "Clinics",
  "Campus offices",
  "Repair shops",
  "Food vendors",
  "Walk-in services",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main>
      <PublicHeader user={user} />
      <section className="container-marketing grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24">
        <div>
          <p className="text-sm font-semibold text-[#17643a]">
            Digital queues for walk-in businesses
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-.045em] text-[#17201a] sm:text-6xl">
            Stop making customers stand around.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#667069]">
            Create a live digital queue in seconds. Share a link or QR code, let
            customers join from their phones, and manage the line in real time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className={buttonClass("primary")}
              href={user ? "/dashboard" : "/login"}
            >
              {user ? "Go to Dashboard" : "Create a Queue"}
            </Link>
            <a className={buttonClass("secondary")} href="#how-it-works">
              See How It Works
            </a>
          </div>
          <p className="mt-5 text-sm text-[#667069]">
            No download. No customer account. Just a queue that stays clear.
          </p>
        </div>
        <ProductPreview />
      </section>
      <section
        id="how-it-works"
        className="border-y border-[#dde3dd] bg-white py-16 sm:py-20"
      >
        <div className="container-marketing">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#17643a]">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">
              From walk-in to called next, without the confusion.
            </h2>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#dde3dd] bg-[#dde3dd] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step} className="bg-white p-6">
                <span className="text-sm font-semibold tabular-nums text-[#17643a]">
                  0{index + 1}
                </span>
                <p className="mt-8 text-base font-semibold leading-6 text-[#17201a]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-marketing grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-[#17643a]">
            A calmer waiting experience
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">
            Keep the line moving without keeping everyone in one place.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#667069]">
            QueueLite gives owners one focused screen for the line and gives
            each customer only the information they need.
          </p>
        </div>
        <ul className="divide-y divide-[#dde3dd] border-y border-[#dde3dd]">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex gap-3 py-4 text-sm font-medium text-[#17201a]"
            >
              <span className="text-[#17643a]" aria-hidden="true">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </section>
      <section className="border-y border-[#dde3dd] bg-white py-14">
        <div className="container-marketing">
          <p className="text-center text-sm font-semibold text-[#667069]">
            Built for everyday walk-in service
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-[#dde3dd] bg-[#f6f7f5] px-3 py-1.5 text-sm font-medium text-[#3f4942]"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="container-marketing py-16 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">
          Your next queue takes less than a minute to create.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#667069]">
          Give customers their time back and give your team a line that is
          simple to run.
        </p>
        <Link
          className={`${buttonClass("primary")} mt-7`}
          href={user ? "/dashboard" : "/login"}
        >
          {user ? "Go to Dashboard" : "Create a Queue"}
        </Link>
      </section>
      <footer className="border-t border-[#dde3dd] bg-white">
        <div className="container-marketing flex flex-col gap-3 py-8 text-sm text-[#667069] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="font-semibold text-[#17201a]">QueueLite</strong>{" "}
            · A lightweight digital waiting line.
          </p>
          <p>Customers wait on their terms.</p>
        </div>
      </footer>
    </main>
  );
}
