import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const verifySignupSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received verification request:", body); // Debug log
    const { email, otpCode } = verifySignupSchema.parse(body);

    // Find valid pending signup
    const pendingSignup = await prisma.pendingSignup.findFirst({
      where: {
        email,
        otpCode,
        expiresAt: {
          gt: new Date(),
        },
        used: false,
      },
    });

    if (!pendingSignup) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Create the actual user account and delete pending signup
    await prisma.$transaction(async (tx) => {
      // Create user
      await tx.user.create({
        data: {
          email: pendingSignup.email,
          username: pendingSignup.username,
          passwordHash: pendingSignup.passwordHash,
          phoneNumber: pendingSignup.phoneNumber,
          gender: pendingSignup.gender,
          role: "USER",
        },
      });

      // Delete the pending signup
      await tx.pendingSignup.delete({
        where: { id: pendingSignup.id },
      });
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup verification error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify signup" },
      { status: 500 }
    );
  }
}
