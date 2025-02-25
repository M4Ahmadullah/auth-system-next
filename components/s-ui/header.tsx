"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavigationLinks } from "./navigation-links";
import Link from "next/link";
import SignoutButton from "./signout-button";
import { useAuth } from "@/hooks/use-auth";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, isLoading } = useAuth();

  // Debug log
  useEffect(() => {
    console.log("Header auth state:", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 0);
  });

  const renderAuthButtons = () => {
    if (isLoading) {
      return <div className="h-10 w-20 bg-white/5 animate-pulse rounded-lg" />;
    }

    return isAuthenticated ? (
      <SignoutButton />
    ) : (
      <>
        <Link href="/auth/sign-in">
          <Button variant="ghost" className="text-white">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            Sign Up
          </Button>
        </Link>
      </>
    );
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      {/* Glass background effect */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/[0.01] border-b border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] via-transparent to-pink-500/[0.02]" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent rotate-[60deg]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent -rotate-[60deg]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <nav className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/80 to-pink-600/80 backdrop-blur-sm border border-white/10" />
            <span className="text-white font-semibold text-xl">Authy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationLinks />
            <div className="pl-4 flex items-center space-x-2">
              {renderAuthButtons()}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-white/5 text-white"
                  size="icon"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-white/[0.05]">
                <SheetHeader className="pr-6">
                  <SheetTitle className="text-white">Navigation</SheetTitle>
                  <SheetDescription className="text-white/70">
                    Access all pages and features
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 flex flex-col space-y-8 pr-6">
                  <NavigationLinks mobile />
                  <div className="flex flex-col space-y-2">
                    {renderAuthButtons()}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};
