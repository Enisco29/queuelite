import Link from "next/link";

export default function NotFound() {
  return <main className="container-page py-24 text-center"><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-black">Queue not found</h1><p className="mt-3 text-neutral-600">Check the link or ask the business for a new one.</p><Link className="button mt-7" href="/">Back home</Link></main>;
}
