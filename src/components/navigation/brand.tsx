import Link from "next/link";

export function Brand() {
  return <Link href="/" className="interactive rounded-lg text-lg font-bold tracking-[-.035em] text-[#17201a] focus-visible:outline-none">Queue<span className="text-[#17643a]">Lite</span></Link>;
}

export function CompactBrandHeader() {
  return <header className="border-b border-[#dde3dd] bg-white"><div className="container-app flex h-16 items-center"><Brand /></div></header>;
}
