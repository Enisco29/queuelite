import { CompactBrandHeader } from "@/components/navigation/brand";

export default function QueueLoading() {
  return <><CompactBrandHeader /><main className="container-narrow py-8" aria-busy="true"><div className="h-8 w-64 max-w-full rounded-lg bg-[#e8ece8]" /><div className="mt-6 h-80 rounded-2xl border border-[#dde3dd] bg-white" /><span className="sr-only">Loading queue</span></main></>;
}
