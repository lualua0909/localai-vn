"use client";

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const gradients = [
  "from-indigo-500 to-cyan-400",
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

function getGradient(name: string) {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const initial = name ? name[0].toUpperCase() : "?";
  const gradient = getGradient(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}
