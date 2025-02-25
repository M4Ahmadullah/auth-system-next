import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-500",
        className
      )}
    >
      {/* Ultra subtle background blur */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/[0.01]" />

      {/* Subtle animated border */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-purple-500/[0.02] to-white/[0.02] animate-gradient-xy" />

      {/* Main glass container */}
      <div className="relative backdrop-blur-xl border border-white/[0.02] bg-transparent">
        {/* Ultra subtle shine */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent rotate-[60deg] transform-gpu" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent -rotate-[60deg] transform-gpu" />
        </div>

        {/* Ethereal light effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/[0.02] rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/[0.02] rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content area */}
        <div className="relative z-10 p-8 backdrop-blur-md bg-black/[0.01]">
          <div className="relative">{children}</div>
        </div>
      </div>

      {/* Extremely subtle edge highlights */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
      <div className="absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />

      {/* Almost invisible noise texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.005] mix-blend-overlay pointer-events-none" />
    </div>
  );
};
