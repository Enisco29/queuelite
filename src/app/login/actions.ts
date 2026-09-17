"use server";

import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export async function sendMagicLink(_previous: { message: string; error: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { message: "", error: "Enter a valid email address." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${serverEnv().appUrl}/auth/callback` },
  });
  if (error) return { message: "", error: error.message };
  return { message: "Check your email for your secure sign-in link.", error: "" };
}
