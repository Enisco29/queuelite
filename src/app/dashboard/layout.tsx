import { requireOwnerSession } from "@/lib/server/auth";
import { OwnerHeader } from "@/components/navigation/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireOwnerSession();
  return (
    <main><OwnerHeader email={user.email ?? "Signed in"} />
      <div className="container-app py-7 sm:py-10">{children}</div>
    </main>
  );
}
