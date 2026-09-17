import { DemoAdmin } from "@/components/owner/demo-admin";
import { assertDemoEnabled, getDemoState } from "@/lib/server/demo";

export const dynamic = "force-dynamic";

export default async function DemoAdminPage() {
  assertDemoEnabled();
  return <DemoAdmin initialState={await getDemoState()} />;
}
