"use client";

import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
        <div className="h-[400px] rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
        <div className="text-center text-white/70">
          Please sign in to view your dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-white/[0.05] bg-black/10 backdrop-blur-xl"
      >
        {/* Profile Header */}
        <div className="p-8 flex items-start gap-6 border-b border-white/[0.05]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600/80 to-pink-600/80 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white">
              {user.username}
            </h1>
            <p className="text-white/70 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white">
                Account Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/50">Username</label>
                  <p className="mt-1 text-white">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50">Email</label>
                  <p className="mt-1 text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50">User ID</label>
                  <p className="mt-1 text-white font-mono text-sm">
                    #{user.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white">Security</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/50">Password</label>
                  <p className="mt-1 text-white">••••••••</p>
                </div>
                <div className="pt-2">
                  <Link href="/dashboard/change-password">
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Change Password
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-8 border-t border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/50">
              Member since{" "}
              <span className="text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <Link href="/dashboard/edit-profile">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
