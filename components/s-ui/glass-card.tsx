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
        "bg-gradient-to-b from-gray-900/80 to-black/80", // Dark base for mobile
        "sm:bg-transparent", // Reset for desktop
        className
      )}
    >
      {/* Ultra subtle background blur */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/[0.01] sm:visible invisible" />

      {/* Subtle animated border */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-purple-500/[0.02] to-white/[0.02] animate-gradient-xy sm:visible invisible" />

      {/* Main glass container */}
      <div className="relative backdrop-blur-xl border border-white/[0.02] bg-transparent">
        {/* Ultra subtle shine - visible only on desktop */}
        <div className="absolute inset-0 sm:visible invisible">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent rotate-[60deg] transform-gpu" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent -rotate-[60deg] transform-gpu" />
        </div>

        {/* Ethereal light effects - adjusted for mobile */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/[0.02] rounded-full blur-3xl animate-pulse sm:visible invisible" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/[0.02] rounded-full blur-3xl animate-pulse delay-1000 sm:visible invisible" />

        {/* Content area - adjusted padding for mobile */}
        <div className="relative z-10 p-4 sm:p-8 backdrop-blur-md bg-black/[0.01]">
          <div className="relative">{children}</div>
        </div>
      </div>

      {/* Extremely subtle edge highlights - visible only on desktop */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent sm:visible invisible" />
      <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent sm:visible invisible" />
      <div className="absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent sm:visible invisible" />

      {/* Almost invisible noise texture - adjusted for mobile */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.005] mix-blend-overlay pointer-events-none sm:visible invisible" />
    </div>
  );
};
