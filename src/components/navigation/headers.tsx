import Link from "next/link";
import { logout } from "@/app/dashboard/actions";
import { buttonClass, Button } from "@/components/ui/button";
import { Brand } from "./brand";
import { OwnerNav } from "./owner-nav";

function AccountMenu({ email }: { email: string }) {
  return (
    <details className="relative">
      <summary className="interactive flex min-h-10 cursor-pointer list-none items-center rounded-lg border border-[#dde3dd] bg-white px-3 text-sm font-semibold text-[#17201a] hover:bg-[#f6f7f5] focus-visible:outline-none">
        Account
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-[#dde3dd] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,18,.1)]">
        <p className="truncate px-2 py-2 text-xs text-[#667069]">{email}</p>
        <form action={logout}>
          <Button full variant="quiet" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </details>
  );
}

export function OwnerHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dde3dd] bg-white">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between gap-4">
          <Brand />
          <div className="hidden md:block">
            <OwnerNav />
          </div>
          <AccountMenu email={email} />
        </div>
        <div className="overflow-x-auto border-t border-[#edf0ed] py-2 md:hidden">
          <OwnerNav />
        </div>
      </div>
    </header>
  );
}

export function PublicHeader({
  user,
}: {
  user?: { email?: string | null } | null;
}) {
  if (user)
    return (
      <header className="border-b border-[#dde3dd] bg-white">
        <div className="container-marketing">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <Brand />
            <nav
              className="hidden items-center gap-1 sm:flex"
              aria-label="Public navigation"
            >
              <Link
                className="interactive inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#667069] hover:bg-[#f6f7f5] hover:text-[#17201a]"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <AccountMenu email={user.email ?? "Signed in"} />
            </nav>
            <nav className="sm:hidden">
              <AccountMenu email={user.email ?? "Signed in"} />
            </nav>
          </div>
          <nav
            className="flex items-center gap-1 border-t border-[#edf0ed] py-2 sm:hidden"
            aria-label="Public navigation"
          >
            <Link
              className="interactive inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#17201a] hover:bg-[#f6f7f5]"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
    );
  return (
    <header className="border-b border-[#dde3dd] bg-white">
      <div className="container-marketing flex min-h-16 items-center justify-between gap-3">
        <Brand />
        <nav className="flex items-center gap-1" aria-label="Public navigation">
          <Link
            className="interactive inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#17201a] hover:bg-[#f6f7f5]"
            href="/login"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
