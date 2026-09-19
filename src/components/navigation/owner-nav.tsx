"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [{ href: "/dashboard", label: "Dashboard", exact: true }];

export function OwnerNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1" aria-label="Owner navigation">
      {links.map((link) => {
        const active =
          link.label === "My Queues"
            ? pathname.startsWith("/dashboard/queues/") &&
              pathname !== "/dashboard/queues/new"
            : link.exact && pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`interactive inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold focus-visible:outline-none ${active ? "bg-[#edf6f0] text-[#125331]" : "text-[#667069] hover:bg-[#f6f7f5] hover:text-[#17201a]"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
