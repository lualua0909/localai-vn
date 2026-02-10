import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Star } from "lucide-react";

export type AppItem = {
  name: string;
  desc?: string;
  category: string;
  rating: string | number;
  reviews: string; // Intentionally allowing string for "2.1K" format
  reviewsCount?: string; // Alternative field name often used
};

export function AppCard({ app }: { app: AppItem }) {
  // Simple slug generation - ideally this would come from the data source
  const slug = app.name.toLowerCase().replace(/\s+/g, "");

  // Handle different data shape (explore page vs app-data)
  const reviews = app.reviews || app.reviewsCount || "0";

  return (
    <Link
      href={`/app/${slug}`}
      className="glass-card flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-transform hover:scale-[1.02] relative"
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={1.5}
      />
      <img
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
        src={`https://placehold.co/60x60/eee/white?text=${app.name.charAt(0)}`}
        alt={app.name}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight truncate">
          {app.name}
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)] truncate">
          {app.category}
        </p>
        <div className="mt-1.5 flex items-center gap-1">
          <Star size={10} className="text-amber-500" />
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {app.rating} ({reviews})
          </span>
        </div>
      </div>
    </Link>
  );
}
