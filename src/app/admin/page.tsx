import { DemoAdmin } from "@/components/owner/demo-admin";
import { assertDemoEnabled, getDemoState } from "@/lib/server/demo";
import { CompactBrandHeader } from "@/components/navigation/brand";

export const dynamic = "force-dynamic";

export default async function DemoAdminPage() {
  assertDemoEnabled();
  return <><CompactBrandHeader /><DemoAdmin initialState={await getDemoState()} /></>;
}
