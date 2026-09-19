export function InlineAlert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" | "neutral" }) {
  const styles = { error: "border-red-200 bg-red-50 text-red-800", success: "border-green-200 bg-green-50 text-green-800", neutral: "border-[#dde3dd] bg-[#f6f7f5] text-[#3f4942]" };
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium leading-6 ${styles[tone]}`}>{children}</div>;
}
