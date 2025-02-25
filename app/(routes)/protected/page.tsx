"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
      <div className="rounded-xl border border-white/[0.05] bg-black/10 backdrop-blur-xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">
          Admin Protected Page
        </h1>
        <p className="text-white/70">
          This page is only accessible to administrators.
        </p>
      </div>
    </div>
  );
}
