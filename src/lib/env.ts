function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function publicEnv() {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function serverEnv() {
  return {
    ...publicEnv(),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

export function isDemoAdminEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_ADMIN === "true";
}
