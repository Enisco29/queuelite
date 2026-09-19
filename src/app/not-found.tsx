import Link from "next/link";
import { CompactBrandHeader } from "@/components/navigation/brand";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return <><CompactBrandHeader /><main className="container-narrow py-20 text-center sm:py-28"><p className="text-sm font-semibold text-[#17643a]">404</p><h1 className="mt-3 text-4xl font-bold tracking-[-.035em] text-[#17201a]">Queue not found</h1><p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#667069]">Check the link or ask the business for a current queue link.</p><Link className={`${buttonClass("primary")} mt-7`} href="/">Back home</Link></main></>;
}
