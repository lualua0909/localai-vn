const variants = {
  accent:
    "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20",
  success: "text-green-600 bg-green-500/10 border-green-500/20",
  warning: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  error: "text-red-600 bg-red-500/10 border-red-500/20",
  neutral: "text-gray-600 bg-gray-500/10 border-gray-500/20",
};

const sizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[11px] px-2.5 py-0.5",
};

interface BadgeProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "accent",
  size = "sm",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-block font-semibold uppercase tracking-wider rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
