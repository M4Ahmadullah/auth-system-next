import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a new ratelimiter that allows 5 requests per 15 minutes
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    // Check rate limit
    const { success, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000);

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Debug log
    console.log("Processing reset request for email:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Delete any existing reset codes for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Generated reset code:", resetCode);

    // Save the reset code
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code: resetCode,
        expiresAt,
      },
    });

    // Send email
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Code",
      html: `
        <h1>Password Reset</h1>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return NextResponse.json(
      { message: "Password reset code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send reset code" },
      { status: 500 }
    );
  }
}
