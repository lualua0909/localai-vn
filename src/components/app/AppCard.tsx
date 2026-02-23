import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Star, TrendingUp } from "lucide-react";
import type { AppDetail } from "@/lib/app-data";

export type AppItem = {
  name: string;
  slug?: string;
  desc?: string;
  tagline?: string;
  category: string;
  rating: string | number;
  reviews?: string;
  reviewsCount?: string;
  trending?: boolean;
  icon?: string;
};

export function AppCard({ app }: { app: AppItem | AppDetail }) {
  const slug =
    (app as AppDetail).slug ||
    (app as AppItem).slug ||
    app.name.toLowerCase().replace(/\s+/g, "");

  const reviews =
    (app as AppItem).reviews || (app as AppDetail).reviewsCount || "0";
  const icon = (app as AppDetail).icon;

  return (
    <Link
      href={`/app/${slug}`}
      className="glass-card border-none flex cursor-pointer items-start gap-3 rounded-2xl p-4 shadow-md transition-transform hover:scale-[1.02] relative"
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <img
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
        src={
          icon ||
          `https://placehold.co/60x60/eee/white?text=${app.name.charAt(0)}`
        }
        alt={app.name}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold leading-tight truncate">
            {app.name}
          </p>
        </div>
        <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)] truncate">
          {app.category}
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          <Star size={10} className="text-amber-500" />
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {app.rating} ({reviews})
          </span>
          {app.trending && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 shrink-0">
              <TrendingUp size={10} />
              Trending
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
