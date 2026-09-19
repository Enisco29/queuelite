export default function DashboardLoading() {
  return <div className="container-app py-8" aria-busy="true"><div className="h-8 w-52 rounded-lg bg-[#e8ece8]" /><div className="mt-3 h-4 w-72 max-w-full rounded bg-[#edf0ed]" /><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="h-48 rounded-2xl border border-[#dde3dd] bg-white" /><div className="h-48 rounded-2xl border border-[#dde3dd] bg-white" /></div><span className="sr-only">Loading dashboard</span></div>;
}
