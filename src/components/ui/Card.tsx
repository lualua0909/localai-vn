import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`glass-card rounded-3xl p-6 sm:p-8 ${
        hover
          ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
