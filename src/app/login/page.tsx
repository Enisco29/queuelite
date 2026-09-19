import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { CompactBrandHeader } from "@/components/navigation/brand";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  const { error } = await searchParams;
  return <><CompactBrandHeader /><main className="container-narrow max-w-md py-12 sm:py-16"><LoginForm oauthFailed={error === "oauth_failed"} /><p className="mt-5 text-center text-xs leading-5 text-[#667069]">Secure owner access through Google and Supabase.</p></main></>;
}
