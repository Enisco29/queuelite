export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#dde3dd] bg-white ${className}`}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#dde3dd] px-5 py-4 sm:px-6">
    <div>{eyebrow && <p className="text-xs font-semibold uppercase tracking-[.1em] text-[#17643a]">{eyebrow}</p>}<h2 className={`${eyebrow ? "mt-1" : ""} text-lg font-semibold tracking-[-.01em] text-[#17201a]`}>{title}</h2></div>
    {action}
  </div>;
}
