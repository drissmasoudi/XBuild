import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost";
    size?: "default" | "lg";
    asChild?: boolean;
  }
>;

export function Button({
  children,
  className,
  variant = "default",
  size = "default",
  asChild,
  ...props
}: ButtonProps) {
  const cls = [
    "btn",
    variant === "ghost" ? "btn-ghost" : "btn-primary",
    size === "lg" ? "btn-lg" : "",
    className ?? ""
  ]
    .join(" ")
    .trim();

  if (asChild) {
    return <span className={cls}>{children}</span>;
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
