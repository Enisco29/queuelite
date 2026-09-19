import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function buttonClass(variant: ButtonVariant = "primary", full = false) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700",
    secondary: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus-visible:ring-neutral-500",
    quiet: "bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500",
    danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700",
  };
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${full ? "w-full" : ""}`;
}

export function Button({ variant = "primary", full = false, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; full?: boolean }) {
  return <button className={`${buttonClass(variant, full)} ${className}`} {...props} />;
}
