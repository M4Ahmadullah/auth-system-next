"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function SignoutButton() {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      await axios.get("/api/auth/signout");
      router.push("/");
    } catch {
      console.error("Error signing out");
    }
  };

  return (
    <Button
      onClick={handleSignout}
      className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
    >
      Sign Out
    </Button>
  );
}
