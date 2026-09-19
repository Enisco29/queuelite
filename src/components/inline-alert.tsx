export function InlineAlert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" }) {
  return <div role="alert" className={`rounded-xl border px-4 py-3 text-sm font-medium leading-6 ${tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>{children}</div>;
}
