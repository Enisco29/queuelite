export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="px-6 py-12 text-center"><h3 className="text-base font-semibold text-[#17201a]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667069]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
