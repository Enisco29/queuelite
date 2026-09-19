export function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return <div><p className="text-2xl font-bold tabular-nums tracking-[-.035em] text-neutral-950">{value}</p><p className="mt-1 text-sm text-neutral-600">{label}</p></div>;
}
