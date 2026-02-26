"use client";

import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "pill";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm shadow-[var(--color-accent)]/20",
  secondary: "bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90",
  ghost: "text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)]",
  outline:
    "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] hover:bg-[var(--color-bg-alt)] bg-transparent",
  pill: "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20 hover:shadow-lg hover:shadow-[var(--color-accent)]/30 hover:scale-[1.03]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-[13px] gap-1.5",
  md: "px-5 py-2 text-sm gap-2",
  lg: "px-8 py-3 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-ring ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <motion.div whileTap={{ scale: 0.97 }} className="inline-flex">
        <Link href={href} className={cls} {...rest}>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </Link>
      </motion.div>
    );
  }

  const btnProps = props as ButtonAsButton;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cls}
      type={btnProps.type}
      disabled={btnProps.disabled}
      onClick={btnProps.onClick}
      aria-label={btnProps["aria-label"]}
      title={btnProps.title}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
