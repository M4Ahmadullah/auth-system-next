"use client";

import { navigationLinks } from "@/lib/constants/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationLinksProps {
  mobile?: boolean;
}

export const NavigationLinks = ({ mobile }: NavigationLinksProps) => {
  const pathname = usePathname();

  return (
    <div
      className={`flex ${mobile ? "flex-col space-y-4" : "flex-row space-x-1"}`}
    >
      {navigationLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              mobile
                ? "text-white/70 hover:text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLink"
                className="absolute inset-0 bg-white/[0.08] rounded-lg"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{link.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
