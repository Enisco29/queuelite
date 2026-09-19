export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="px-6 py-12 text-center"><div className="mx-auto flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500" aria-hidden="true">—</div><h3 className="mt-4 text-base font-bold text-neutral-950">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-600">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
