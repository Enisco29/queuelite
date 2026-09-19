export function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return <div><p className="text-2xl font-semibold tabular-nums tracking-[-.025em] text-[#17201a]">{value}</p><p className="mt-1 text-sm text-[#667069]">{label}</p></div>;
}
