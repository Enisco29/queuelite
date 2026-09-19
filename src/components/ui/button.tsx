import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "small" | "default";

export function buttonClass(
  variant: ButtonVariant = "primary",
  full = false,
  size: ButtonSize = "default",
) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#17643a] hover:bg-[#125331] focus-visible:ring-[#17643a]",
    secondary:
      "border border-[#c8d0c9] bg-white text-[#17201a] hover:bg-[#f6f7f5] focus-visible:ring-[#667069]",
    quiet:
      "bg-transparent text-[#3f4942] hover:bg-[#f6f7f5] focus-visible:ring-[#667069]",
    danger:
      "bg-[#b42318] text-white hover:bg-[#921d14] focus-visible:ring-[#b42318]",
  };
  const sizes: Record<ButtonSize, string> = {
    small: "min-h-10 px-3 py-2",
    default: "min-h-11 px-4 py-2.5",
  };
  return `interactive inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""}`;
}

export function Button({
  variant = "primary",
  size = "default",
  full = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}) {
  return (
    <button
      className={`${buttonClass(variant, full, size)} ${className}`}
      {...props}
    />
  );
}
