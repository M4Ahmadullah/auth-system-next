"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface VerifySignupProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onBack: () => void;
}

export function VerifySignup({ email, onVerify, onBack }: VerifySignupProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleComplete = async (value: string) => {
    try {
      setIsVerifying(true);
      setError("");
      await onVerify(value);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-semibold text-white">Verify Your Email</h1>
      </div>

      <div className="space-y-2">
        <p className="text-white/70">
          We sent a verification code to {email}. Please enter it below.
        </p>
      </div>

      <div className="space-y-4">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          disabled={isVerifying}
        >
          <div className="flex gap-4 items-center justify-center">
            <InputOTPGroup>
              <InputOTPSlot
                index={0}
                className="bg-white/5 border-white/10 text-white"
              />
              <InputOTPSlot
                index={1}
                className="bg-white/5 border-white/10 text-white"
              />
              <InputOTPSlot
                index={2}
                className="bg-white/5 border-white/10 text-white"
              />
            </InputOTPGroup>
            <InputOTPSeparator className="text-white/50">-</InputOTPSeparator>
            <InputOTPGroup>
              <InputOTPSlot
                index={3}
                className="bg-white/5 border-white/10 text-white"
              />
              <InputOTPSlot
                index={4}
                className="bg-white/5 border-white/10 text-white"
              />
              <InputOTPSlot
                index={5}
                className="bg-white/5 border-white/10 text-white"
              />
            </InputOTPGroup>
          </div>
        </InputOTP>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => code.length === 6 && handleComplete(code)}
          disabled={code.length !== 6 || isVerifying}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-white/70">Did not receive the code?</p>
          <Button
            variant="ghost"
            className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
            onClick={onBack}
          >
            Send again
          </Button>
        </div>
      </div>
    </div>
  );
}
