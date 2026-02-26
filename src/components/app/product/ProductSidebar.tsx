"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowUpCircle,
  MessageSquare,
  Calendar,
  Eye,
  Zap,
  User,
} from "lucide-react";
import { AppDetail } from "@/lib/app-data";
import { GlowCard } from "@/components/ui/GlowCard";

interface ProductSidebarProps {
  app: AppDetail;
  relatedApps: AppDetail[];
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function ProductSidebar({ app, relatedApps }: ProductSidebarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <aside
      ref={ref}
      className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-24 lg:self-start space-y-6"
    >
      {/* Related products */}
      {relatedApps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <GlowCard>
            <h4 className="typo-caption font-semibold mb-5 text-[var(--color-text-secondary)] uppercase tracking-wider">
              Sản phẩm liên quan
            </h4>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-3"
            >
              {relatedApps.slice(0, 5).map((ra) => (
                <motion.div key={ra.id} variants={staggerItem}>
                  <Link
                    href={`/app/${ra.slug}`}
                    className="flex items-center gap-3 group/rel p-2 -mx-2 rounded-xl hover:bg-[var(--color-bg)]/60 transition-colors"
                  >
                    <img
                      src={ra.icon}
                      alt={ra.name}
                      className="w-10 h-10 rounded-xl object-cover bg-white shrink-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="typo-body font-semibold truncate group-hover/rel:text-[var(--color-accent)] transition-colors"
                        style={{ fontSize: 14 }}
                      >
                        {ra.name}
                      </p>
                      <p className="typo-caption text-[var(--color-text-secondary)] truncate">
                        {ra.tagline}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="typo-caption text-[var(--color-text-secondary)] flex items-center gap-0.5">
                          <ArrowUpCircle size={10} /> {ra.score || 5}
                        </span>
                        <span className="typo-caption text-[var(--color-text-secondary)] flex items-center gap-0.5">
                          <MessageSquare size={10} /> 0
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <Link
              href="/app"
              className="inline-block typo-caption font-semibold text-[var(--color-accent)] hover:underline mt-4"
            >
              Xem tất cả →
            </Link>
          </GlowCard>
        </motion.div>
      )}

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <GlowCard>
          <h4 className="typo-caption font-semibold mb-5 text-[var(--color-text-secondary)] uppercase tracking-wider">
            Thống kê
          </h4>
          <div className="space-y-3">
            {[
              {
                icon: <Calendar size={14} />,
                label: "Ra mắt:",
                value: app.releaseDate || "09/02/2026",
              },
              {
                icon: <Eye size={14} />,
                label: "Lượt xem:",
                value: app.views || 9,
              },
              {
                icon: <Zap size={14} />,
                label: "Điểm:",
                value: app.score || 18,
              },
              {
                icon: <User size={14} />,
                label: "Nhà phát triển:",
                value: app.author,
              },
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="typo-caption flex items-center gap-2 text-[var(--color-text-secondary)]">
                    {stat.icon} {stat.label}
                  </span>
                  <span
                    className="typo-body font-semibold"
                    style={{ fontSize: 14 }}
                  >
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </motion.div>
    </aside>
  );
}
