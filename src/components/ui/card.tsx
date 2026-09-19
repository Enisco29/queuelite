export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-neutral-200 bg-white ${className}`}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
    <div>{eyebrow && <p className="text-xs font-bold uppercase tracking-[.12em] text-green-700">{eyebrow}</p>}<h2 className={`${eyebrow ? "mt-1" : ""} text-lg font-bold tracking-[-.02em] text-neutral-950`}>{title}</h2></div>
    {action}
  </div>;
}
