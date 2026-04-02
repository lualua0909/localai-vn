import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GLOW_DEFAULTS } from "@/components/ui/glow-defaults";
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
      className="card-interactive glass-card border-none flex cursor-pointer items-start gap-3 p-4 relative"
    >
      <GlowingEffect {...GLOW_DEFAULTS} />
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
        <p className="mt-0.5 meta-text truncate">
          {app.category}
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          <Star size={10} className="text-amber-500" />
          <span className="meta-text-sm">
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
