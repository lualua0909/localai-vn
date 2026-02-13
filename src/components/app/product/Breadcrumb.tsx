import Link from "next/link";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 typo-caption text-[var(--color-text-secondary)] mb-10"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="opacity-40">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-text)] font-semibold truncate">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </motion.nav>
  );
}
