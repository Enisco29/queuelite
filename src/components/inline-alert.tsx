export function InlineAlert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" }) {
  return <div role="alert" className={`rounded-xl px-4 py-3 text-sm font-semibold ${tone === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{children}</div>;
}
